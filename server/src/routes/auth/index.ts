import { Router } from "express";
import userAuthRoutes from "./user";

const router: Router = Router();

router.use("/user", userAuthRoutes);

export default router;
