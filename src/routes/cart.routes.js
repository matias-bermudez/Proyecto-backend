import mongoose from 'mongoose'
import express from 'express'
import { requireRole } from '../utils/middlewares/auth.js'
import { purchaseService } from '../services/index.js';
import { userDao } from '../dao/index.js';
import { cartService } from '../services/index.js';

const router = express.Router()


router.post('/:cid/finalize', async (req, res, next) => {
  try {
    const sessionUser = req.session?.user;
    if (!sessionUser) {
      const wantsHTML = (req.headers.accept || '').includes('text/html');
      if (wantsHTML) {
        return res.redirect('/users/login?error=auth');
      } else {
        return res.status(401).json({ status: 'error', error: 'No autenticado' });
      }
    }

    const { cid } = req.params;
    if (!mongoose.Types.ObjectId.isValid(cid)) {
      return res.status(404).json({ status: 'error', error: 'Carrito no válido' });
    }

    const result = await purchaseService.finalizeCartPurchase(sessionUser.id, cid);

    if (!result || (result.ticket === null && (!result.rejected || result.rejected.length === 0))) {
      return res.status(400).json({ status: 'error', error: result?.message || 'No se pudo finalizar la compra' });
    }

    const newCart = await cartService.createCart();
    await userDao.addCartToUser(sessionUser.id, newCart._id);
    req.session.user.cartId = newCart._id.toString();

    res.setHeader('Set-Cookie', `cartId=; Path=/; Max-Age=0`);

    return res.json({
      status: result.rejected && result.rejected.length ? 'partial' : 'success',
      ticket: result.ticket || null,
      rejected: result.rejected || []
    });
  } catch (e) {
    next(e);
  }
});

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

    const cart = await cartService.getCartByID(cid, { populated: true })
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

router.put('/:cid/products/:pid', requireRole('user'),async (req, res, next) => {
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

router.delete('/:cid/products/:pid', requireRole('user'),async (req, res, next) => {
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
