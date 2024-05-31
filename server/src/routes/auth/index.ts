import { Router } from "express";
import userAuthRoutes from "./user";
import adminAuthRoutes from "./admin";
import { User } from "@/types";

const router: Router = Router();

router.use("/user", userAuthRoutes);
router.use("/admin", adminAuthRoutes);

router.post("/logout", function (req, res, next) {
  const user = req.user as User;

  if (!user) return res.status(400).send("User not logged in");

  if (user?.userType === "User") {
    return req.logout(function (err) {
      if (err) {
        return next(err);
      }
      return res.status(200).send("Logged out");
    });
  } else {
    return req.logout(function (err) {
      if (err) {
        return next(err);
      }
      return res.status(200).send("Logged out");
    });
  }
});

export default router;
