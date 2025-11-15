import { productDao } from '../dao/index.js';

export default class ProductRepository {
    constructor() {
        this.dao = productDao;
    }

    async getAll() {
        return this.dao.getAll();
    }

    async getPaged(filter = {}, options = { limit: 10, page: 1, sort: {} }) {
        const { limit = 10, page = 1, sort = {} } = options;
        return this.dao.getPaged(filter, { limit, page, sort });
    }

    async getById(id) {
        return this.dao.getByID(id);
    }

    async createProduct(payload) {
        if (payload.price < 0) {
            throw new Error('Price must be >= 0');
        }
        if (payload.stock < 0) {
            payload.stock = 0;
        }
        return this.dao.create(payload);
    }

    async updateProduct(id, updateFields) {
        return this.dao.update(id, updateFields);
    }

    async deleteProduct(id) {
        return this.dao.delete(id);
    }

    async getDistinctCategories() {
        return this.dao.getDistinctCategories();
    }
}
