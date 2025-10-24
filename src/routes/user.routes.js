import { Router } from 'express';
const router = Router()

import UserDao from '../dao/user.dao.js';
import UserService from '../services/user.service.js';
import UserController from '../controllers/user.controller.js';

const dao = new UserDao()
const service = new UserService(dao)
const controller = new UserController(service)

router.get('/', controller.getUsers)

router.get('/:id', controller.getUserByID)

router.post('/register', controller.createUser)

router.post('/login', controller.loginUser)

router.delete('/:id', controller.deleteUser)

export default router