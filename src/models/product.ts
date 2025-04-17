import mongoose, { Schema, Document, Model } from "mongoose";

interface IProduct extends Document {
    _id: string;
    name: string;
    price: number;
    description: string;
    category: string;
    image: {
        url: string,
        public_id: string;
    };
    isFeatured: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}


const productSchema = new Schema<IProduct>(
    {
        name: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            min: [0, "Price must be greater than 0"],
            required: true,
        },
        description: {
            type: String,
            required: true,
            minlength: [10, "Description must be at least 10 characters"],
            maxlength: [500, "Description must be less than 500 characters"],
        },
        category: {
            type: String,
            required: true,
        },
        image: {
            url: {
                type: String,

            },
            public_id: {
                type: String,
            },
        },
        isFeatured: {
            type: Boolean,
            default: false
        }

    },
);


const Product = mongoose.model<IProduct, Model<IProduct>>("product", productSchema);
export { Product,IProduct};