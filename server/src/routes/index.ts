import { Router } from "express";
import { corsOptions } from "../../config/cors-options";
import authRoutes from "./auth";
import cors from "cors";
import apiRoutes from "./api";
import trimRequestBody from "../middleware/trimRequestBody";
import validateStringFields from "../middleware/validateStringFields";

const router: Router = Router();

router.use(cors(corsOptions));
router.use(trimRequestBody);
router.use(validateStringFields);
router.use("/", authRoutes);
router.use("/api", apiRoutes);

export default router;
