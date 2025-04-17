import express from "express";
const router = express.Router();
import {
    createProduct,
    getAllProducts,
    getProduct,
    updateProduct,
    deleteProduct,
    getAllFeaturedProducts,
    uploadProductImage,
    getRecommendedProducts,
    getProductByCategory,
    toggleFeaturedProduct

} from "../controllers/product-controller.ts";
import protectedRoute from "../middlewares/protectedRoute.ts";
import adminRoute from "../middlewares/adminRoute.ts";
import { createProductValidation, updateProductValidation } from "../utils/validation.ts";
import uploadMiddleware from "../config/multer.ts";

router.get("/recommendation", getRecommendedProducts);
router.get("/featured", getAllFeaturedProducts);
router.use(protectedRoute);
router.use(adminRoute);
router.get("/category/:categoryName", getProductByCategory);
router.post("/create-product", createProductValidation, createProduct);
router.put("/update-product/:id", updateProductValidation, updateProduct);
router.post("/upload-product-image", uploadMiddleware.single("image"), uploadProductImage);
router.get("/get-all-product", getAllProducts);
router.get("/get-product/:id", getProduct);
router.delete("/delete-product/:id", deleteProduct);
router.patch("/toggle-featured-product/:id", toggleFeaturedProduct);
export default router;