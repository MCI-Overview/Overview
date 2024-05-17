import { Router } from "express";
import clientAPIRoutes from "./client";

const adminAPIRouter: Router = Router();

adminAPIRouter.use("/", clientAPIRoutes);

export default adminAPIRouter;
