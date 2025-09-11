const express = require('express')
const app = express()
const productRoutes = require('./routes/product.routes')
const cartRoutes = require('./routes/cart.routes')
const handlebars = require("express-handlebars")
const { paths } = require("../config/config")

app.engine(
    "hbs",
    handlebars.engine({
        extname: ".hbs",
        defaultLayout: "main",
    })
);

app.set("view engine", "hbs")
app.set("views", paths.views)

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use("/static", express.static(paths.public))

app.use('/api/products', productRoutes)
app.use('/api/carts', cartRoutes)

app.get('/', (_req, res) => res.render('pages/home', { titulo: 'Inicio desde Handlebars' }))


module.exports = app
