import express from 'express'  
import { getAnalytics } from '../controllers/analytics-controller.js';
import protectedRoute from "../middlewares/protectedRoute.ts";
import adminRoute from '../middlewares/adminRoute.ts';
const router = express.Router();
router.use(protectedRoute);
router.use(adminRoute);
router.get("/", getAnalytics);
export default router;