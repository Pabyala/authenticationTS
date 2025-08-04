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
