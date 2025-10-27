import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import bcrypt from 'bcrypt';
import UserDao from '../src/dao/user.dao.js';

const userDao = new UserDao()

export default function configurePassport() {
    passport.use('local', new LocalStrategy(
        { usernameField: 'identifier', passwordField: 'password', session: false },
        async (identifier, password, done) => {
        try {
            const looksLikeEmail = identifier.includes('@')
            const user = looksLikeEmail
            ? await userDao.findByEmail(identifier.trim().toLowerCase())
            : null

            if (!user) {
                return done(null, false, { message: 'Credenciales inválidas' })
            }

            const valid = await bcrypt.compare(password, user.password)
            if (!valid) {
                return done(null, false, { message: 'Credenciales inválidas' })
            }

            const safeUser = {
            id: user._id.toString(),
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            role: user.role,
            cart: user.cart
            }
            return done(null, safeUser)
        } catch (err) {
            return done(err)
        }
        }
    ))

    const jwtOptions = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET
    }

    passport.use('jwt', new JwtStrategy(jwtOptions, async (payload, done) => {
        try {
            const user = await userDao.getByID(payload.id)
            if (!user) {
                return done(null, false)
            } else {
                const safeUser = {
                    id: user._id.toString(),
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    role: user.role,
                    cart: user.cart
                }
                return done(null, safeUser)
            }
        } catch (err) {
            done(err, false)
        }
    }))
}
