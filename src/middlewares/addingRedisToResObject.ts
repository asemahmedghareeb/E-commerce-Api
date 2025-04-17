import redisClient from '../config/redis.ts';
import { NextFunction, Request, Response } from 'express';
const addingRedisToResObject = (req: Request, res: Response, next: NextFunction) => {
    req.redisClient = redisClient;
    next(); 

}

export default addingRedisToResObject;