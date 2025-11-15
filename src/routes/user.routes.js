import { Router } from 'express';
import { userController } from '../controllers/index.js';

const router = Router()

router.get('/', userController.getUsers)
router.get('/:id', userController.getUserByID)
router.post('/register', userController.createUser)
router.post('/login', userController.loginUser)
router.delete('/:id', userController.deleteUser)

export default router