import express from 'express'
const router = express.Router()

import ProductDao from '../dao/product.dao.js'
import ProductService from '../services/product.service.js'
import ProductController from '../controllers/product.controller.js'

const dao = new ProductDao()
const service = new ProductService(dao)
const controller = new ProductController(service)

router.get('/', controller.getProds)

router.get('/view/:pid', async (req, res, next) => {
    try {
        const prod = await service.getProdByID(req.params.pid)
        if (!prod) {
            return res.status(404).send('Producto no encontrado')
        }
        return res.render('pages/products/detail', { product: prod })
    } catch (err) {
        next(err)
    }
})

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

router.post('/', controller.createProd)
router.put('/:id', controller.updateProd)
router.delete('/:id', controller.deleteProd)

export default router
