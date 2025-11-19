import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { userToDto } from "../dto/user.dto.js";

const router = Router();

router.post('/login', (req, res, next) => {
    passport.authenticate('local', { session: false }, async (err, user, info) => {
        if (err) return next(err);

        if (!user) {
            return res.status(401).json({
                status: 'error',
                error: info?.message || 'Unauthorized'
            });
        }

        //Generar token JWT
        const payload = { id: user.id, email: user.email, role: user.role };
        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
        );

        // Guardar sesión
        if (!req.session) {
            console.error("ERROR: req.session no existe, middleware de sesión mal configurado.");
        } else {
            req.session.user = {
                id: String(user.id),
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role,
                cart: user.cart
            };

            await new Promise((resolve, reject) => {
                req.session.save(err => (err ? reject(err) : resolve()));
            });
        }

        const protectedUser = userToDto(user);

        return res.json({
            status: 'success',
            payload: { token, user: protectedUser }
        });
    })(req, res, next);
});

router.get('/current',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        const protectedUser = userToDto(req.user);
        return res.json({ status: 'success', payload: protectedUser });
    }
);

export default router;
