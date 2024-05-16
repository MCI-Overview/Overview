import { Router } from "express";
import authRoutes from "./auth";

const router: Router = Router();

router.use("/", authRoutes);

export default router;
