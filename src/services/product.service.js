export default class ProductService {
    constructor(prodsDao) {
        this.prodsDao = prodsDao
    }

    async getProdsPaged(filter, opts) {
        return this.prodsDao.getPaged(filter, opts)
    }

    async getAllProds() {
        return this.prodsDao.getAll()
    }

    async getProdByID(id) {
        return this.prodsDao.getByID(id)
    }

    async createProd(data) {
        const { name, category, price, stock } = data
        return this.prodsDao.create({ name, category, price, stock })
    }

    async updateProd(id, update) {
        return this.prodsDao.update(id, update)
    }

    async deleteProd(id) {
        return this.prodsDao.delete(id)
    }

    async getCategories() {
        return this.prodsDao.getDistinctCategories()
    }
    
}