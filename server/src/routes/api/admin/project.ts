import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { PrismaError, User } from "../../../types";
import checkPermission from "../../../utils/check-permission";

const prisma = new PrismaClient();

const projectAPIRouter: Router = Router();

projectAPIRouter.get("/project", async (req, res) => {
  return res.status(400).send("No project ID specified.");
});

projectAPIRouter.get("/project/:projectId", async (req, res) => {
  const user = req.user as User;
  const projectId = req.params.projectId;

  const projectData = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
    select: {
      Manage: true,
    },
  });

  if (!projectData) {
    return res.status(404).send("Project does not exist.");
  }

  if (
    projectData.Manage.some(
      (consultant) => consultant.consultantEmail === user.id,
    )
  ) {
    return res.send(projectData);
  }

  const hasPermission = await checkPermission(user.id, "canReadAllProjects");

  if (hasPermission) {
    return res.send(projectData);
  }

  return res.status(401).send("Unauthorized");
});

projectAPIRouter.get("/projects", async (req, res) => {
  const user = req.user as User;

  const projectsData = prisma.consultant.findUnique({
    where: {
      email: user.id,
    },
    select: {
      Manage: true,
    },
  });

  return res.send(projectsData);
});

projectAPIRouter.get("/projects/all", async (req, res) => {
  const user = req.user as User;

  const hasPermission = await checkPermission(user.id, "canReadAllProjects");

  if (!hasPermission) {
    return res.status(401).send("Unauthorized");
  }

  const projectsData = await prisma.project.findMany();

  return res.send(projectsData);
});

projectAPIRouter.post("/project/create", async (req, res) => {
  const user = req.user as User;

  // Required fields
  const name = req.body.name;
  const clientId = req.body.clientId;

  let employmentBy = req.body.employmentBy;
  let locations = req.body.locations;
  let startDate = req.body.startDate;
  let endDate = req.body.endDate;

  // Optional fields
  const status = req.body.status || "ACTIVE";
  const candidateHolders = req.body.candidateHolders || [];

  if (!name || !clientId || !locations || !startDate || !endDate) {
    return res
      .status(400)
      .send("name, clientId, locations, startDate, and endDate are required.");
  }

  if (
    employmentBy !== "MCI Career Services Pte Ltd" &&
    employmentBy !== "MCI Outsourcing Pte Ltd"
  ) {
    return res
      .status(400)
      .send(
        'Invalid employmentBy value. Must be either "MCI Career Services" or "MCI Outsourcing Pte Ltd"',
      );
  }

  if (!Array.isArray(candidateHolders)) {
    return res.status(400).send("candidateHolders must be an array.");
  }

  try {
    locations = JSON.parse(locations);
  } catch (e) {
    return res.status(400).send("locations must be a valid JSON string.");
  }

  try {
    startDate = new Date(startDate);
  } catch (e) {
    return res.status(400).send("startDate must be a valid date.");
  }

  try {
    endDate = new Date(endDate);
  } catch (e) {
    return res.status(400).send("endDate must be a valid date.");
  }

  if (employmentBy === "MCI Career Services Pte Ltd") {
    employmentBy = "MCI_CAREER_SERVICES";
  } else if (employmentBy === "MCI Outsourcing Pte Ltd") {
    employmentBy = "MCI_OUTSOURCING";
  }

  try {
    await prisma.project.create({
      data: {
        name: name,
        status: status,
        clientId: clientId,
        locations: locations,
        startDate: startDate,
        endDate: endDate,
        employmentBy: employmentBy,
        Manage: {
          createMany: {
            data: [
              {
                consultantEmail: user.id,
              },
              ...candidateHolders.map((email: string) => {
                return {
                  consultantEmail: email,
                  Role: "CANDIDATE_HOLDER",
                };
              }),
            ],
          },
        },
      },
    });
  } catch (e) {
    const error = e as PrismaError;

    if (
      error.code === "P2003" &&
      error.meta.field_name === "Project_clientId_fkey (index)"
    ) {
      return res.status(400).send("clientId does not exist.");
    }

    console.log(e);
    return res.status(500).send("Internal server error.");
  }

  return res.send("Project successfully created");
});

projectAPIRouter.post("/project/delete", async (req, res) => {
  const user = req.user as User;
  const projectId = req.body.projectId;

  try {
    await prisma.project.update({
      where: {
        id: projectId,
        Manage: {
          some: {
            consultantEmail: user.id,
          },
        },
      },
      data: {
        status: "DELETED",
      },
    });
  } catch (e) {
    const error = e as PrismaError;

    if (error.code === "P2025") {
      return res.status(404).send("Project does not exist.");
    }

    return res.status(500).send("Internal server error.");
  }
});

projectAPIRouter.post("/project/update", async (req, res) => {
  const user = req.user as User;
  const projectId = req.body.projectId;

  // TODO: Implement project update logic

  try {
    await prisma.project.update({
      where: {
        id: projectId,
        Manage: {
          some: {
            consultantEmail: user.id,
          },
        },
      },
      data: {},
    });
  } catch (e) {
    const error = e as PrismaError;

    return res.status(500).send("Internal server error.");
  }

  return res.send("Project updated");
});

export default projectAPIRouter;
