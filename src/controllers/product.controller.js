import { CartModel } from '../db/models/cart.model.js'

export default class ProductController {
    constructor(prodsService) {
        this.prodsService = prodsService
    }

    getProds = async (req, res, next) => {
      try {
        const limit = Math.max(parseInt(req.query.limit ?? 10), 1)
        const page  = Math.max(parseInt(req.query.page  ?? 1), 1)
        const sortQ = req.query.sort
        const query = req.query.query
        
        const filter = {}
        let field, raw
        if (query) {
          [field, raw] = String(query).split(':')
          if (field && typeof raw !== 'undefined') {
            if (field === 'category') filter.category = raw
            if (field === 'availability') {
              filter.stock = (raw === 'true') ? { $gt: 0 } : { $eq: 0 }
            }
          }
        }

        let sort
        if (sortQ === 'asc')  sort = { price: 1 }
        if (sortQ === 'desc') sort = { price: -1 }

        const { docs, totalDocs, totalPages } =
          await this.prodsService.getProdsPaged(filter, { limit, page, sort })

        const hasPrevPage = page > 1
        const hasNextPage = page < totalPages
        const prevPage = hasPrevPage ? page - 1 : null
        const nextPage = hasNextPage ? page + 1 : null

        // links para mantener filtros en la vista (/products)
        const buildViewLink = (targetPage) => {
          const url = new URL(req.protocol + '://' + req.get('host') + '/products')
          url.searchParams.set('limit', String(limit))
          url.searchParams.set('page', String(targetPage))
          if (sortQ) url.searchParams.set('sort', sortQ)
          if (query) url.searchParams.set('query', query)
          return url.toString()
        }
        const prevLink = hasPrevPage ? buildViewLink(prevPage) : null
        const nextLink = hasNextPage ? buildViewLink(nextPage) : null

        //si es API (/api/products) devuelvo json
        if (req.baseUrl.startsWith('/api')) {
          // para api armo links pegando a /api/products
          const buildApiLink = (targetPage) => {
            const url = new URL(req.protocol + '://' + req.get('host') + req.baseUrl)
            url.searchParams.set('limit', String(limit))
            url.searchParams.set('page', String(targetPage))
            if (sortQ) url.searchParams.set('sort', sortQ)
            if (query) url.searchParams.set('query', query)
            return url.toString()
          }
          const apiPrev = hasPrevPage ? buildApiLink(prevPage) : null
          const apiNext = hasNextPage ? buildApiLink(nextPage) : null

          return res.json({
            status: 'success',
            payload: docs,
            totalPages,
            prevPage,
            nextPage,
            page,
            hasPrevPage,
            hasNextPage,
            prevLink: apiPrev,
            nextLink: apiNext
          })
        }

        const categories = await this.prodsService.getCategories()

        //si es vista (/products) entonces render con variables para el form
        return res.render('pages/products/index', {
          products: docs,
          totalDocs,
          totalPages,
          page,
          hasPrevPage,
          hasNextPage,
          prevPage,
          nextPage,
          prevLink,
          nextLink,
          currCategory: (field === 'category') ? raw : '',
          currAvailability: (field === 'availability') ? raw : '',
          currSort: sortQ || '',
          currLimit: limit,
          categories
        })
      } catch (err) {
        next(err)
      }
    }

    getProdByID = async (req, res, next) => {
        try {
            const { id } = req.params
            const prod = await this.prodsService.getProdByID(id)
            if (!prod) {
                return res.status(404).json({ msj: 'prod no encontrado' })
            }
            res.json(prod)
        } catch (err) {
            next(err)
        }
    }

    updateProd = async (req, res, next) => {
        try {
            const { id } = req.params
            const updatedProd = await this.prodsService.updateProd(id, req.body)
            const io = req.app.get('io')
            if (io) {
                const all = await this.prodsService.getAllProds()
                io.emit('products:update', all)
            }
            res.json(updatedProd)
        } catch (err) {
            next(err)
        }
    }

    createProd = async (req, res, next) => {
      try {
        const newProd = await this.prodsService.createProd(req.body)
        const io = req.app.get('io')
        if (io) {
          const all = await this.prodsService.getAllProds()
          io.emit('products:update', all)
        }
        res.json(newProd)
      } catch (err) {
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