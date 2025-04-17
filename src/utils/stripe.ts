import { stripe } from "../config/stripe";
import { Coupon } from "../models/coupon";

async function createStripeCoupon(discountPercentage: number) {
    const stripeCoupon = await stripe.coupons.create({
        duration: "once",
        percent_off: discountPercentage,
    });
    return stripeCoupon.id;
};

async function createNewCoupon(userId: string) {
    await Coupon.findOneAndDelete({ userId });

    const newCoupon = new Coupon({
        code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        discountPercentage: 10,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        userId: userId,
    });

    await newCoupon.save();
    return newCoupon;
}

export { createStripeCoupon, createNewCoupon };