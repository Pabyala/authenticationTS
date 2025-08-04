import express, { Request, Response } from "express";
import User from "../models/user-model";
import bcryptjs from "bcryptjs";
import { generateVerificationToken } from "../utils/generate-random-token";
import { sendSuccessVerifyUser, sendVeriTokenEmail } from "../resend/email-resend";
import jwt from "jsonwebtoken";
import { generateAccessToken, generateRefreshToken } from "../utils/generate-access-token";

export const signUp = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    try {

        if(!name || !email || !password) {
            return res.status(400).send({ success: false, message: "All fields are required" });
        }

        const isExistingUserEmail = await User.findOne({ email });
        if (isExistingUserEmail) {
            return res.status(400).send({ success: false, message: "Email already exists" });
        }

        const hashedPassword = await bcryptjs.hash(password, 10);
        const verificationToken = generateVerificationToken();
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            verificationToken,
            verificationExpiresAt: Date.now() + 24 * 60 * 60 * 1000 // Token valid for 24 hours
        })

        await newUser.save();

        // generateTokenAndSetCookie(res, newUser._id.toString());
        await sendVeriTokenEmail(email, verificationToken);

        res.status(201).send({ 
            success: true, 
            message: "User created successfully.",
            newUser: {
                ...newUser.toObject(),
                password: undefined,
            }
        });
    } catch (error) {
        console.error("Error during sign-up:", error);
        res.status(500).send({ success: false, message: "Internal server error" });
    }
}

export const verifyEmail = async (req: Request, res: Response) => {
    const { verificationCode } = req.body;

    try {
        if(!verificationCode) {
            return res.status(400).json({ message: "Enter verification code." });
        }

        const user = await User.findOne({ 
            verificationToken: verificationCode,  
            // verificationExpiresAt: { $gt: Date.now() }
        });
        if(!user) {
            return res.status(400).json({ message: "Invalid verification code." });
        }
        if (!user.verificationExpiresAt || Date.now() > user.verificationExpiresAt.getTime()) {
            return res.status(400).json({ message: "Verification code has expired." });
        }

        user.isVerified = true,
        user.verificationToken = undefined;
        user.verificationExpiresAt = undefined;

        await user.save();
        await sendSuccessVerifyUser(user.email);

        res.status(200).json({
            success: true,
            message: "Email verified successfully.",
            newUser: {
                ...user.toObject(),
                password: undefined,
            }
        })

    } catch (error) {
        console.log('Error verify email', error)
        res.status(500).send({ success: false, message: "Internal server error" });
    }
}

export const signIn = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        if(!email || !password) {
            return res.status(400).send({ success: false, message: "All fields are required" });
        }

        const user = await User.findOne({email});
        if(!user) {
            return res.status(400).send({ success: false, message: "No user found" });
        }

        if(user.isVerified != true){
            return res.status(400).send({ success: false, message: "User not verified" });
        }

        const isPasswordMatch = await bcryptjs.compare(password, user.password);
        if(!isPasswordMatch){
            return res.status(401).json({ success: false, message: "Invalid credentials" })
        }

        const accessToken = generateAccessToken(user._id.toString());
        const refreshToken = generateRefreshToken(user._id.toString());

        user.refreshToken = refreshToken;
        await user.save();

        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days
        })

        res.status(200).json({ accessToken, _id: user._id, name: user.name });
    } catch (error) {
        console.error("Sign-in error:", error);
        res.status(500).send({ success: false, message: "Internal server error" });
    }  
}

export const refresh = async (req: Request, res: Response) => {

    const cookies = req.cookies
    if(!cookies?.jwt) return res.sendStatus(401);

    const refreshToken = cookies.jwt;

    const user = await User.findOne({ refreshToken }).exec()
    if(!user) return res.sendStatus(403); 

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET as string,
        (err: Error | null, decoded: any) => {
            if (err || user._id.toString() !== decoded.id) {
                return res.sendStatus(403)
            }

            // create new access token      
            const accessToken = jwt.sign(
                { "id": user._id, },
                process.env.ACCESS_TOKEN_SECRET as string,
                { expiresIn: '15m' } 
            )

            res.json({ accessToken, id: user._id });
        }
    )
}

export const logOut = async (req: Request, res: Response) => {
    const cookies = req.cookies
    if(!cookies?.jwt) return res.sendStatus(204); // No Content

    const refreshToken = cookies.jwt;
    try {
        const user = await User.findOne({ refreshToken }).exec();
        if (!user) {
            res.clearCookie('jwt', { httpOnly: true, sameSite: 'strict', secure: true });
            return res.sendStatus(204);
        }

        user.refreshToken = '';
        await user.save();

        res.clearCookie('jwt', { httpOnly: true, sameSite: 'strict', secure: true });
        return res.status(200).json({ message: "Logout successfully"})
    } catch (error) {
        
    }
}