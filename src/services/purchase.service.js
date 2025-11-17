// src/services/purchase.service.js
export default class PurchaseService {
    constructor({ cartRepository, ticketRepository, productRepository = null }) {
        this.cartRepo = cartRepository;
        this.ticketRepo = ticketRepository;
        this.prodRepo = productRepository;
    }

    /**
     * Finaliza el carrito: crea un ticket con los items actuales y marca el carrito como closed.
     * No descuenta stock ni realiza complejidades.
     * Devuelve { ok: true, ticket } o lanza Error.
     */
    async finalizeCartPurchase(userId, cartId) {
        // obtener carrito poblado (necesitamos los products con price)
        const cart = await this.cartRepo.getById(cartId, { populated: true });
        if (!cart) throw new Error('Carrito no encontrado');

        if (cart.status === 'closed') {
        throw new Error('El carrito ya fue finalizado');
        }

        const items = Array.isArray(cart.products) ? cart.products : [];
        if (items.length === 0) {
        throw new Error('No se puede finalizar un carrito vacío');
        }

        // construir items para ticket: usar precio del producto poblado, si no está, intentar obtener por repo
        const ticketItems = [];
        let total = 0;

        for (const it of items) {
        const prod = it.product; // si está poblado será objeto, sino id
        let unitPrice = null;
        let prodId = null;

        if (prod && prod._id) {
            prodId = prod._id;
            unitPrice = typeof prod.price === 'number' ? prod.price : null;
        } else {
            prodId = it.product;
            // si no está poblado y pasaste productRepository, intentamos obtener precio
            if (this.prodRepo) {
            const fresh = await this.prodRepo.getById(prodId);
            if (fresh) unitPrice = fresh.price;
            }
        }

        if (unitPrice == null) {
            // si no tenemos precio, lo dejamos 0 pero podés decidir lanzar error
            unitPrice = 0;
        }

        ticketItems.push({
            product: prodId,
            quantity: it.quantity,
            unitPrice
        });

        total += unitPrice * it.quantity;
        }

        const code = `TICKET-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const ticketPayload = {
        code,
        purchaser: userId,
        items: ticketItems,
        amount: total
        };

        // crear ticket
        console.log('>>> purchase.service: will create ticket with payload', {
  purchaser: ticketPayload.purchaser,
  itemsCount: ticketPayload.items.length,
  amount: ticketPayload.amount
});

        const ticket = await this.ticketRepo.createTicket(ticketPayload);

        // marcar carrito como closed (y registrar fecha si querés)
        await this.cartRepo.closeCart(cartId);

        return { ticket };
    }
}
