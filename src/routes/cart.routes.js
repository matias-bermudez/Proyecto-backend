const express = require('express');
const router = express.Router();
const config = require('../../config/config');

const CartDao = require('../dao/cart.dao');
const ProductDao = require('../dao/product.dao');
const CartService = require('../services/cart.service');
const CartController = require('../controllers/cart.controller');

const cartDao = new CartDao(config.getFilePath('cart.json'));
const prodsDao = new ProductDao(config.getFilePath('product.json')); 

const service = new CartService(cartDao, prodsDao);
const controller = new CartController(service);

router.get('/', controller.getCarts);
router.get('/:id', controller.getCartByID);
router.post('/', controller.createCart);
router.put('/:id', controller.updateCart);
router.delete('/:id', controller.deleteCart);

module.exports = router;
