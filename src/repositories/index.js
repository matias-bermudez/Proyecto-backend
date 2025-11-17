import UserRepository from './user.repository.js';
import ProductRepository from './product.repository.js';
import CartRepository from './cart.repository.js';
import TicketRepository from './ticket.repository.js';

export const userRepository    = new UserRepository();
export const productRepository = new ProductRepository();
export const cartRepository    = new CartRepository();
export const ticketRepository  = new TicketRepository();