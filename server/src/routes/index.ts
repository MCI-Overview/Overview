import { Router } from "express";
import { corsOptions } from "../../config/cors-options";
import authRoutes from "./auth";
import cors from "cors";
import apiRoutes from "./api";

const router: Router = Router();

router.use("/", authRoutes);
router.use(cors(corsOptions));
router.use("/api", apiRoutes);

export default router;
