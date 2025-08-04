import express, { Request, Response } from "express";
import User from "../models/user-model";

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const user = await User.find({});
        res.status(200).json({ message: true, data: user})
    } catch (error) {
        console.error("Error during sign-up:", error);
        res.status(500).send({ success: false, message: "Internal server error" });
    }
}