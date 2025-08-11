import express, { Request, Response } from "express";
import Product from "../models/product-model";
import mongoose, { Types } from "mongoose";

export const getAllProducts = async (req: Request, res: Response) => {
    try {
        const user = await Product.find({})
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email');

        res.status(200).json({ 
            success: true, 
            message: 'All products.',
            data: user
        })
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
            return res.status(400).json({ 
                success: false, 
                message: 'Name, price, and description are required.' 
            })
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

        res.status(201).send({ 
            success: true, 
            message: 'New product successfully created.', 
            data: newProduct 
        })
    } catch (error) {
        console.error("Error during sign-up:", error);
        res.status(500).send({ success: false, message: "Internal server error" });
    }
}

export const updateProduct = async (req: Request, res: Response) => {
    const { user } = req as Request & { user: { id: string } };
    const userId = user.id;
    const productId = req.params.productId;
    const { name, price, description, image, currency } = req.body;

    try {
        if(!productId || !name || !price || !description){
            return res.status(400).json({ 
                success: false, 
                message: '"All fields are required'
            })
        }

        if (!Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ 
                success: false, message: 
                'Invalid product ID' 
            });
        }

        if (!Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid user ID' 
            });
        }

        const product = await Product.findById(productId)
        if(!product){
            return res.status(400).json({ 
                success: false, 
                message: 'Product not found'
            })
        }

        product.name = name;
        product.price = price;
        product.description = description;
        product.image = image;
        product.currency = currency;
        product.updatedBy = new Types.ObjectId(userId);

        const updatedProduct = await product.save();

        return res.status(200).json({ 
            success: true, 
            message: 'Product updated successfully', 
            data: updatedProduct 
        });
    } catch (error) {
        console.error("Error during sign-up:", error);
        res.status(500).send({ success: false, message: "Internal server error" });
    }
}

export const deleteProduct = async (req: Request, res: Response) => {
    const productId = req.params.productId;
    try {
        if (!Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ 
                success: false, message: 
                'Invalid product ID' 
            });
        }

        const product = await Product.findByIdAndDelete(productId)

        if (!product) {
            return res.status(404).json({ 
                message: 'Product not found.' 
            });
        }
        
        res.status(200).json({ 
            success: true, 
            message: "Product deleted successfully." 
        })

    } catch (error) {
        console.error("Error during sign-up:", error);
        res.status(500).send({ 
            success: false, 
            message: "Internal server error" 
        });
    }
}

export const getProductById = async (req: Request, res: Response) => {
    const productId = req.params.productId;
    try {
        if(!productId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Product ID is required.' 
            });
        }

        const product = await Product.findById(productId)
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email');

        if (!product) {
            return res.status(404).json({ 
                success: false, 
                message: 'Product not found.' 
            });
        }

        res.status(200).json({ 
            success: true, 
            message: 'Product retrieved successfully.', 
            data: product 
        });
    } catch (error) {
        console.error("Error during sign-up:", error);
        res.status(500).send({ 
            success: false, 
            message: "Internal server error" 
        });
    }
}