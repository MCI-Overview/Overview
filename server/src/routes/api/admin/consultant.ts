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

consultantAPIRoutes.get(
  "/consultant/:consultantCuid/candidates",
  async (req: Request, res: Response) => {
    const { consultantCuid } = req.params;

    try {
      const assigns = await prisma.assign.findMany({
        where: {
          consultantCuid,
        },
        include: {
          Candidate: true,
          Project: true,
          Requests: true,
        },
      });

      const response = assigns.map((assign) => {
        return {
          candidateCuid: assign.candidateCuid,
          candidateNric: assign.Candidate.nric,
          candidateName: assign.Candidate.name,
          projectCuid: assign.projectCuid,
          projectName: assign.Project.name,
          startDate: assign.startDate,
          endDate: assign.endDate,
          hasOnboarded: assign.Candidate.hasOnboarded,
        };
      });

      return res.send(response);
    } catch (error) {
      console.error("Error while fetching candidate data", error);
      return res.status(500).send("Error while fetching candidate data");
    }
  }
);

consultantAPIRoutes.get("/consultants", async (_req, res) => {
  const consultantsData = await prisma.consultant.findMany({
    where: {
      status: "ACTIVE",
    },
    select: {
      cuid: true,
      name: true,
      email: true,
      contact: true,
      department: true,
      designation: true,
      registration: true,
    },
  });

  return res.send(consultantsData);
});

export default consultantAPIRoutes;
