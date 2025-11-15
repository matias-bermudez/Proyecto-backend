import express from 'express'
const router = express.Router()
import { requireRole } from '../utils/middlewares/auth.js'
import passport from 'passport'
import ProductDao from '../dao/product.dao.js'
import ProductService from '../services/product.service.js'
import ProductController from '../controllers/product.controller.js'

const dao = new ProductDao()
const service = new ProductService(dao)
const controller = new ProductController(service)

router.get('/', controller.getProds)

router.get('/:id', async (req, res, next) => {
    try {
        const prod = await service.getProdByID(req.params.id)
        if (!prod) {
            return res.status(404).json({ status: 'error', error: 'Product not found' })
        }
        return res.json({ status: 'success', payload: prod })
    } catch (err) {
        next(err)
    }
})

router.post('/', passport.authenticate('jwt', {session:false}), requireRole('admin'),controller.createProd)
router.put('/:id', passport.authenticate('jwt', {session:false}), requireRole('admin'),controller.updateProd)
router.delete('/:id', passport.authenticate('jwt', {session:false}), requireRole('admin'),controller.deleteProd)

export default router
