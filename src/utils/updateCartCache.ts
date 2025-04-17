import { CartItem } from "../models/cart_item.ts";
import { Request } from "express";
const updateCartCache = async (req: Request, userId: string) => {
    let cartItems = await CartItem.find({ user: userId }).populate("product")!;
    await req.redisClient?.set(`cartItems:${userId}`, JSON.stringify(cartItems));
};
export default updateCartCache;