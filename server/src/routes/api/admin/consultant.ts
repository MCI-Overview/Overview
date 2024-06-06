import { Router, Request, Response } from "express";
import { prisma } from "../../../client";

const consultantAPIRoutes: Router = Router();

consultantAPIRoutes.get("/consultant/:cuid"),
  async (req: Request, res: Response) => {
    const { consultantId: cuid } = req.params;

    try {
      const consultantData = await prisma.consultant.findUniqueOrThrow({
        where: {
          cuid: cuid,
        },
        select: {
          name: true,
          email: true,
          status: true,
          contact: true,
          department: true,
          designation: true,
          registration: true,
        },
      });

      return res.send(consultantData);
    } catch (error) {
      return res.status(404).send("Consultant does not exist.");
    }
  };

consultantAPIRoutes.get("/consultants", async (_req, res) => {
  const consultantsData = await prisma.consultant.findMany({
    where: {
      status: "ACTIVE",
    },
    select: {
      cuid: true,
      name: true,
      email: true,
    },
  });

  return res.send(consultantsData);
});

export default consultantAPIRoutes;
