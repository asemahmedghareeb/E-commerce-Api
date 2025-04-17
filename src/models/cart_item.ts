import mongoose, { Schema, Document, Model } from "mongoose";


interface ICartItem extends Document {
  _id: string;
  product: mongoose.Types.ObjectId; 
  quantity: number;
  user: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;   
}   

const cartItemSchema = new Schema<ICartItem>(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
      required: true,
    },
    quantity: {
      type: Number,
      default: 1,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);


const CartItem = mongoose.model<ICartItem, Model<ICartItem>>("CartItem", cartItemSchema);

export  {CartItem,ICartItem};