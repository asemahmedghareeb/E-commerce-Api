import express from "express";
import protectedRoute from "../middlewares/protectedRoute.ts";
import { createCoupon, getCoupon, validateCoupon } from "../controllers/coupon-controller.ts";
import adminRoute from "../middlewares/adminRoute.ts";
const router = express.Router();
router.use(protectedRoute);
router.get("/", getCoupon);
router.get("/validate", validateCoupon);
router.use(adminRoute);
router.post("/create-coupon", createCoupon);

export default router;