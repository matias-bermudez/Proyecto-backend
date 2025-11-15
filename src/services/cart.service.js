export default class CartService {
    constructor(cartRepository) {
        this.cartRepo = cartRepository;
    }

    async getAll() {
        return await this.cartRepo.getAll();
    }

    async getCartByID(id, { populated = false } = {}) {
        return this.cartRepo.getById(id, { populated });
    }

    async setProductQuantity(cid, pid, quantity) {
        // repository method is addOrSetProductQuantity
        return this.cartRepo.addOrSetProductQuantity(cid, pid, quantity);
    }

    async createCart(initial = {}) {
        return this.cartRepo.createCart(initial);
    }

    async removeProduct(cid, pid) {
        return this.cartRepo.removeProduct(cid, pid);
    }

    async emptyCart(cid) {
        return this.cartRepo.emptyCart(cid);
    }

    async deleteCart(cid) {
        return this.cartRepo.deleteCart(cid);
    }

    async finalizeCart(cid) {
        // this logic uses repo methods
        const cart = await this.cartRepo.getById(cid, { populated: false });
        if (!cart) {
        return { ok: false, code: 404, msg: 'Carrito no encontrado' };
        }
        if (cart.status === 'closed') {
        return { ok: false, code: 409, msg: 'El carrito ya fue finalizado' };
        }
        const hasItems = Array.isArray(cart.products) && cart.products.length > 0;
        if (!hasItems) {
        return { ok: false, code: 409, msg: 'No se puede finalizar un carrito vacío' };
        }
        await this.cartRepo.closeCart(cid);
        return { ok: true };
    }
}
