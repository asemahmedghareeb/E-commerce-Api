import { Request, Response, NextFunction } from 'express';
const adminRoute = (req: Request, res: Response, next: NextFunction) => {
    if (req.role === "admin") {
        next();
    } else {
        res.status(401).json({ message: "Unauthorized" });
    }
};

export default adminRoute;