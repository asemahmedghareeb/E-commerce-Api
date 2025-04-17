import express from "express";
import { createCheckoutSession,checkoutSuccess } from "../controllers/payment-controller.ts";
import protectedRoute from "../middlewares/protectedRoute.ts";
const router = express.Router();
router.use(protectedRoute);
router.post("/create-checkout-session", createCheckoutSession);
router.post("/checkout-success", checkoutSuccess);
export default router;


