import { appError, asyncHandler } from "../utils/errorHandling.ts";
import { Request, Response, NextFunction } from "express";
import { CartItem, ICartItem } from '../models/cart_item.ts';
import { FAILED, SUCCESS } from "../utils/httpStatus.ts";
import updateCartCache from "../utils/updateCartCache.ts";



const addToCart = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { productId } = req.body;
    const userId: string = req.userId?.toString()!;
    const existingItem: ICartItem | null = await CartItem.findOne({ product: productId, user: userId });
    if (existingItem) {
        existingItem.quantity += 1;
        updateCartCache(req, userId);
        await existingItem.save();
        return res.status(200).json({
            status: SUCCESS,
            message: "product added to cart successfully",
            data: existingItem
        });
    }
    const newCartItem: ICartItem = await CartItem.create({ product: productId, user: userId });
    updateCartCache(req, userId);
    res.status(200).json({
        status: SUCCESS,
        message: "product added to cart successfully",
        data: newCartItem
    });

});

const updateQuantity = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { quantity } = req.body;
    if (!quantity || quantity < 0) {
        console.log(quantity);
        return next(appError.createError("quantity not provided or it is less than 0", 400, FAILED));
    }
    const cartItemId = req.params.id;
    const userId: string = req.userId!;
    const item: ICartItem | null = await CartItem.findOne({ _id: cartItemId, user: userId });
    if (!item) {
        return next(appError.createError("the cart item doesn't exist", 400, FAILED));
    }
    if (quantity === 0) {
        await CartItem.findByIdAndDelete(cartItemId);
        return res.status(200).json({
            status: SUCCESS,
            message: "product is removed from cart successfully",
            data: item
        });
        updateCartCache(req, userId);
    }
    item!.quantity = quantity;
    await item?.save();
    updateCartCache(req, userId);
    res.status(200).json({
        status: SUCCESS,
        message: "product quantity is updated successfully",
        data: item
    });

});

const removeAllFromCart = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userid = req.userId;
    const cartItems = await CartItem.deleteMany({ user: userid }, { new: true });
    await req.redisClient?.del(`cartItems:${userid}`);

    if (cartItems.deletedCount === 0) {
        return next(appError.createError("the cart is already empty", 400, FAILED));
    }
    res.status(200).json({
        status: SUCCESS,
        message: "cart cleared successfully",
        data: cartItems
    });
});

const getAllCartItems = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const userId = req.userId;
    let cartItems: any = await req.redisClient?.get(`cartItems:${userId}`);
    if (cartItems) {
        console.log("cart items from the cache");
        return res.status(200).json({
            status: SUCCESS,
            message: "cart items fetched successfully",
            data: JSON.parse(cartItems)
        });
    }
    cartItems = await CartItem.find({ user: userId }).populate("product")!;
    if (!cartItems) {
        return next(appError.createError("cart is empty", 400, FAILED));
    }

    await req.redisClient?.set(`cartItems:${userId}`, JSON.stringify(cartItems));
    res.status(200).json({
        status: SUCCESS,
        message: "cart items fetched successfully",
        data: cartItems
    });
});

export { addToCart, updateQuantity, removeAllFromCart, getAllCartItems };