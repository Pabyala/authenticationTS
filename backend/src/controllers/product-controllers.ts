import express, { Request, Response } from "express";
import Product from "../models/product-model";

export const getAllProducts = async (req: Request, res: Response) => {
    try {
        const user = await Product.find({}).populate('createdBy', 'name email');
        res.status(200).json({ message: true, data: user})
    } catch (error) {
        console.error("Error during sign-up:", error);
        res.status(500).send({ success: false, message: "Internal server error" });
    }
}

export const newProductItem = async (req: Request, res: Response) => {
    const { user } = req as Request & { user: { id: string } };
    const userId = user.id;
    const { name, price, description, image, currency } = req.body;
    try {
        if(!name || !price || !description) {
            return res.status(400).json({ success: false, message: 'Name, price, and description are required.' })
        }

        const newProduct = new Product({
            name,
            price,
            description,
            image,
            currency,
            createdBy: userId
        })
        await newProduct.save();

        res.status(201).send({ success: true, message: 'New product successfully created.', data: newProduct })
    } catch (error) {
        console.error("Error during sign-up:", error);
        res.status(500).send({ success: false, message: "Internal server error" });
    }
}