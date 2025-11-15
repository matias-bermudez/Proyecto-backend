import mongoose from 'mongoose'
import express from 'express'
import { cartService } from '../services/index.js'
import { userDao } from '../dao/index.js'

const router = express.Router()

router.post('/:cid/finalize', async (req, res, next) => {
  try {
    const user = req.session?.user
    if(!user) {
      return res.redirect('/login')
    }
    const { cid } = req.params
    if (!mongoose.Types.ObjectId.isValid(cid)) {
      return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' })
    }
    const result = await cartService.finalizeCart(cid)
    if (!result.ok) {
      return res.status(result.code).json({ status: 'error', error: result.msg })
    }

    await userDao.addCartToUser(user.id, cid)
    res.setHeader(
      'Set-Cookie',
      `cartId=; Path=/; Max-Age=0`
    )

    return res.json({ status: 'success', message: 'Compra finalizada' });
  } catch (e) {
    next(e)
  }
})

router.get('/current/id', async (req, res, next) => {
  try {
    let cid = req.cookies.cartId
    if (cid && !mongoose.Types.ObjectId.isValid(cid)) {
      cid = null
    }
    if (cid) {
      const cart = await cartService.getCartByID(cid)   
      if (!cart || cart.status === 'closed') {
        cid = null
      }
    }
    if (!cid) {
      const fresh = await cartService.createCart()
      cid = fresh._id.toString()
      res.cookie('cartId', cid, {
        path: '/',
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      })
    }
    return res.json({ status: 'success', cartId: cid })
  } catch (e) {
    next(e)
  }
})

router.get('/:cid', async (req, res, next) => {
  try {
    const { cid } = req.params
    if (!mongoose.Types.ObjectId.isValid(cid)) {
      return res.status(404).json({ status: 'error', error: 'Cart not found' })
    }

    const cart = await service.getCartByID(cid, { populated: true })
    if (!cart) {
      return res.status(404).json({ status: 'error', error: 'Cart not found' })
    }

    return res.json({ status: 'success', payload: cart })
  } catch (e) {
    next(e)
  }
})

router.put('/:cid', async (req, res, next) => {
  try {
    const { products } = req.body
    if (!Array.isArray(products)) {
      return res.status(400).json({ status: 'error', error: 'products debe ser array' })
    }
    const updated = await cartService.replaceAllProducts(req.params.cid, products)
    if (!updated) {
      return res.status(404).json({ status: 'error', error: 'Cart not found' })
    }
    res.json({ status: 'success', payload: updated })
  } catch (e) {
    next(e)
  }
})

router.put('/:cid/products/:pid', async (req, res, next) => {
  try {
    const q = parseInt(req.body?.quantity)
    if (!Number.isInteger(q) || q < 1) {
      return res.status(400).json({ status: 'error', error: 'quantity inválida' })
    }
    const updated = await cartService.setProductQuantity(req.params.cid, req.params.pid, q)
    if (!updated) {
      return res.status(404).json({ status: 'error', error: 'Cart not found' })
    }
    res.json({ status: 'success', payload: updated })
  } catch (e) {
    next(e)
  }
})

router.delete('/:cid/products/:pid', async (req, res, next) => {
  try {
    const updated = await cartService.removeProduct(req.params.cid, req.params.pid)
    if (!updated) {
      return res.status(404).json({ status: 'error', error: 'Cart not found' })
    }
    res.json({ status: 'success', payload: updated })
  } catch (e) {
    next(e)
  }
})

router.delete('/:cid', async (req, res, next) => {
  try {
    const updated = await cartService.emptyCart(req.params.cid)
    if (!updated) {
      return res.status(404).json({ status: 'error', error: 'Cart not found' })
    }
    res.json({ status: 'success', payload: updated })
  } catch (e) {
    next(e)
  }
})

export default router
