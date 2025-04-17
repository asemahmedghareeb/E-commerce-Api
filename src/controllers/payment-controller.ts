import { appError, asyncHandler } from "../utils/errorHandling.ts";
import { Request, Response, NextFunction } from "express";
import { FAILED, SUCCESS } from "../utils/httpStatus.ts";
import { Coupon, ICoupon } from "../models/coupon.ts";
import { createNewCoupon, } from "../utils/stripe.ts";
import { Order } from "../models/order.ts";
import { CartItem } from "../models/cart_item.ts";
import dotenv from "dotenv";
import createStripeSession from "../utils/createCheckoutSession.js";
dotenv.config();
import { stripe } from "../config/stripe.ts";
const createCheckoutSession = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    let couponCode = req.body.couponCode;
    let cartItems: any = await req.redisClient?.get(`cartItems:${req.userId}`).then((data) => JSON.parse(data!));
    if (cartItems === null || cartItems.length === 0) {
        return next(appError.createError("products are required", 400, FAILED));
    }
    let totalAmount = 0;
    console.log(cartItems);
    const lineItems = cartItems.map((cartItem: any) => {
        const amount = Math.round(cartItem.product.price * 100);
        totalAmount += amount * cartItem.product.quantity;

        return {
            price_data: {
                currency: "usd",
                product_data: {
                    name: cartItem.product.name,
                    images: [cartItem.product.image.url.toString()],
                },
                unit_amount: amount,
            },
            quantity: cartItem.quantity || 1,
        };
    });


    let coupon: ICoupon | null = null;
    if (couponCode) {
        coupon = await Coupon.findOne({ code: couponCode, userId: req.userId, isActive: true });

        if (coupon) {
            totalAmount -= Math.round((totalAmount * coupon.discountPercentage) / 100);
        } else {
            return next(appError.createError("coupon is not valid", 400, FAILED));
        }
    }


    const session = await createStripeSession(lineItems, couponCode, req.userId!, coupon as ICoupon, cartItems);
    if (totalAmount >= 20000) {
        await createNewCoupon(req.userId!);
    }
    res.json({
        message: "checkout session created successfully",
        status: SUCCESS,
        data: {
            sessionId: session.id,
            totalAmount: totalAmount / 100,
        }
    });
});

const checkoutSuccess = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { sessionId } = req.body;
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log(session.payment_status);
    if (session.payment_status === "paid") {
        await Coupon.findByIdAndDelete(req.userId);
        let cartItems: any = await req.redisClient?.get(`cartItems:${req.userId}`).then((data) => JSON.parse(data!));

        if (cartItems === null || cartItems.length === 0) {
            return next(appError.createError("products are required", 400, FAILED));
        }

        const order = new Order({
            user: req.userId?.toString(),
            products: cartItems.map((cartItem: any) => ({
                product: cartItem.product._id,
                quantity: cartItem.quantity,
                price: cartItem.product.price
            })),
            totalAmount: session.amount_total! / 100,
            stripeSessionId: sessionId
        });
        await order.save();
        await req.redisClient?.del(`cartItems:${req.userId}`);

        await CartItem.deleteMany({ user: req.userId });

        res.status(200).json({
            message: "order is created successfully",
            status: SUCCESS,
            data: {
                order
            },
        });
    }
    return next(appError.createError("check out didn't success", 400, FAILED));

});
export { createCheckoutSession, checkoutSuccess }; 