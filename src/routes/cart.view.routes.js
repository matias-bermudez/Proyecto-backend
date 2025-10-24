import mongoose from 'mongoose'
import express from 'express'
import CartDao from '../dao/cart.dao.js'
import CartService from '../services/cart.service.js'

const router = express.Router()
const cartDao = new CartDao()
const service = new CartService(cartDao)

router.get('/:cid', async (req, res, next) => {
    try {
        const { cid } = req.params

        if (!mongoose.Types.ObjectId.isValid(cid)) {
        const cart = await service.createCart()
        res.cookie('cartId', cart._id.toString(), {
            path: '/',
            maxAge: 30 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production'
        })
        return res.redirect(`/carts/${cart._id}`)
        }

        let cart = await service.getCartByID(cid, { populated: true })

        if (!cart) {
        cart = await service.createCart()
        res.cookie('cartId', cart._id.toString(), {
            path: '/',
            maxAge: 30 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production'
        });
        return res.redirect(`/carts/${cart._id}`)
        }

        const items = (cart.products || []).map(it => {
        const price = Number(it?.product?.price ?? 0)
        const qty   = Number(it?.quantity ?? 0)
        return { ...it, subtotal: Number((price * qty).toFixed(2)) }
        })
        const total = items.reduce((acc, it) => acc + it.subtotal, 0)

        return res.render('pages/carts/detail', {
        cart: { ...cart, products: items },
        total: total.toFixed(2)
        })
    } catch (e) {
        next(e)
    }
})

export default router;