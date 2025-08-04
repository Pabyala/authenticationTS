import jwt from "jsonwebtoken";
import express, { NextFunction, Request, Response } from "express";

export const verifyJWT = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization || req.headers.Authorization

    if(typeof authHeader !== "string" || !authHeader?.startsWith('Bearer')){
        return res.status(401).json({ message: 'Unauthorized' })
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET as string,
        (err: Error | null, decoded: any) => {
            if(err) {
                return res.status(403).json({ message: 'Forbidden' })
            }
            // req.user = { id: decoded.id };
            (req as Request & { user?: { id: string } }).user = { id: decoded.id };
            next();
        }
    )
}