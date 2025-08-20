const express = require('express')
const router = express.Router()
const config = require('../../config/config')

const ProductDao = require('../dao/product.dao')
const ProductService = require('../services/product.service')
const ProductController = require('../controllers/product.controller')

module.exports = router
