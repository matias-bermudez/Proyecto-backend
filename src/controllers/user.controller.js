import bcrypt from 'bcrypt';
import { wantsHTML } from '../utils/wants.js';

export default class UserController {
    constructor(userService) {
        this.userService = userService
    }

    getUsers = async (req, res, next) => {
        try {
            const users = await this.userService.getAllUsers()
            res.json({
                status: 'success',
                payload: users
            })
        } catch (err) {
            next(err)
        }
    }

    getUserByID = async (req, res, next) => {
        try {
            const { id } = req.params
            const user = await this.userService.getUserByID(id)
            if (!user) {
                return res.status(404).json({ msj: 'user no encontrado' })
            }
            return res.status(200).json(user)
        } catch (err) {
            next(err)
        }
    }

    createUser = async (req, res, next) => {
        try {
            const {
                first_name,
                last_name,
                email,
                age,
                password,
                role,
                redirectTo,
            } = req.body;
            if (!first_name || !last_name || !email || !age || !password) {
                if (wantsHTML(req)) {
                    return res.redirect('/users/login?error=Faltan%20datos')
                } else {
                    return res.status(400).json({ status: 'error', error: 'Faltan campos obligatorios' });
                }
            }

            const exists = await this.userService.findByIdentifier(email.trim().toLowerCase());
            if (exists) {
                if (wantsHTML(req)) {
                    return res.redirect('/users/login?error=Email%20ya%20registrado')
                } else {
                    return res.status(409).json({ status: 'error', error: 'Email ya registrado' });
                }
            }

            const hash = await bcrypt.hashSync(req.body.password, 10);
            const newUser = await this.userService.createUser({
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                email: req.body.email.trim().toLowerCase(),
                age: Number(req.body.age),
                password: hash,
                role: req.body.role || 'user'
            });

            //login automático tras el registro
            req.session.user = {
                id: newUser._id.toString(),
                first_name: newUser.first_name,
                last_name: newUser.last_name,
                email: newUser.email,
                role: newUser.role,
                cartId: newUser.cart ? newUser.cart.toString() : null
            };
            
            if (wantsHTML(req)) return res.redirect(redirectTo || '/');
            res.status(201).json({ status: 'success', payload: { id: user._id } })
        } catch (err) {
            next(err)
        }
    }

    deleteUser = async (req, res, next) => {
        try {
            const { id } = req.params
            const ok = await this.userService.deleteUser(id)
            if (!ok) return res.status(404).json({ msj: 'user no encontrado' })
            return res.status(200).json({ msj: 'user eliminado' })
        } catch (err) {
            next(err)
        }
    }

    loginUser = async (req, res, next) => {
        try {
            const { identifier , password, redirectTo } = req.body
            if (!identifier  || !password) {
                if (wantsHTML(req)) {
                    return res.redirect('/users/login?error=Faltan%20credenciales');
                } else {
                    return res.status(400).json({ msj: 'Faltan datos' })
                }
            }

            const user = await this.userService.findByIdentifier(identifier)
            if (!user) {
                if (wantsHTML(req)) {
                    return res.redirect('/users/login?error=Credenciales%20inv%C3%A1lidas');
                } else {
                    return res.status(401).json({ status: 'error', error: 'Credenciales inválidas' });
                }
            }

            const success = await bcrypt.compare(password, user.password)
            if (!success) {
                if (wantsHTML(req)) {
                    return res.redirect('/users/login?error=Credenciales%20inv%C3%A1lidas');
                } else {
                    return res.status(401).json({ status: 'error', error: 'Credenciales inválidas' });
                }
            }

            req.session.user = {
                id: user._id.toString(),
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role,
                cartId: user.cart ? user.cart.toString() : null
            };

            if (wantsHTML(req)) {
                return res.redirect(redirectTo || '/');
            } else {
                return res.json({ status: 'success', payload: { user: req.session.user } });
            }
        } catch (err) {
            next(err)
        }
    }

    updateUser = async (req, res, next) => {
        try {
            const { first_name, last_name, age } = req.body;
            const id = req.session.user.id;

            const updated = await this.userService.updateProfile(id, {
                first_name,
                last_name,
                age: Number(age)
            });

            req.session.user.first_name = updated.first_name;
            req.session.user.last_name  = updated.last_name;
            req.session.user.age        = updated.age;

            return res.redirect('/'); // vuelve a la vista
        } catch (e) {
            next(e);
        }
        }
}