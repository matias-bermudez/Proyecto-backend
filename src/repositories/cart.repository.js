import { cartDao } from '../dao/index.js';
import { productDao } from '../dao/index.js';
import mongoose from 'mongoose';

export default class CartRepository {
    constructor() {
        this.dao = cartDao;
        this.productDao = productDao;
    }

    async createCart(initial = {}) {
        return this.dao.create(initial);
    }

    async getById(cid, { populated = false } = {}) {
        return populated ? this.dao.getByIDPopulated(cid) : this.dao.getByID(cid);
    }

    async addOrSetProductQuantity(cid, pid, quantity) {
        if (!mongoose.Types.ObjectId.isValid(cid) || !mongoose.Types.ObjectId.isValid(pid)) {
            throw new Error('IDs inválidos');
        }
        if (quantity <= 0) {
            return this.dao.removeProduct(cid, pid);
        }
        const product = await this.productDao.getByID(pid);
        if (!product) {
            throw new Error('Producto no encontrado');
        }
        if (product.stock < quantity) {
        throw new Error(`Stock insuficiente. Disponible: ${product.stock}`);
        }
        const updated = await this.dao.setProductQuantity(cid, pid, quantity);
        return updated;
    }

    async removeProduct(cid, pid) {
        return this.dao.removeProduct(cid, pid);
    }

    async emptyCart(cid) {
        return this.dao.empty(cid);
    }

    async deleteCart(cid) {
        return this.dao.deleteCart(cid);
    }

    async closeCart(cid) {
        return this.dao.setStatusClosed(cid);
    }
}
