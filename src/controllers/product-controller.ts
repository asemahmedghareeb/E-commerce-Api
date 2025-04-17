// import fs from 'fs';
import { IProduct, Product } from "../models/product.ts";
import { appError, asyncHandler } from "../utils/errorHandling.ts";
import { Request, Response, NextFunction } from "express";
import { FAILED, SUCCESS } from "../utils/httpStatus.ts";
import { uploadToCloudinary } from "../config/cloudinary.ts";
import { v2 as cloudinary } from 'cloudinary';

const uploadProductImage = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    console.log("from the controller");
    return next(appError.createError("file is required", 400, FAILED));
  }
  const { url, publicId } = await uploadToCloudinary(req.file.path);
  // fs.unlinkSync(req.file.path);
  return res.status(201).json({
    status: SUCCESS,
    message: "image uploaded successfully",
    data: { url, publicId }
  });
});

const createProduct = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { name, price, description, category } = req.body;
  const product: IProduct = await Product.create({
    name,
    price,
    description,
    image: req.body.image,
    category,
  });
  res.status(200).json({
    message: "product created successfully",
    status: SUCCESS,
    data: product,
  });


});
const getAllProducts = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const products: IProduct[] = await Product.find({});
    if (products.length === 0) {
      return next(appError.createError("no products found", 404, FAILED));
    }
    res.status(200).json({
      message: "products fetched successfully",
      status: SUCCESS,
      data: products,
    });
  }
);

const getAllFeaturedProducts = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    let featuredProducts: any | IProduct = await req.redisClient?.get("featuredProducts");
    if (featuredProducts) {
      featuredProducts = JSON.parse(featuredProducts);
      return res.status(200).json({
        message: "featured products fetched successfully from the cache",
        status: SUCCESS,
        data: featuredProducts,
      });

    }
    featuredProducts = await Product.find({ isFeatured: true }).lean();
    if (featuredProducts?.length === 0) {
      return next(appError.createError("no products found", 404, FAILED));
    }
    req.redisClient?.set("featured_products", JSON.stringify(featuredProducts));
    res.status(200).json({
      message: "featured products fetched successfully from the DB",
      status: SUCCESS,
      data: featuredProducts,
    });
  }
);

const getProduct = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const product: IProduct | null = await Product.findById(req.params['id']);
  if (!product) {
    return next(appError.createError("product not found", 404, FAILED));
  }
  res.status(200).json({
    message: "product fetched successfully",
    status: SUCCESS,
    data: product,
  });

});

const updateProduct = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const product: IProduct | null = await Product.findByIdAndUpdate(req.params['id'], req.body, { new: true });
    if (!product) {
      return next(appError.createError("product not found", 404, FAILED));
    }
    res.status(200).json({
      message: "product updated successfully",
      status: SUCCESS,
      data: product,
    });
  }
);

const deleteProduct = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const product: IProduct | null = await Product.findByIdAndDelete(req.params['id']);
  if (!product) {
    return next(appError.createError("product not found", 404, FAILED));
  }
  cloudinary.uploader.destroy(product.image.public_id);

  res.status(200).json({
    message: "product deleted successfully",
    status: SUCCESS,
    data: product,
  });

});

const getRecommendedProducts = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const products: IProduct[] = await Product.aggregate([
    { $sample: { size: 3 } },
    {
      $project: {
        _id: -1,
        name: 1,
        description: 1,
        image: 1,
        price: 2
      }
    }

  ]);
  if (!products) {
    return next(appError.createError("product not found", 404, FAILED));
  }

  res.status(200).json({
    message: "products fetched successfully",
    status: SUCCESS,
    data: {
      products
    }
  });

});
const getProductByCategory = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { categoryName } = req.params;

  const products: IProduct[] | null = await Product.find({ category: categoryName });

  if (!products) {
    return next(appError.createError("product not found", 404, FAILED));
  }

  res.status(200).json({
    message: "category products fetched successfully",
    status: SUCCESS,
    data: {
      products
    }
  });


});


const toggleFeaturedProduct = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  const product: IProduct | null = await Product.findById(id);
  if (!product) {
    return next(appError.createError("product not found", 404, FAILED));
  }
  product.isFeatured = !product.isFeatured;
  await product.save();
  const featuredProducts: IProduct[] = await Product.find({ isFeatured: true }).lean();
  await req.redisClient?.set("featured_products", JSON.stringify(featuredProducts));

  res.status(200).json({
    message: "product updated successfully",
    status: SUCCESS,
    data: product,
  });
});

export {
  toggleFeaturedProduct,
  getRecommendedProducts,
  createProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getAllFeaturedProducts,
  uploadProductImage,
  getProductByCategory
};