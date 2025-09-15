// src/app.js
const express = require('express');
const app = express();

const handlebars = require('express-handlebars');
const { paths, getFilePath } = require('../config/config');

// DAOs + Service
const ProductDao = require('./dao/product.dao');
const CartDao = require('./dao/cart.dao');
const ProductService = require('./services/product.service');
const prodsDao = new ProductDao(getFilePath('product.json'));
const cartsDao = new CartDao(getFilePath('cart.json'));
const service = new ProductService(prodsDao, cartsDao);

// Routers API
const productRoutes = require('./routes/product.routes');
const cartRoutes = require('./routes/cart.routes');

// Handlebars
app.engine('hbs', handlebars.engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: paths.layouts,   
    partialsDir: paths.partials,   
    helpers: {
        json: (x) => JSON.stringify(x) // para inyectar datos iniciales en realtime
    }
}));
app.set('view engine', 'hbs');
app.set('views', paths.views);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/static', express.static(paths.public));

app.use('/api/products', productRoutes);
app.use('/api/carts', cartRoutes);

app.get('/', (_req, res) =>
  res.render('pages/home', { titulo: 'Inicio desde Handlebars' })
);

app.get('/realtimeproducts', async (req, res, next) => {
  try {
    const products = await service.getAllProds();
    res.render('pages/realTimeProducts', { products });
  } catch (e) { next(e); }
});

module.exports = app;
