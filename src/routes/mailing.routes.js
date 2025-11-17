import { transporter } from '../utils/nodemailer.js';
import { Router } from 'express';
const router = Router();
import crypto from 'crypto';
import {UserModel} from '../db/models/user.model.js';
import { PasswordResetModel } from '../db/models/passwordReset.model.js';
import bcrypt from 'bcrypt';

router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        const token = crypto.randomBytes(32).toString("hex");
        await PasswordResetModel.create({
            user: user._id,
            token,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hora
        });
        const resetLink = `${process.env.FRONTEND_URL}/users/reset-password?token=${token}`;
        await transporter.sendMail({
            from: `"Soporte" <${process.env.MAIL_USER}>`,
            to: email,
            subject: "Restablecer contraseña",
            html: `
                <h1>Recuperación de contraseña</h1>
                <p>Hacé click a continuacion para restablecer tu contraseña (expira en 1 hora):</p>
                <a href="${resetLink}" target="_blank">RESETEA ACA</a>
            `
        });
        res.json({ message: "Correo enviado si el usuario existe." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/reset-password", async (req, res) => {
    const { token, password, password2 } = req.body;

    if (!password || password !== password2) {
        return res.status(400).json({ error: "Las contraseñas no coinciden" });
    }

    const record = await PasswordResetModel.findOne({ token });

    if (!record || record.expiresAt < Date.now()) {
        return res.status(400).json({ error: "Token inválido o expirado" });
    }

    const user = await UserModel.findById(record.user);

    if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado" });
    }

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    await PasswordResetModel.deleteOne({ token });

    return res.redirect('/users/login');
});


export default router;