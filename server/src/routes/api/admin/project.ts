import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { PrismaError, User } from "../../../types";

const prisma = new PrismaClient();

const projectAPIRouter: Router = Router();

projectAPIRouter.get("/project", async (req, res) => {
  return res.status(400).send("No project ID specified.");
});

projectAPIRouter.get("/project/:projectId", async (req, res) => {
  const user = req.user as User;
  const projectId = req.params.projectId;

  const projectData = await prisma.consultant.findUnique({
    where: {
      email: user.id,
      Manage: {
        some: {
          projectId: projectId,
        },
      },
    },
  });
  if (!projectData) {
    return res
      .status(404)
      .send("Project does not exist or unauthorized to view project.");
  }

  return res.send(projectData);
});

projectAPIRouter.get("/getExisting", async (req, res) => {
  try {
    const projectData = await prisma.project.findMany({
      select: {
        oldReferenceId: true,
      },
    }) as { oldReferenceId: string | null }[];

    // Filter out null values if you only want non-null oldReferenceIds
    const oldReferenceIds = projectData.map(project => project.oldReferenceId).filter(id => id !== null);

    res.json(oldReferenceIds);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

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

projectAPIRouter.post("/project/create", async (req, res) => {
  const user = req.user as User;
  const name = req.body.name;
  const clientId = req.body.clientId;
  const status = req.body.status || "ACTIVE";
  const candidateHolders = req.body.candidateHolders;

  let locations = req.body.locations;
  let startDate = req.body.startDate;
  let endDate = req.body.endDate;

  if (!name) {
    return res.status(400).send("name is required.");
  }

  if (!clientId) {
    return res.status(400).send("clientId is required.");
  }

  if (!locations) {
    return res.status(400).send("locations is required.");
  }

  if (!startDate) {
    return res.status(400).send("startDate is required.");
  }

  if (!endDate) {
    return res.status(400).send("endDate is required.");
  }

  if (!candidateHolders) {
    return res.status(400).send("candidateHolders is required.");
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

  try {
    await prisma.project.create({
      data: {
        name: name,
        status: status,
        clientId: clientId,
        locations: locations,
        startDate: startDate,
        endDate: endDate,
        Manage: {
          createMany: {
            data: [
              {
                consultantEmail: user.id,
              },
              ...candidateHolders.map((email: string) => {
                return {
                  consultantEmail: email,
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
