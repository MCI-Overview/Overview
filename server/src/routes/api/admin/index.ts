import { Router } from "express";
import clientAPIRoutes from "./client";
import projectAPIRoutes from "./project";
import consultantAPIRoutes from "./consultant";

const adminAPIRouter: Router = Router();

adminAPIRouter.use("/", clientAPIRoutes);
adminAPIRouter.use("/", projectAPIRoutes);
adminAPIRouter.use("/", consultantAPIRoutes);

export default adminAPIRouter;
