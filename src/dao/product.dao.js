const fs = require('fs').promises
const crypto = require('crypto')

class ProductDao {
    constructor(filePath) {
        this.filePath = filePath
    }

    async #readFile() {
        try {
            const data = await fs.readFile(this.filePath, 'utf-8')
            return JSON.parse(data)
        } catch (err) {
            if(err.code === 'ENOENT') {
                await this.#saveFile([])
                return []
            }
            throw err
        }
    }

    async #saveFile(prods) {
        await fs.writeFile(this.filePath, JSON.stringify(prods, null, 2), 'utf-8')
    }

    #generateID() {
        return crypto.randomUUID()
    }

    async getAll() {
        const prods = await this.#readFile()
        return JSON.parse(JSON.stringify(prods))
    }

    async getById(id) {
        const prods = await this.#readFile()
        const prod = prods.find((prod) => prod.id === id)
        if ( prod != null ) {   
            return prod
        }
    }

    async create(prod) {
        const prods = this.#readFile()
        const newProd = {...prod, id: this.#generateID()}
        prods.push(newProd)
        await this.#saveFile(prods)
        return newProd
    }

    async update(id, updateFields) {
        const prods = await this.#readFile()
        const index = prods.findIndex((g) => (g.id === id))
        const updatedProd = {
            ...prods[index],
            updateFields,
            id
        }
        prods[index] = updatedProd
        await this.#saveFile(prods)
        return updatedProd
    }

    async delete(id) {
        const prods = await this.#readFile()
        const filteredProds = prods.filter((g) => g.id !== id)

        if(prods.length === filteredProds.length) {
            throw new Error('Producto no encontrado')
        } 
        await this.#saveFile(filteredProds)
    }
}

module.exports = ProductDao