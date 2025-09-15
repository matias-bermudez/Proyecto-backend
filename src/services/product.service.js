const ProductDao = require("../dao/product.dao")

class ProductService {
    constructor(prodsDao, cartDao) {
        this.prodsDao = prodsDao
        this.cartDao = cartDao
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
                "nombre",
                "categoria",
                "stock",
                "imagen",
                "precio"
            ]
        const missingAtributes = requiredAtributes.filter((atribute) => !prod[atribute])
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
            throw new AppError('Producto no encontrado', 404)
        }
        const updated = await this.prodsDao.update(id, updateFields)
        const prods = await this.prodsDao.getAll()
        try {
            const carts = await this.cartDao.getAll()
            for (const cart of carts) {
                const items = Array.isArray(cart.prods) ? cart.prods : []
                const updateFieldsCart = {}
                if(items.findIndex((p) => p.id == id) !== -1) {
                    let costo = 0
                    let cantProds = 0
                    for( const prod of items) {
                        const prodFinal = await this.prodsDao.getByID(prod.id)
                        costo += prodFinal.precio * prod.quantity
                        cantProds += prod.quantity
                    }
                    updateFieldsCart.costo = costo
                    updateFieldsCart.cantidad = cantProds
                    await this.cartDao.update(cart.id, updateFieldsCart)
                }
            }
        } catch (err) {

        }
        return updated
    }

    async deleteProd(id) {
        if(!id) {
            throw new Error('id requerido')
        }
        return await this.prodsDao.delete(id)
    }
}

module.exports = ProductService