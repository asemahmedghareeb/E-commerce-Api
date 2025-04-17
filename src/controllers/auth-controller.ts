import { NextFunction, Request, Response } from "express";
import { User, IUser } from "../models/user.ts";
import { appError, asyncHandler } from "../utils/errorHandling.ts";
import { FAILED, SUCCESS } from "../utils/httpStatus.ts";
import generateTokens from "../utils/generateTokens.ts";
import Jwt from "jsonwebtoken";

const signup = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
        return next(appError.createError("user already exists", 400, FAILED));
    }
    const user: IUser = await User.create({
        name,
        email,
        password,
    });
    const { accessToken, refreshToken } = generateTokens(user._id.toString(), user.role);
    req.redisClient?.set(`refreshToken:${user._id.toString()}`, refreshToken, "EX", 7 * 24 * 60 * 60);
    res.status(200).json({
        message: "user signed up successfully",
        status: SUCCESS,
        data: { accessToken, refreshToken },
    });
});




const login = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password } = req.body;
    const user: IUser | null = await User.findOne({ email });
    if (!user) {
        return next(appError.createError("user not found", 404, FAILED));
    }
    const isPasswordValid: boolean = await user.comparePassword(password);
    if (!isPasswordValid) {
        return next(appError.createError("invalid credentials", 400, FAILED));
    }
    const { accessToken, refreshToken } = generateTokens(user._id.toString(), user.role);
    req.redisClient?.set(`refreshToken:${user._id.toString()}`, refreshToken, "EX", 7 * 24 * 60 * 60);
    res.status(200).json({
        message: "user logged in successfully",
        status: SUCCESS,
        data: { accessToken, refreshToken },
    });
});

const logout = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.userId;
    if (!userId) {

        return next(appError.createError("you are not logged in", 400, FAILED));
    }
    req.redisClient?.del(`refreshToken:${userId}`);
    res
        .status(200)
        .json({ message: "user logged out successfully", status: SUCCESS });
});

const getNewAccessTokenUsingRefreshToken = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let authHeader = req.headers.authorization;
    let refreshToken: string | undefined;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        refreshToken = authHeader.split(' ')[1] as string;
    }
    if (!refreshToken) {
        return next(appError.createError("you didn't provide the refresh token", 400, FAILED));
    }
    const decoded: any = Jwt.verify(refreshToken, process.env["REFRESH_TOKEN_SECRET"]!);
    const storedToken = await req.redisClient?.get(`refreshToken:${decoded.userId}`);

    if (!decoded || (storedToken !== refreshToken)) {
        return next(appError.createError("invalid refresh token", 400, FAILED));
    }
    const { userId } = decoded as { userId: string; };
    const accessToken = Jwt.sign({ userId }, process.env["ACCESS_TOKEN_SECRET"]!, { expiresIn: "15m", });
    res.status(200).json({ accessToken });

});

const userProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user: IUser = await User.findById(req.userId).select("-password");
    if (!user) {
        return next(appError.createError("user not found", 404, FAILED));
    }
    res.status(200).json({ status: SUCCESS, data: user });

});

export { signup, login, logout, getNewAccessTokenUsingRefreshToken, userProfile };
