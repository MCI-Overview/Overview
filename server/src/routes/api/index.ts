import { NextFunction, Router } from "express";
import userAPIRoutes from "./user";
import adminAPIRoutes from "./admin";
import { User } from "@/types/common";
import { Request, Response } from "express";
import { getPermissions } from "../../utils/permissions";

const router: Router = Router();

function checkAdmin(req: Request, res: Response, next: NextFunction) {
  const user: User = req.user as User;
  if (!(user?.userType == "Admin")) return res.status(401).send("Unauthorized");

  return next();
}

function checkUser(req: Request, res: Response, next: NextFunction) {
  const user: User = req.user as User;
  if (!(user?.userType == "User")) return res.status(401).send("Unauthorized");

  return next();
}

router.use("/user", checkUser, userAPIRoutes);
router.use("/admin", checkAdmin, adminAPIRoutes);

router.get("/", (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).send("Unauthorized, no user login.");
  }

  const user = req.user as User;

  return res.json(user);
});

export default router;
