import { NextFunction, Request, Response } from "express";
import { appError, asyncHandler } from "../utils/errorHandling.ts";
import { FAILED } from "../utils/httpStatus.ts";
import jwt from "jsonwebtoken";



const protectedRoute = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let authHeader = req.headers.authorization;
    let accessToken: string | undefined;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        accessToken = authHeader.split(' ')[1] as string;
    }
    if (!accessToken) {
        return next(appError.createError("you are not logged in", 401, FAILED));
    }
    const decoded = jwt.verify(accessToken, process.env["ACCESS_TOKEN_SECRET"]!);
    if (decoded) {
        const { userId, role } = decoded as { userId: string; role: string; };
        req.userId = userId;
        req.role = role;
        next();
    }
    else {
        return next(appError.createError("you are not logged in", 401, FAILED));
    }
});
export default protectedRoute;