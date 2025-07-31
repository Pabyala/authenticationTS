import express, { Request, Response } from "express";

export const signUp = async (req: Request, res: Response) => {
    // Your sign-up logic here
    res.status(201).send("User signed up successfully");
}