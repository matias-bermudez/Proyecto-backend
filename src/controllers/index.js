import UserController from './user.controller.js';
import ProductController from './product.controller.js';
import CartController from './cart.controller.js';
import PurchaseController from './purchase.controller.js';
import { 
    userService,
    productService,
    cartService,
    purchaseService
} from '../services/index.js';

export const userController     = new UserController(userService);
export const productController  = new ProductController(productService);
export const cartController     = new CartController(cartService);
export const purchaseController = new PurchaseController(purchaseService);