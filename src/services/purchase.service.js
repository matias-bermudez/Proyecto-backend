// src/services/purchase.service.js
import { sendPurchaseTicketEmail } from '../utils/nodemailer.js';

export default class PurchaseService {
  constructor({ cartRepository, ticketRepository, productRepository = null, userRepository = null }) {
    this.cartRepo = cartRepository;
    this.ticketRepo = ticketRepository;
    this.prodRepo = productRepository;
    this.userRepo = userRepository;
  }

  async finalizeCartPurchase(userId, cartId) {
    const cart = await this.cartRepo.getById(cartId, { populated: true });
    if (!cart) throw new Error('Carrito no encontrado');
    if (cart.status === 'closed') throw new Error('El carrito ya fue finalizado');

    const items = Array.isArray(cart.products) ? cart.products : [];
    if (items.length === 0) throw new Error('No se puede finalizar un carrito vacío');

    const ticketItems = [];
    const rejected = [];

    // procesar cada item
    for (const it of items) {
      const quantity = Number(it.quantity || 0);
      const prodId = it.product && it.product._id ? String(it.product._id) : String(it.product);

      // obtener datos frescos
      let product = (it.product && it.product._id) ? it.product : null;
      if (!product && this.prodRepo && typeof this.prodRepo.getById === 'function') {
        product = await this.prodRepo.getById(prodId);
      }

      if (!product) {
        rejected.push({ product: prodId, requested: quantity, available: 0, reason: 'Producto no encontrado' });
        continue;
      }

      const available = Number(product.stock ?? 0);
      const unitPrice = Number(product.price ?? 0);

      if (available >= quantity && quantity > 0) {
        // actualizar stock mediante repo
        if (!this.prodRepo || typeof this.prodRepo.updateProduct !== 'function') {
          rejected.push({ product: prodId, requested: quantity, available, reason: 'Product repo no soporta update' });
          continue;
        }

        try {
          const newStock = Math.max(available - quantity, 0);
          await this.prodRepo.updateProduct(prodId, { stock: newStock });

          ticketItems.push({ product: prodId, quantity, unitPrice });

          // eliminar el item comprado del carrito
          if (typeof this.cartRepo.removeProduct === 'function') {
            await this.cartRepo.removeProduct(cartId, prodId);
          } else if (typeof this.cartRepo.addOrSetProductQuantity === 'function') {
            await this.cartRepo.addOrSetProductQuantity(cartId, prodId, 0);
          } else {
            console.warn('CartRepo: no hay método para remover item, dejarlo como está');
          }
        } catch (err) {
          rejected.push({ product: prodId, requested: quantity, available, reason: 'Error actualizando stock: ' + (err.message || '') });
        }
      } else {
        rejected.push({ product: prodId, requested: quantity, available, reason: 'Stock insuficiente' });
      }
    }

    // crear ticket si hay items comprados
    let ticket = null;
    if (ticketItems.length > 0) {
      const code = `TICKET-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const payload = {
        code,
        purchaser: userId,
        items: ticketItems,
        amount: ticketItems.reduce((s, it) => s + (Number(it.unitPrice) * Number(it.quantity)), 0)
      };
      ticket = await this.ticketRepo.createTicket(payload);
    }

    const updatedCart = await this.cartRepo.getById(cartId, { populated: false });
    const remaining = Array.isArray(updatedCart?.products) ? updatedCart.products.length : 0;
    if (remaining === 0 && typeof this.cartRepo.closeCart === 'function') {
      await this.cartRepo.closeCart(cartId);
    }

    try {
      let purchaserEmail = null;
      if (this.userRepo && typeof this.userRepo.getById === 'function') {
        const user = await this.userRepo.getById(userId);
        purchaserEmail = user?.email || null;
      }

      const productsMap = {};
      if (this.prodRepo && typeof this.prodRepo.getById === 'function') {
        for (const it of ticketItems) {
          try {
            const p = await this.prodRepo.getById(it.product);
            if (p) productsMap[String(it.product)] = { name: p.name };
          } catch (e) {}
        }
      }
      if (purchaserEmail && ticket) {
        await sendPurchaseTicketEmail(purchaserEmail, ticket, { rejected, productsMap });
        console.log('PurchaseService: mail enviado a', purchaserEmail);
      } else {
        console.warn('PurchaseService: no se envía mail (email faltante o no hay ticket)');
      }
    } catch (mailErr) {
      console.error('PurchaseService: fallo al enviar mail (no aborta compra):', mailErr);
    }

    return { ticket, rejected };
  }
}
