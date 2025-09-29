import { ProductModel } from '../db/models/product.model.js'

export default class ProductDao {
    constructor() {}

    async getAll() {
        return ProductModel.find({}).lean()
    }

    async getByID(id) {
        return ProductModel.findById(id).lean()
    }

    async create(prod) {
        const { name, category, price, stock } = prod
        const doc = await ProductModel.create({ name, category, price, stock })
        return doc.toObject()
    }

    async update(id, updateFields) {
        const allowed = ['name', 'category', 'price', 'stock']
        const patch = {}
        for (const k of allowed) {
            if (k in updateFields) {
                patch[k] = updateFields[k]
            }
        }
        return ProductModel.findByIdAndUpdate(id, patch, { new: true, runValidators: true }).lean()
    }

    async delete(id) {
        const res = await ProductModel.findByIdAndDelete(id)
        return !!res   
    }

    async getPaged(filter, { limit, page, sort }) {
        const [docs, totalDocs] = await Promise.all([
            ProductModel.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).lean(),
            ProductModel.countDocuments(filter)
        ])
        const totalPages = Math.max(Math.ceil(totalDocs / limit), 1)
        return { docs, totalDocs, totalPages }
    }

    async getDistinctCategories() {
        return ProductModel.distinct('category')
    }

}