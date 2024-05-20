import { Router } from "express";
import clientAPIRoutes from "./client";
import projectAPIRoutes from "./project";

const adminAPIRouter: Router = Router();

adminAPIRouter.use("/", clientAPIRoutes);
adminAPIRouter.use("/", projectAPIRoutes);

export default adminAPIRouter;
