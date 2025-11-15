import express from 'express'
import { productService } from '../services/index.js'
import { productController } from '../controllers/index.js'
const router = express.Router()

router.get('/', productController.getProds);

router.get('/:pid', async (req, res, next) => {
    try {
        const prod = await productService.getProdByID(req.params.pid)
        if (!prod) {
            return res.status(404).send('Producto no encontrado')
        }
        return res.render('pages/products/detail', { product: prod })
    } catch (err) {
        next(err)
    }
})

export default router;