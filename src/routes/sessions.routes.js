import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { userToDto } from "../dto/user.dto.js";

const router = Router()

router.post('/login', (req, res, next) => {
    passport.authenticate('local', { session: false }, async (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({ status: 'error', error: info?.message || 'Unauthorized' });
        }
        const payload = { id: user.id, email: user.email, role: user.role };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h' });
        const protectedUser = userToDto(user);

        const wantsSession = req.headers['x-create-session'] === '1' || req.body?.createSession === true;

        const userId = user._id ?? user.id ?? null;
        if (!userId) {
            console.error('sessions.login: user found but missing id/_id', user);
            return res.status(500).json({ status: 'error', error: 'Usuario inválido (sin id)' });
        }

        if (wantsSession && req.session) {
            req.session.user = {
                id: String(userId),
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role,
                cartId: user.carts && user.carts.length ? String(user.carts[0]) : null
            };
            await new Promise((resolve, reject) => {
                req.session.save(err => (err ? reject(err) : resolve()));
            });
        }
        return res.json({ status: 'success', payload: { token, user: protectedUser } });
    })(req, res, next);
});

router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
    let protectedUser = userToDto(req.user)
    return res.json({ status: 'success', payload: protectedUser })
})

export default router