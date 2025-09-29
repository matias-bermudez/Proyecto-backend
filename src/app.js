//DB
import { connectDB } from "./db/connect.js";
import express from 'express'
import handlebars from 'express-handlebars'
import { paths } from '../config/config.js'
import ProductDao from './dao/product.dao.js'
import CartDao from './dao/cart.dao.js'
import ProductService from './services/product.service.js'
import productRoutes from './routes/product.routes.js'
import cartRoutes from './routes/cart.routes.js'

await connectDB();
const app = express()
const prodsDao = new ProductDao()
const service = new ProductService(prodsDao)

app.engine('hbs', handlebars.engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: paths.layouts,   
    partialsDir: paths.partials,   
    helpers: {
        json: (x) => JSON.stringify(x) ,
        multiply: (a, b) => (Number(a) * Number(b)).toFixed(2),
        toFixed: (n, d) => Number(n).toFixed(d ?? 2),
        eq: (a, b) => String(a) === String(b)
    }
}))

app.set('view engine', 'hbs')
app.set('views', paths.views)

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use('/static', express.static(paths.public))

//Rutas API
app.use('/api/products', productRoutes)
app.use('/api/carts', cartRoutes)

//Vistas
app.use('/carts', cartRoutes) 
app.use('/products', productRoutes)

app.get('/', (_req, res) =>
  res.render('pages/home', { titulo: 'Inicio desde Handlebars' })
)

app.get('/realtimeproducts', async (req, res, next) => {
  try {
    const products = await service.getAllProds()
    res.render('pages/realTimeProds', { products })
  } catch (e) {
    next(e)
  }
})

export default app
