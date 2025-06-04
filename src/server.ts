import express from 'express';
import dotenv from "dotenv";
import helmet from 'helmet';
import authRoutes from './routes/auth-routes.ts';
import productRoutes from "./routes/product-routes.ts";
import { globalErrorHandler, handleNotFoundResourceError } from "./utils/errorHandling.ts";
import './utils/extendExpressRequest.ts';
import { connectDB } from './config/db.ts';
import addingRedisToResObject from './middlewares/addingRedisToResObject.ts';
import cartRoutes from './routes/cart-route.ts';
import couponsRoutes from './routes/coupon-route.ts';
import orderRoutes from './routes/payment-route.ts';
import analyticsRoutes from './routes/analytics-route.ts';
import cors from 'cors';
dotenv.config();
const app = express();

const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(addingRedisToResObject);
app.use('/api/v1/auth', authRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/coupons", couponsRoutes);
app.use("/api/v1/order", orderRoutes);
app.use("/api/v1/analytics", analyticsRoutes);

app.use(globalErrorHandler);
app.use(handleNotFoundResourceError);
app.listen(PORT, () => {
    connectDB();
    console.log(`Server is running on port ${PORT}`);
});

//add rate limiter
//add api versioning
//add the types folder instead of using any (featured products,cartItems etc)