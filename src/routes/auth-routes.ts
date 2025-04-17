import express from "express";
import { signup, login, logout, getNewAccessTokenUsingRefreshToken, userProfile } from "../controllers/auth-controller.ts";
import { loginValidation, signUpValidation } from "../utils/validation.ts";
import protectedRoute from "../middlewares/protectedRoute.ts";
const router = express.Router();

router.post("/signup", signUpValidation, signup);
router.post("/login", loginValidation, login);
router.post("/logout", protectedRoute, logout);
router.post("/refresh-token", getNewAccessTokenUsingRefreshToken);
router.get("/profile", protectedRoute, userProfile);
export default router; 