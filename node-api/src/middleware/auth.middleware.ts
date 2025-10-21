import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const verifyAccessToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.AmplioAT|| req.header("Authorization")?.replace("Bearer ","");

  if (!token) return res.status(401).json({ message: "Unauthorized - No token" });

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);
    (req as any).user = decoded; // 👈 attaches _id, etc
    next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
