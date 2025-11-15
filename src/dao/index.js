import UserDao from './user.dao.js';
import ProductDao from './product.dao.js';
import CartDao from './cart.dao.js';

export const userDao     = new UserDao();
export const productDao  = new ProductDao();
export const cartDao     = new CartDao();
