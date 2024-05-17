import { Router } from "express";
import authRoutes from "./auth";
import bridgeRoutes from "./bridge";

const router: Router = Router();

router.use("/", authRoutes);
router.use("/bridge", bridgeRoutes);

export default router;
