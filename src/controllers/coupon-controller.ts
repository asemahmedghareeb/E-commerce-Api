import { appError, asyncHandler } from "../utils/errorHandling.ts";
import { Request, Response, NextFunction } from "express";
import { FAILED, SUCCESS } from "../utils/httpStatus.ts";
import { Coupon, ICoupon } from "../models/coupon.ts";
const getCoupon = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const coupon: ICoupon[] = await Coupon.find({ userId, isActive: true });
    console.log(coupon);
    if (!coupon[0]) {
        return next(appError.createError("coupon not found", 404, FAILED));
    }
    res.status(200).json({
        message: "coupon fetched successfully",
        status: SUCCESS,
        data: coupon,
    });

});

const createCoupon = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const { code, discountPercentage, expirationDate } = req.body;
    const coupon: ICoupon = await Coupon.create({ code, discountPercentage, expirationDate, userId });
    res.status(200).json({
        message: "coupon fetched successfully",
        status: SUCCESS,
        data: coupon,
    });

});

const validateCoupon = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { code } = req.body;
    const coupon: ICoupon | null = await Coupon.findOne({ code: code, userId: req.userId, isActive: true });
    if (!coupon) {
        return next(appError.createError("coupon is no found", 404, FAILED));
    }
    if (coupon.expirationDate < new Date()) {
        return next(appError.createError("coupon is not active", 409, FAILED));
    }
    res.status(200).json({
        message: "coupon is valid",
        status: SUCCESS,
        data: {
            discount: coupon.discountPercentage
        },
    });

});

export { getCoupon, validateCoupon, createCoupon };