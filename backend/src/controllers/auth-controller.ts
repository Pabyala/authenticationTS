import express, { Request, Response } from "express";
import User from "../models/user-model";
import bcryptjs from "bcryptjs";
import { generateVerificationToken } from "../utils/generate-random-token";
import { generateTokenAndSetCookie } from "../utils/generate-token-set-cookie";
import { sendSuccessVerifyUser, sendVeriTokenEmail } from "../resend/email-resend";
import jwt from "jsonwebtoken";

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

        const accessToken = jwt.sign(
            { userId: user._id }, 
            process.env.ACCESS_TOKEN_SECRET as string, 
            { expiresIn: '10s'} // 15m for production
        )

        const refreshToken = jwt.sign(
            { userId: user._id},
            process.env.REFRESH_TOKEN_SECRET as string,
            { expiresIn: '1d'}
        )

        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days
        })

        // res.json({ accessToken });
        res.status(200).json({ accessToken, userId: user._id });
    } catch (error) {
        console.error("Sign-in error:", error);
        res.status(500).send({ success: false, message: "Internal server error" });
    }  
}

export const refresh = async (req: Request, res: Response) => {
    const cookies = req.cookies;
    const refreshToken = cookies?.jwt;

    if (!refreshToken) {
        return res.status(401).json({ message: "Unauthorized - No token" });
    }

    try {
        // ✅ Decode refresh token and extract payload
        const decoded = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET as string
        ) as { userId: string };
        
        // ✅ Find user using decoded userId
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ message: "Unauthorized - User not found" });
        }

        // ✅ Issue new access token
        const accessToken = jwt.sign(
            { userId: user._id },
            process.env.ACCESS_TOKEN_SECRET as string,
            { expiresIn: "15m" } // You can adjust expiration
        );

        return res.status(200).json({ accessToken });
    } catch (error) {
        console.error("Refresh token error:", error);
        return res.status(403).json({ message: "Forbidden - Invalid or expired token" });
    }


    // if (!cookies?.jwt) {
    //     res.status(401).json({ message: "Unauthorized"})
    // }

    // const refreshToken = cookies.jwt

    // jwt.verify(
    //     refreshToken,
    //     process.env.REFRESH_TOKEN_SECRET as string,
    //     async (err, decode: any) => {
    //         if (err) {
    //             return res.status(403).json({ message: "Forbidden" });
    //         }

    //         try {
    //             const foundUser = await User.findById(decoded.userId);
    //             if (!foundUser) {
    //                 return res.status(401).json({ message: "Unauthorized" });
    //             }

    //             const accessToken = jwt.sign(
    //                 { userId: foundUser._id },
    //                 process.env.ACCESS_TOKEN_SECRET as string,
    //                 { expiresIn: "10s" }
    //             );

    //             return res.status(200).json({ accessToken });
    //         } catch (error) {
    //             return res.status(500).json({ message: "Server error" });
    //         }
    //     }

        // asyncHandler(async (error, decode) => {
        //     if(err) {
        //         return res.status(403).json({ message: 'Forbidden'})
        //     }

        //     const foundUser = await User.findOne({ userId: decode._id})
        //     if(!foundUser) {
        //         return res.status(401).json({ message: 'Unauthorized'})
        //     }

        //     const accessToken = jwt.sign(
        //         { userId: foundUser._id }, 
        //         process.env.ACCESS_TOKEN_SECRET as string, 
        //         { expiresIn: '10s'} // 15m for production
        //     )

        //     res.json({ accessToken })
        // })
    // )

}


export const logOut = async (req: Request, res: Response) => {
    res.clearCookie('token');
    return res.status(200).json({ message: "Logout successfully"})
}