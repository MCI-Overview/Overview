import { Request, Response, NextFunction } from "express";

// Only works for strings
export default function trimRequestBody(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === "string") {
        req.body[key] = req.body[key].trim();
      }
    }
  }
  next();
}
