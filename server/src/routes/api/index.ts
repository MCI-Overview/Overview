import { Router } from "express";
import userAPIRoutes from "./user";
import adminAPIRoutes from "./admin";
import { User } from "@/types";

const router: Router = Router();

router.use("/user", userAPIRoutes, (req, res) => {
  const user: User = req.user as User;
  if (!user?.isUser) {
    res.status(401).send("Unauthorized");
    return;
  }
});

router.use("/admin", adminAPIRoutes, (req, res) => {
  const user: User = req.user as User;
  if (!user?.isAdmin) {
    res.status(401).send("Unauthorized");
    return;
  }
});

router.get("/", (req, res) => {
  const user = req.user as User;
  res.send(user || {});
});

export default router;
