const AppError = require('../utils/appError')

class CartService {
    constructor(cartDao, productDao) {
        this.cartDao = cartDao
        this.prodsDao = productDao
    }

    async getAll() {
        return await this.cartDao.getAll()
    }

    async getByID(id) {
        if (!id) throw new AppError('Id requerido', 400)
        return await this.cartDao.getByID(id)
    }

    async create(cart) {
        if (!cart || !Array.isArray(cart.prods)) {
            throw new AppError('Formato de carrito inválido (prods requerido)', 400)
        }
        let costo = 0
        let cantProds = 0
        for( const prod of cart.prods) {
            const finalProd = await this.prodsDao.getByID(prod.id)
            if (!finalProd) {
                throw new AppError(`Producto ${prod.id} no encontrado`, 404)
            }
            costo += (finalProd.precio * prod.quantity)
            cantProds += prod.quantity
        }
        const finalCart = {
            "prods": cart.prods,
            "costo": costo,
            "cantidad": cantProds
        }
        return await this.cartDao.create(finalCart)
    }

    async update(id, updateFields) {
        if (!id) throw new AppError('Id requerido', 400)
        const exists = await this.cartDao.getByID(id)
        if (!exists) throw new AppError('Carrito no encontrado', 404)
        if(updateFields.prods) {
            let costo = 0
            let cantProds = 0
            for( const prod of updateFields.prods) {
                const finalProd = await this.prodsDao.getByID(prod.id)
                if (!finalProd) {
                    throw new AppError(`Producto ${prod.id} no encontrado`, 404)
                }
                costo += (finalProd.precio * prod.quantity)
                cantProds += prod.quantity
            } 
            updateFields.costo = costo
            updateFields.cantidad = cantProds
        }
        return await this.cartDao.update(id, updateFields)
    }

    async delete(id) {
        if (!id) throw new AppError('Id requerido', 400)
        const ok = await this.cartDao.delete(id)
        if (!ok) throw new AppError('Carrito no encontrado', 404)
        return id
    }
}

module.exports = CartService

