import mongoose from 'mongoose'
import express from 'express'
import { cartService } from '../services/index.js'

const router = express.Router()

router.get('/', async (req, res, next) => {
    try {
        let cid = req.cookies?.cartId || null
        if (!cid) {
            const cart = await cartService.createCart()
            cid = cart._id.toString()
            res.cookie('cartId', cid, {
                path: '/',
                maxAge: 30 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production'
            })
        }
        return res.redirect(`/carts/${cid}`)
    } catch (e) {
        next(e)
    }
})

router.get('/:cid', async (req, res, next) => {
    try {
        const { cid } = req.params

        if (!mongoose.Types.ObjectId.isValid(cid)) {
        const cart = await cartService.createCart()
        res.cookie('cartId', cart._id.toString(), {
            path: '/',
            maxAge: 30 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production'
        })
        return res.redirect(`/carts/${cart._id}`)
        }

        let cart = await cartService.getCartByID(cid, { populated: true })

        if (!cart) {
        cart = await cartService.createCart()
        res.cookie('cartId', cart._id.toString(), {
            path: '/',
            maxAge: 30 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production'
        })
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

export default router