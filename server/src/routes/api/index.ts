import { NextFunction, Router } from "express";
import userAPIRoutes from "./user";
import adminAPIRoutes from "./admin";
import { User } from "@/types";
import { Request, Response } from "express";

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

router.get("/", (req, res) => {
  const user = req.user as User;
  res.send(user || {});
});

export default router;
