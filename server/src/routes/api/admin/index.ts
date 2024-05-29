import { Router } from "express";
import shiftAPIRoutes from "./shift";
import clientAPIRoutes from "./client";
import projectAPIRoutes from "./project";
import candidateAPIRoutes from "./candidate";
import consultantAPIRoutes from "./consultant";

const adminAPIRouter: Router = Router();

adminAPIRouter.use("/", shiftAPIRoutes);
adminAPIRouter.use("/", clientAPIRoutes);
adminAPIRouter.use("/", projectAPIRoutes);
adminAPIRouter.use("/", candidateAPIRoutes);
adminAPIRouter.use("/", consultantAPIRoutes);

export default adminAPIRouter;
