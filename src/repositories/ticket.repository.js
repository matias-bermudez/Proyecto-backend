import { ticketDao } from '../dao/index.js';

export default class TicketRepository {
    constructor() {
        this.dao = ticketDao || new TicketDao();
    }

    async createTicket(payload, opts = {}) {
        if (!payload || !payload.code || !payload.purchaser || !Array.isArray(payload.items) || payload.items.length === 0) {
        throw new Error('Payload inválido para crear Ticket');
        }
        return this.dao.create(payload, opts);
    }

    async findByCode(code) {
        return this.dao.findByCode(code);
    }
}
