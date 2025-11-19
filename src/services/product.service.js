export default class ProductService {
    constructor(productRepository) {
        this.productRepository = productRepository;
    }

    async getProdsPaged(filter, opts) {
        return this.productRepository.getPaged(filter, opts);
    }

    async getAllProds() {
        return this.productRepository.getAll();
    }

    async getProdByID(id) {
        return this.productRepository.getById(id);
    }

    async createProd(data) {
        return this.productRepository.createProduct(data);
    }

    async updateProd(id, update) {
        return this.productRepository.updateProduct(id, update);
    }

    async deleteProd(id) {
        return this.productRepository.deleteProduct(id);
    }

    async getCategories() {
        return this.productRepository.getDistinctCategories();
    }
}
