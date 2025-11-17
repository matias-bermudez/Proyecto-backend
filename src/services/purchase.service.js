export default class PurchaseService {
    constructor({ cartRepository, ticketRepository, productRepository = null }) {
        this.cartRepo = cartRepository;
        this.ticketRepo = ticketRepository;
        this.prodRepo = productRepository;
    }

    /**
     * Finaliza el carrito: crea un ticket con los items actuales y marca el carrito como closed.
     */
    async finalizeCartPurchase(userId, cartId) {
        const cart = await this.cartRepo.getById(cartId, { populated: true });
        if (!cart) {
            throw new Error('Carrito no encontrado');
        }
        if (cart.status === 'closed') {
            throw new Error('El carrito ya fue finalizado');
        }
        const items = Array.isArray(cart.products) ? cart.products : [];
        if (items.length === 0) {
            throw new Error('No se puede finalizar un carrito vacío');
        }

        const ticketItems = [];
        let total = 0;

        for (const it of items) {
            const prod = it.product;
            let unitPrice = null;
            let prodId = null;
            if (prod && prod._id) {
                prodId = prod._id;
                unitPrice = typeof prod.price === 'number' ? prod.price : null;
            } else {
                prodId = it.product;
                if (this.prodRepo) {
                    const fresh = await this.prodRepo.getById(prodId);
                    if (fresh) {
                        unitPrice = fresh.price;
                    }
                }
            }
            if (unitPrice == null) {
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

        const ticket = await this.ticketRepo.createTicket(ticketPayload);
        await this.cartRepo.closeCart(cartId);
        return { ticket };
    }
}
