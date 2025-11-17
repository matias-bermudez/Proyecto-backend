import { TicketModel } from '../db/models/ticket.model.js';

export default class TicketDao {
    constructor() {}

    async create(doc, options = {}) {
        const created = await TicketModel.create([doc], options);
        return created[0].toObject();
    }

    async findByCode(code) {
        return TicketModel.findOne({ code }).lean();
    }
}
