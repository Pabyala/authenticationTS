import express, { Request, Response } from "express";
import dBConnect from "./config/db-connect"; 
import dotenv from "dotenv";
import authRoutes from "./routes/auth/auth-user";
import productRoutes from "./routes/api/product-api";
import morgan from "morgan";
import cookieParser from 'cookie-parser';
import cors from "cors";
import { verifyJWT } from "./middlewares/verify-jwt";

dotenv.config();
const app = express();
app.use(express.json()); 
app.use(morgan("dev"));
app.use(cookieParser());
app.use(cors())

const PORT = process.env.PORT || 8000;

app.get("/", (req: Request, res: Response) => {
    res.send("Hello, World!");  
});

app.use("/v1/auth", authRoutes); 
app.use("/v1/products", productRoutes);

app.listen(PORT, () => {
    dBConnect()
    console.log(`Server is running on port ${PORT}`);
});