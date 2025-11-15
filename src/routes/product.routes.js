import express from 'express'
const router = express.Router()
import { requireRole } from '../utils/middlewares/auth.js'
import passport from 'passport'
import { productController } from '../controllers/index.js'
import { productService } from '../services/index.js'
router.get('/', productController.getProds)

router.get('/:id', async (req, res, next) => {
    try {
        const prod = await productService.getProdByID(req.params.id)
        if (!prod) {
            return res.status(404).json({ status: 'error', error: 'Product not found' })
        }
        return res.json({ status: 'success', payload: prod })
    } catch (err) {
        next(err)
    }
})

router.post('/', passport.authenticate('jwt', {session:false}), requireRole('admin'), productController.createProd)
router.put('/:id', passport.authenticate('jwt', {session:false}), requireRole('admin'), productController.updateProd)
router.delete('/:id', passport.authenticate('jwt', {session:false}), requireRole('admin'), productController.deleteProd)

export default router
