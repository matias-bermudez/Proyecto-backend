export default class CartService {
    constructor(cartDao) {
        this.cartDao = cartDao
    }

    async getAll() {
        return await this.cartDao.getAll()
    }

    async getCartByID(id, { populated = false } = {}) {
        if (populated) {
            return this.cartDao.getByIDPopulated(id)
        } else {
            return this.cartDao.getByID(id)
        }
    }

    async setProductQuantity(cid, pid, quantity) {
        return this.cartDao.setProductQuantity(cid, pid, quantity)
    }

    async createCart(initial = {}) {
        return this.cartDao.create(initial)
    }

    async removeProduct(cid, pid) {
        return this.cartDao.removeProduct(cid, pid)
    }

    async emptyCart(cid) {
        return this.cartDao.empty(cid)
    }

    async deleteCart(cid) {
        return this.cartDao.deleteCart(cid)
    }

    async finalizeCart(cid) {
        const cart = await this.cartDao.getByID(cid)
        if (!cart) {
            return { ok: false, code: 404, msg: 'Carrito no encontrado' }
        }
        if (cart.status === 'closed') {
            return { ok: false, code: 409, msg: 'El carrito ya fue finalizado' }
        }
        const hasItems = Array.isArray(cart.products) && cart.products.length > 0
        if (!hasItems) {
            return { ok: false, code: 409, msg: 'No se puede finalizar un carrito vacío' }
        }
        await this.cartDao.setStatusClosed(cid)
        return { ok: true }
    }

}