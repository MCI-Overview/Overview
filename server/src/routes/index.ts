import { Router } from "express";
import { corsOptions } from "../../config/cors-options"
import authRoutes from "./auth";
import bridgeRoutes from "./bridge";
import cors from "cors";

const router: Router = Router();

router.use("/", authRoutes);
router.use(cors(corsOptions));
router.use("/bridge", bridgeRoutes);

export default router;
