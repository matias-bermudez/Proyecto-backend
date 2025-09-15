class ProductController {
    constructor(prodsService) {
        this.prodsService = prodsService
    }

    getProds = async (req, res, next) => {
        try {
            const prods = await this.prodsService.getAllProds()
            res.json(prods)
        } catch (err) {
            next(err)
        }
    }

    getProdByID = async (req, res, next) => {
        try {
            const { id } = req.params
            const prod = await this.prodsService.getProdByID(id)
            if(!prod) {
                return res.status(404).json({ msj: 'prod no encontrado'})
            }
            res.json(prod)
        }   catch (err) {
            next(err)
        }
    }

    updateProd = async (req, res, next) => {
        try { 
            const { id } = req.params
            const updatedProd = await this.prodsService.updateProd(id, req.body)
            res.json(updatedProd)
        }   catch (err) {
            next(err)
        }
    }

    createProd = async (req, res, next) => {
        try {
            const newProd = await this.prodsService.createProd(req.body)
            const io = req.app.get('io')
            const all = await this.prodsService.getAllProds()
            io.emit('products:update', all)
            res.json(newProd)
        }   catch (err) {
            next(err)
        }
    }

    deleteProd = async (req, res, next) => {
        try {
            const { id } = req.params
            const ok = await this.prodsService.deleteProd(id)
            if (!ok) return res.status(404).json({ msj: 'prod no encontrado' })
            const io = req.app.get('io')
            if (io) {
                const all = await this.prodsService.getAllProds()
                io.emit('products:update', all)
            }
            return res.status(204).end()
        } catch (err) {
            next(err)
        }
    }

}

module.exports = ProductController