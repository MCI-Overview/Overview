import { Router } from "express";
import authRoutes from "./auth";
import bridgeRoutes from "./bridge";
import apiRoutes from "./api";

const router: Router = Router();

router.use("/", authRoutes);
router.use("/bridge", bridgeRoutes);
router.use("/api", apiRoutes);

export default router;
