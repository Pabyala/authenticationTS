import mongoose, { Document, Schema } from 'mongoose';
import { IntProduct } from '../interface/user-interface';

const ProductSchema: Schema = new Schema<IntProduct>({
    name: { type: String, required: true},
    price: { type: Number, required: true},
    description: { type: String, required: true},
    image: { type: [String], default: [] },
    currency: { type: String, require: true, default: 'PHP', enum: ['PHP', 'USD', 'EUR', 'GBP', 'JPY', 'INR']},
    createdBy: { type: mongoose.Schema.ObjectId, ref: 'User', required: true }
    },
    { timestamps: true }
);

const Product = mongoose.model<IntProduct>('Product', ProductSchema);
export default Product;