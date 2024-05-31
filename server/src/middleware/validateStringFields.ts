import { Request, Response, NextFunction } from "express";

// Only works for strings
export default function validateStringFields(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  if (req.body) {
    convertFields(req.body);
  }

  next();
}

const convertFields = (obj: any) => {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === "object" && obj[key] !== null) {
        convertFields(obj[key]);
      } else if (typeof obj[key] === "string") {
        const convert = fieldsAndConverters.find(
          (field) => field.field === key,
        )?.convert;
        if (convert) {
          obj[key] = convert(obj[key]);
        }
      }
    }
  }
};

const fieldsAndConverters = [
  { field: "nric", convert: (value: string) => value.toUpperCase() },
  { field: "email", convert: (value: string) => value.toLowerCase() },
];
