import { Router } from "express";
import userAuthRoutes from "./user";
import adminAuthRoutes from "./admin";

const router: Router = Router();

router.use("/user", userAuthRoutes);
router.use("/admin", adminAuthRoutes);

export default router;
