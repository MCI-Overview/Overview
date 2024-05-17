import { Router } from "express";
import userAPIRoutes from "./user";
import adminAPIRoutes from "./admin";

const router: Router = Router();

router.use("/user", userAPIRoutes);
router.use("/admin", adminAPIRoutes);

export default router;
