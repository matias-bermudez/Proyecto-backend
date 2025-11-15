import { Router } from 'express';
import { requireAuth, requireGuest } from '../utils/middlewares/auth.js';
import { PasswordResetModel } from '../db/models/passwordReset.model.js';
import UserDao from '../dao/user.dao.js';
import UserService from '../services/user.service.js';
import UserController from '../controllers/user.controller.js';

const router = Router()
const dao = new UserDao()
const service = new UserService(dao)
const controller = new UserController(service)

// Form de login/registro
router.get('/login', async (req, res, next) => {
    try {
        res.render('pages/login', { titulo: 'Login' })
    } catch (err) {
        next(err)
    }
})

router.post('/register', requireGuest, controller.createUser)
router.post('/login', requireGuest, controller.loginUser)

router.get('/profile', requireAuth, (req, res) => {
    res.render('pages/users/profile', { titulo: 'Mi perfil' })
})

router.get('/profile', requireAuth, async (req, res, next) => {
    try {
        const me = await service.getById(req.session.user.id)
        res.render('pages/users/profile', { titulo: 'Mi perfil', me })
    } catch (e) { next(e) }
})

router.post('/profile', requireAuth, controller.updateUser)

// Logout
router.post('/logout', requireAuth, (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid')
        res.clearCookie('cartId', { path: '/' })
        res.redirect('/')
    })
})

router.get('/forgot-password', requireGuest, (req, res) => {
    res.render('pages/users/forgot-password', { titulo: 'Olvidé mi contraseña' })
})

router.get("/reset-password", async (req, res) => {
    const { token } = req.query;

    const record = await PasswordResetModel.findOne({ token });

    if (!record || record.expiresAt < Date.now()) {
        return res.status(400).send("Token inválido o expirado");
    }

    res.render("pages/users/resetPassword", { token });
});


export default router
