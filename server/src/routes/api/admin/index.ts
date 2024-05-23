import { Router } from "express";
import shiftAPIRoutes from "./shift";
import clientAPIRoutes from "./client";
import rosterAPIRoutes from "./roster";
import projectAPIRoutes from "./project";
import candidateAPIRoutes from "./candidate";
import consultantAPIRoutes from "./consultant";
import attendanceAPIRoutes from "./attendance";

const adminAPIRouter: Router = Router();

adminAPIRouter.use("/", shiftAPIRoutes);
adminAPIRouter.use("/", clientAPIRoutes);
adminAPIRouter.use("/", projectAPIRoutes);
adminAPIRouter.use("/", candidateAPIRoutes);
adminAPIRouter.use("/", consultantAPIRoutes);
adminAPIRouter.use("/", rosterAPIRoutes);
adminAPIRouter.use("/", attendanceAPIRoutes);

export default adminAPIRouter;
