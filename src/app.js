//DB
import { connectDB } from "./db/connect.js";
import express from 'express';
import handlebars from 'express-handlebars';
import mongoose from 'mongoose';
import session from 'express-session';
import cookieParser from "cookie-parser";
import MongoStore from "connect-mongo";
import passport from 'passport';

import { paths } from '../config/config.js';
import configurePassport from '../config/passport.js';

import ProductDao from './dao/product.dao.js';
import ProductService from './services/product.service.js';

import productRoutes from './routes/product.routes.js';
import sessionRoutes from './routes/sessions.routes.js';
import cartRoutes from './routes/cart.routes.js';
import userRoutes from './routes/user.routes.js';

import userViewRoutes from './routes/user.view.routes.js';
import cartViewRoutes from './routes/cart.view.routes.js';
import productViewRoutes from './routes/product.view.routes.js';

const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-secret-change-me'
const SESSION_TTL_SECONDS = Number(process.env.SESSION_TTL_SECONDS || 3600)

await connectDB()

const app = express()
const prodsDao = new ProductDao()
const service = new ProductService(prodsDao)

configurePassport()
app.use(passport.initialize())

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

//Middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use('/static', express.static(paths.public))

app.use(cookieParser(SESSION_SECRET))

app.use(session({
  secret: SESSION_SECRET,      
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_TTL_SECONDS * 1000 //1h
  },
  store: MongoStore.create({
    client: mongoose.connection.getClient(),
    ttl: SESSION_TTL_SECONDS,                      
    collectionName: 'sessions'            
  })
}))

app.use((req, res, next) => {
  res.locals.user = req.session?.user || null
  next()
})

//Rutas API
app.use('/api/products', productRoutes)
app.use('/api/carts', cartRoutes)
app.use('/api/users', userRoutes)
app.use('/api/sessions', sessionRoutes)

//Vistas
app.use('/carts', cartViewRoutes) 
app.use('/products', productViewRoutes)
app.use('/users', userViewRoutes)

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
