import express, { Request, Response } from "express";
import dBConnect from "./config/db-connect"; // Assuming you have a db connection file
import dotenv from "dotenv";
import authRoutes from "./routes/auth/auth-user";

dotenv.config();
const app = express();

app.get("/", (req: Request, res: Response) => {
    res.send("Hello, World!");  
});

app.use("/api/auth", authRoutes); 

app.listen(3000, () => {
    dBConnect()
    console.log("Server is running on port 3000");
});