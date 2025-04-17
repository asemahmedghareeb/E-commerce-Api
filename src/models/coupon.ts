import mongoose, { Schema, Document, Model, Types } from "mongoose";

interface ICoupon extends Document {
    _id: string;
    code: string;
    discountPercentage: number;
    expirationDate: Date;
    isActive?: boolean;
    userId: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

const couponSchema = new Schema<ICoupon>(
    {
        code: {
            type: String,
            required: true,
            unique: true,
        },
        discountPercentage: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
        },
        expirationDate: {
            type: Date,
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
    },
    {
        timestamps: true,
    }
);

const Coupon: Model<ICoupon> = mongoose.model<ICoupon, Model<ICoupon>>("Coupon", couponSchema);
export { Coupon, ICoupon };