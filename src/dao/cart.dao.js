import { CartModel } from '../db/models/cart.model.js'

export default class CartDao {
    constructor() {}

    async getAll() {
        return CartModel.find({}).lean()
    }

    async getByID(id) {
        return CartModel.findById(id).lean()
    }

    async getByIDPopulated(id) {
        return CartModel.findById(id)
            .populate('products.product').lean()
    }

    async create(initial = {}) {
        const doc = await CartModel.create({ products: [], ...initial })
        return doc.toObject()
    }

    async setProductQuantity(cid, pid, quantity) {
        const updated = await CartModel.findOneAndUpdate(
            { _id: cid, 'products.product': pid },
            { $set: { 'products.$.quantity': quantity } },
            { new: true }
        ).lean()
        if (updated) {
            return updated
        } else {
            return CartModel.findByIdAndUpdate(
                cid,
                { $push: { products: { product: pid, quantity } } },
                { new: true }
            ).lean()
        }
    }

    async removeProduct(cid, pid) {
        return CartModel.findByIdAndUpdate(
            cid,
            { $pull: { products: { product: pid } } },
            { new: true }
        ).lean()
    }

    async empty(cid) {
        return CartModel.findByIdAndUpdate(
            cid,
            { $set: { products: [] } },
            { new: true }
        ).lean()
    }

    async deleteCart(cid) {
        const res = await CartModel.findByIdAndDelete(cid)
        return !!res
    }

    async setStatusClosed(cid) {
        return CartModel.findByIdAndUpdate(
            cid,
            { status: 'closed', closedAt: new Date() },
            { new: true }
        ).lean();
    }

}