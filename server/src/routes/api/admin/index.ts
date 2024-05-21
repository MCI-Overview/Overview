import { Router } from "express";
import clientAPIRoutes from "./client";
import projectAPIRoutes from "./project";
import consultantAPIRoutes from "./consultant";
import candidateAPIRoutes from "./candidate";

const adminAPIRouter: Router = Router();

adminAPIRouter.use("/", clientAPIRoutes);
adminAPIRouter.use("/", projectAPIRoutes);
adminAPIRouter.use("/", consultantAPIRoutes);
adminAPIRouter.use("/", candidateAPIRoutes);

export default adminAPIRouter;
