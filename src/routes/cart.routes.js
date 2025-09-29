import mongoose from 'mongoose'
import express from 'express'
import CartDao from '../dao/cart.dao.js'
import CartService from '../services/cart.service.js'

const router = express.Router()
const cartDao = new CartDao()
const service = new CartService(cartDao)

//helpers cookie
function readCartId(req) {
  const raw = req.headers.cookie || ''
  const f = raw.split(';').map(s => s.trim()).find(s => s.startsWith('cartId='))
  return f ? decodeURIComponent(f.split('=')[1]) : null
}

function setCartCookie(res, cartId) {
  res.setHeader('Set-Cookie', `cartId=${encodeURIComponent(cartId)}; Path=/; Max-Age=${60*60*24*30}`)
}

//vistas 
router.get('/', async (req, res, next) => {
  try {
    let cid = readCartId(req)
    if (!cid) {
      const cart = await service.createCart()
      cid = cart._id.toString()
      setCartCookie(res, cid)
    }
    return res.redirect(`/carts/view/${cid}`)
  } catch (e) {
    next(e)
  }
})

router.get('/view/:cid', async (req, res, next) => {
  try {
    const { cid } = req.params

    if (!mongoose.Types.ObjectId.isValid(cid)) {
      const cart = await service.createCart()
      setCartCookie(res, cart._id.toString())
      return res.redirect(`/carts/view/${cart._id}`)
    }

    let cart = await service.getCartByID(cid, { populated: true })

    if (!cart) {
      cart = await service.createCart()
      setCartCookie(res, cart._id.toString())
      return res.redirect(`/carts/view/${cart._id}`)
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

router.post('/:cid/finalize', async (req, res, next) => {
  try {
    const { cid } = req.params;
    if (!mongoose.Types.ObjectId.isValid(cid)) {
      return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });
    }
    const result = await service.finalizeCart(cid);
    if (!result.ok) {
      return res.status(result.code).json({ status: 'error', error: result.msg });
    }
    res.setHeader(
      'Set-Cookie',
      `cartId=; Path=/; Max-Age=0`
    );

    return res.json({ status: 'success', message: 'Compra finalizada' });
  } catch (e) {
    next(e);
  }
});


router.get('/current/id', async (req, res, next) => {
  try {
    let cid = readCartId(req)
    if (cid && !mongoose.Types.ObjectId.isValid(cid)) {
      cid = null
    }
    if (cid) {
      const cart = await service.getCartByID(cid)   
      if (!cart || cart.status === 'closed') {
        cid = null
      }
    }
    if (!cid) {
      const fresh = await service.createCart()
      cid = fresh._id.toString()
      setCartCookie(res, cid) 
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
    const updated = await service.replaceAllProducts(req.params.cid, products)
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
    const updated = await service.setProductQuantity(req.params.cid, req.params.pid, q)
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
    const updated = await service.removeProduct(req.params.cid, req.params.pid)
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
    const updated = await service.emptyCart(req.params.cid)
    if (!updated) {
      return res.status(404).json({ status: 'error', error: 'Cart not found' })
    }
    res.json({ status: 'success', payload: updated })
  } catch (e) {
    next(e)
  }
})

export default router
