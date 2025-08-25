const express = require('express')
const app = express()
const productRoutes = require('./src/routes/product.routes');
const cartRoutes = require('./src/routes/cart.routes');

app.use(express.json())

app.use('/api/products', productRoutes);
app.use('/api/carts', cartRoutes);

app.get('/', (_req, res) => res.json({ ok: true, service: 'backend ok' }));

module.exports = app;
