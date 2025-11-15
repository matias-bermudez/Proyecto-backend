import UserController from './user.controller.js';
import ProductController from './product.controller.js';
import CartController from './cart.controller.js';

import { 
    userService,
    productService,
    cartService
} from '../services/index.js';

export const userController     = new UserController(userService);
export const productController  = new ProductController(productService);
export const cartController     = new CartController(cartService);
