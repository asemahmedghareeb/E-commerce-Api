import mongoose, { Schema, Document, Model, Types } from "mongoose";

interface IOrderItem {
    product: Types.ObjectId;
    quantity: number;
    price: number;
}

interface IOrder extends Document {
    user: Types.ObjectId;
    products: IOrderItem[];
    totalAmount: number;
    stripeSessionId?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const orderSchema = new Schema<IOrder>(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        products: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "product",
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                },
                price: {
                    type: Number,
                    required: true,
                    min: 0,
                },
            },
        ],
        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        stripeSessionId: {
            type: String,
            unique: true,
        },
    },
    { timestamps: true }
);

const Order: Model<IOrder> = mongoose.model<IOrder, Model<IOrder>>("Order", orderSchema);

export { Order, IOrder, IOrderItem };