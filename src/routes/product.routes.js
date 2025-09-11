const express = require('express');
const router = express.Router();
const config = require('../../config/config');

const ProductDao = require('../dao/product.dao');
const CartDao = require('../dao/cart.dao');                 
const ProductService = require('../services/product.service');
const ProductController = require('../controllers/product.controller');

const dao = new ProductDao(config.getFilePath('product.json'));
const cartDao = new CartDao(config.getFilePath('cart.json')); 
const service = new ProductService(dao, cartDao); 
const controller = new ProductController(service);

router.get('/', async (req, res, next) => {
    try {
        const products = await service.getAllProds();
        return res.render('pages/products', {products});
    } catch (err) {
        next(err);
    }
});

router.get('/:id', controller.getProdByID);
router.post('/', controller.createProd);
router.put('/:id', controller.updateProd);
router.delete('/:id', controller.deleteProd);

module.exports = router;
