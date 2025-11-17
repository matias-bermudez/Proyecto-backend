import mongoose from 'mongoose';

const TicketItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    unitPrice: {
        type: Number,
        required: true
    }
}, { _id: false });

const TicketSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    purchaser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: [TicketItemSchema], required: true },
    amount: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

export const TicketModel = mongoose.model('Ticket', TicketSchema);
