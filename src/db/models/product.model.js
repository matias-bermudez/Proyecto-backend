import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        category: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        price: {
            type: Number,
            required: true,
            min: 0,
            index: true
        },
        stock: {
            type: Number,
            required: true,
            min: 0
        }
    },
    { timestamps: true }
)

export const ProductModel = mongoose.model('Product', productSchema)
