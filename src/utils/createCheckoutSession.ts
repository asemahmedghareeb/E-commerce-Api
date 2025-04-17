import Stripe from "stripe";
import dotenv from "dotenv";
import { createStripeCoupon } from "./stripe";
import { ICoupon } from "../models/coupon";
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
async function createCheckoutSession(line_items: [], couponCode: string, userId: string, coupon: ICoupon, products: []) {
  console.log(line_items, "from the new function");

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    success_url: "https://example.com/success",
    cancel_url: "https://example.com/success",
    line_items: 
      line_items,
    discounts: coupon
      ? [
        {
          coupon: await createStripeCoupon(coupon.discountPercentage),
        },
      ]
      : [],
    metadata: {
      userId: userId,
      couponCode: couponCode || "",
      products: JSON.stringify(
        products.map((item: any) => ({
          id: item.product._id,
          quantity: item.product.quantity,
          price: item.product.price,
        }))
      ),
    },
  });
  console.log(session.id);
  return session;
}

export default createCheckoutSession;
