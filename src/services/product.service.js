const ProductDao = require("../dao/product.dao")

class GamesService {
    constructor(prodssDao) {
        this.prodsDao = prodsDao
    }

    async getAllProds() {
        return await this.prodsDao.getAll()
    }

    async getProdByID(id) {
        if(!id) {
            throw new Error('Id Requerido')
        }
        return await this.prodsDao.getByID(id)
    }

    async createProd(prod) {
        const requiredAtributes = 
            [
                "id",
                "nombre",
                "categoria",
                "stock",
                "imagen"
            ]
        const missingAtributes = requiredAtributes.filter((atribute) => !game[atribute])
        if(missingAtributes.length > 0) {
            throw new Error(`Campos faltantes: ${missingAtributes}`)
        }
        return await this.prodsDao.create(prod)
    }

    async updateProd(id, updateFields) {
        if(!id) {
            throw new Error('Id requerido')
        } 
        const prod = await this.prodsDao.getByID(id)
        if(!prod) {
            throw new appError('Producto no encontrado', 404)
        }
        return await this.prodsDao.update(id, updateFields)
    }

    async deleteProd(id) {
        if(!id) {
            throw new Error('id requerido')
        }
        return await this.prodsDao.delete(id)
    }
}

module.exports = ProductDao