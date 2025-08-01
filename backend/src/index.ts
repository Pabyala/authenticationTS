import express, { Request, Response } from "express";
import dBConnect from "./config/db-connect"; 
import dotenv from "dotenv";
import authRoutes from "./routes/auth/auth-user";
import morgan from "morgan";
// import cookieParser from 'cookie-parser';


dotenv.config();
const app = express();
app.use(express.json()); 
app.use(morgan("dev"));
// app.use(cookieParser());

const PORT = process.env.PORT || 8000;

app.get("/", (req: Request, res: Response) => {
    res.send("Hello, World!");  
});

app.use("/api/auth", authRoutes); 

app.listen(PORT, () => {
    dBConnect()
    console.log(`Server is running on port ${PORT}`);
});