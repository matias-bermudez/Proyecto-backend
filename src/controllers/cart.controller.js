class CartController {
    constructor(cartService) {
        this.cartService = cartService
    }

    getCarts = async (req, res, next) => {
        try {
        const carts = await this.cartService.getAll()
        res.json(carts)
        } catch (err) {
        next(err)
        }
    }

    getCartByID = async (req, res, next) => {
        try {
            const { id } = req.params
            const cart = await this.cartService.getByID(id)
            if (!cart) return res.status(404).json({ msj: 'Carrito no encontrado' })
            res.json(cart)
        } catch (err) {
            next(err)
        }
    }

    createCart = async (req, res, next) => {
        try {
            const created = await this.cartService.create(req.body)
            res.status(201).json(created)
        } catch (err) {
            next(err)
        }
    }

    updateCart = async (req, res, next) => {
        try {
            const { id } = req.params
            const updated = await this.cartService.update(id, req.body)
            res.json(updated)
        } catch (err) {
            next(err)
        }
    }

    deleteCart = async (req, res, next) => {
        try {
            const { id } = req.params
            const deletedId = await this.cartService.delete(id)
            res.json({ id: deletedId, msj: 'Carrito eliminado' })
        } catch (err) {
            next(err)
        }
    }
}

module.exports = CartController
