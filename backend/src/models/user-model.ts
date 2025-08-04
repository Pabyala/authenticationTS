import mongoose, { Document, Schema } from 'mongoose';
import { IntUser } from '../interface/user-interface';

const UserSchema: Schema = new Schema<IntUser>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    lastLogin: { type: Date, default: Date.now },
    isVerified: { type: Boolean, default: false},
    resetPasswordToken: { type: String, default: undefined },
    resetPasswordExpiresAt: { type: Date, default: undefined },
    verificationToken: { type: String, default: undefined },
    verificationExpiresAt: { type: Date, default: undefined },
    refreshToken: { type: String, default: "" }
    },
    { timestamps: true }
);

const User = mongoose.model<IntUser>('User', UserSchema);
export default User;