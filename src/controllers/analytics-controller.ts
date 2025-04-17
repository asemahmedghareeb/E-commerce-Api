import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/errorHandling.ts";
import { IOrder, Order } from "../models/order.ts";
import { User } from "../models/user.ts";
import { Product } from "../models/product.ts";

const getAnalytics = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const totalUsers: number = await User.countDocuments();
    const totalProducts: number = await Product.countDocuments();

    const salesData = await Order.aggregate([
        {
            $group: {
                _id: null,
                totalSales: { $sum: 1 },
                totalRevenue: { $sum: "$totalAmount" },
            },
        },
    ]);

    const { totalSales, totalRevenue } = salesData[0] || { totalSales: 0, totalRevenue: 0 };

    res.status(200).json({
        data: {
            users: totalUsers,
            products: totalProducts,
            totalSales,
            totalRevenue,
            dailySalesData: await getDailySalesData(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), new Date()),
            monthlySalesData: getDatesInRange(new Date(Date.now() - 29 * 24 * 60 * 60 * 1000), new Date()),
        }
    });
});


export const getDailySalesData = async (startDate: Date, endDate: Date) => {
    try {
        const dailySalesData: IOrder[] = await Order.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: startDate,
                        $lte: endDate,
                    },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    sales: { $sum: 1 },
                    revenue: { $sum: "$totalAmount" },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        const dateArray = getDatesInRange(startDate, endDate);
        return dateArray.map((date) => {
            const foundData: any = dailySalesData.find((item) => item._id === date);

            return {
                date,
                sales: foundData?.sales || 0,
                revenue: foundData?.revenue || 0,
            };
        });
    } catch (error) {
        throw error;
    }
};

function getDatesInRange(startDate: Date, endDate: Date) {
    const dates = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        dates.push(currentDate.toISOString().split("T")[0]);
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
}
export { getAnalytics };