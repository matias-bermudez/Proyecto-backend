import UserService from './user.service.js';
import ProductService from './product.service.js';
import CartService from './cart.service.js';

import {
    userRepository,
    productRepository,
    cartRepository,
} from '../repositories/index.js';

export const userService     = new UserService(userRepository);
export const productService  = new ProductService(productRepository);
export const cartService     = new CartService(cartRepository);
