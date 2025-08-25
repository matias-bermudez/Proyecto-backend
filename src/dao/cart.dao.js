const fs = require('fs').promises
const crypto = require('crypto')

class CartDao {
    constructor(filePath) {
        this.filePath = filePath
    }

    async #readFile() {
        try {
            const data = await fs.readFile(this.filePath, 'utf-8')
            return JSON.parse(data)
        } catch (err) {
            if(err.doce === 'ENOENT') {
                await this.#saveFile([])
                return []
            }
            throw err
        }
    }

    async #saveFile(carts) {
        await fs.writeFile(this.filePath, JSON.stringify(carts, null, 2), 'utf-8')
    }

    #generateID() {
        return crypto.randomUUID()
    }

    async getAll() {
        const carts = await this.#readFile()
        return JSON.parse(JSON.stringify(carts))
    }

    async getByID(id) {
        const carts = await this.getAll()
        const cart = carts.find((c) => c.id == id)
        if(cart != null) {
            return cart
        }
    }

    async create(cart) {
        const newCart = 
            {
                ...cart,
                id: this.#generateID(),
            }
        const carts = await this.getAll()
        carts.push(newCart)
        await this.#saveFile(carts)
        return newCart
    }

    async update(id, updateAtributes) {
        const carts = await this.getAll()
        const index = carts.findIndex((c) => c.id == id)
        const updatedCart = {
            ...carts[index],
            ...updateAtributes,
            id
        }
        carts[index] = updatedCart
        await this.#saveFile(carts)
        return updatedCart
    }

    async delete(id) {
        
    }
}

module.exports = CartDao
