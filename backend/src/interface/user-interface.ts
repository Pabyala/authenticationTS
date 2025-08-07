import mongoose, { Types } from "mongoose";

export interface IntUser extends Document {
    name: string;
    email: string;
    password: string;
    lastLogin: Date;
    isVerified: boolean;
    resetPasswordToken?: string;
    resetPasswordExpiresAt?: Date;
    verificationToken?: string;
    verificationExpiresAt?: Date;
    refreshToken?: string;
}

interface Request {
    user?: {
        id: string;
    };
}

export interface IntProduct extends Document {
    name: string;
    price: number;
    description: string;
    image?: string[];
    currency?: string;
    createdBy: mongoose.Types.ObjectId;
    updatedBy: mongoose.Types.ObjectId;
}
