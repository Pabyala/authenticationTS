import mongoose from "mongoose";

const dBConnect = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URI as string);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.log(error)
    }
}

export default dBConnect;