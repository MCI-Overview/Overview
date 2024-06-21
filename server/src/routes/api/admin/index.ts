import { Router } from "express";
import shiftAPIRoutes from "./shift";
import clientAPIRoutes from "./client";
import projectAPIRoutes from "./project";
import requestAPIRoutes from "./request";
import candidateAPIRoutes from "./candidate";
import consultantAPIRoutes from "./consultant";
import { User } from "@/types/common";
import { prisma } from "../../../client";
import { PrismaError } from "@/types";

const adminAPIRouter: Router = Router();

adminAPIRouter.use("/", shiftAPIRoutes);
adminAPIRouter.use("/", clientAPIRoutes);
adminAPIRouter.use("/", projectAPIRoutes);
adminAPIRouter.use("/", candidateAPIRoutes);
adminAPIRouter.use("/", consultantAPIRoutes);
adminAPIRouter.use("/", requestAPIRoutes);

adminAPIRouter.get("/", async (req, res) => {
  const { cuid } = req.user as User;

  try {
    const candidateData = await prisma.consultant.findUniqueOrThrow({
      where: {
        cuid,
      },
    });

    return res.json({ ...req.user, ...candidateData });
  } catch (error) {
    const prismaError = error as PrismaError;
    if (prismaError.code === "P2025") {
      return res.status(404).send("Consultant does not exist.");
    }

    return res.status(500).send("Internal server error");
  }
});

export default adminAPIRouter;
