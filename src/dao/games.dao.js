const fs = require('fs').promises
const crypto = require('crypto')

class GamesDao {
    constructor(filePath) {
        this.filePath = filePath
    }

    async #readFile() {
        try {
            const data = await fs.readFile(this.filePath, 'utf-8')
            return JSON.parse(data)
        } catch (err) {
            if(error.code === 'ENOENT') {
                await this.#saveFile([])
                return []
            }
            throw error
        }
    }

    async #saveFile(games) {
        await fs.writeFile(this.filePath, JSON.stringify(games, null, 2), 'utf-8')
    }

    #generateID() {
        return crypto.randomUUID()
    }

    async getAll() {
        const games = await this.#readFile()
        return JSON.parse(JSON.stringify(games))
    }

    async getById(id) {
        const games = await this.#readFile()
        const game = games.find((game) => game.id === id)
        if ( game != null ) {   
            return game
        }
    }

    async create(game) {
        const games = this.#readFile()
        const newGame = {...game, id: this.#generateID()}
        games.push(newGame)
        await this.#saveFile(games)
        return newGame
    }

    async update(id, updateFields) {
        const games = await this.#readFile()
        const index = games.findIndex((g) => { g.id === id})

        if(index === -1) {
            throw new Error('Juego no encontrado')
        }

        const updatedGame = {
            ...games[index],
            updateFields,
            id
        }
        games[index] = updatedGame
        await this.#saveFile(games)
        return updatedGame
    }

    async delete(id) {
        const games = this.#readFile()
        const filteredGames = games.filter((g) => g.id !== id)

        if(games.length === filteredGames.length) {
            throw new Error('Juego no encontrado')
        } 

        this.#saveFile(filteredGames)
    }
}