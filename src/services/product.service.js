class GamesService {
    constructor(prodssDao) {
        this.prodsDao = prodsDao
    }

    async getAllProds() {
        return await this.prodsDao.getAll()
    }

    async getProdByID(id) {
        if(id) {
        return await this.prodsDao.getByID(id)
        } else {
            throw new Error('Id Requerido')
        }
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
        } else {
            await this.prodsDao.create(prod)
        }
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
}