import { Request, Response, NextFunction } from "express";

// Only works for strings
export default function trimRequestBody(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const convertFields = (obj: any) => {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] === "object" && obj[key] !== null) {
          convertFields(obj[key]);
        } else if (typeof obj[key] === "string") {
          obj[key] = obj[key].trim();
        }
      }
    }
  };

  if (req.body) {
    convertFields(req.body);
  }

  next();
}
