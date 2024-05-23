import { Router } from "express";
import { MCICompany, PrismaClient, Role } from "@prisma/client";
import { PrismaError, User, Location } from "@/types";
import checkPermission from "../../../utils/check-permission";

const prisma = new PrismaClient();

const projectAPIRouter: Router = Router();

projectAPIRouter.get("/project/:projectId", async (req, res) => {
  const user = req.user as User;
  const { projectId } = req.params;

  const projectData = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
    include: {
      Manage: true,
      Shift: true,
      Assign: true,
      Client: true,
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

  return res
    .status(401)
    .send('Unauthorized. User does not have permission "canReadAllProjects".');
});

projectAPIRouter.post("/project", async (req, res) => {
  const user = req.user as User;
  const {
    name,
    clientUEN,
    clientName,
    employmentBy,
    locations,
    startDate,
    endDate,
    candidateHolders,
  } = req.body;

  if (!name) {
    return res.status(400).send("name is required.");
  }

  if (!clientUEN) {
    return res.status(400).send("clientUEN is required.");
  }

  if (!employmentBy) {
    return res.status(400).send("employmentBy is required.");
  }

  if (!startDate) {
    return res.status(400).send("startDate is required.");
  }

  if (!endDate) {
    return res.status(400).send("endDate is required.");
  }

  let endDateObject: Date | undefined;
  if (endDate) {
    try {
      endDateObject = new Date(Date.parse(endDate));
    } catch (error) {
      return res.status(400).send("Invalid endDate parameter.");
    }
  }

  let startDateObject: Date | undefined;
  if (startDate) {
    try {
      startDateObject = new Date(Date.parse(startDate));
    } catch (error) {
      return res.status(400).send("Invalid startDate parameter.");
    }
  }

  if (startDateObject && endDateObject && startDateObject >= endDateObject) {
    return res.status(400).send("startDate cannot be after endDate.");
  }

  if (locations && !Array.isArray(locations)) {
    return res.status(400).send("locations must be an array.");
  }

  let locationsObject: Location[] | undefined;
  if (locations && Array.isArray(locations)) {
    try {
      locationsObject = locations.map((location: Location) => {
        return {
          postalCode: location.postalCode,
          address: location.address,
          longitude: location.longitude,
          latitude: location.latitude,
        };
      });
    } catch (error) {
      return res.status(400).send("Invalid locations parameter.");
    }
  }

  if (candidateHolders && !Array.isArray(candidateHolders)) {
    return res.status(400).send("candidateHolders must be an array.");
  }

  let employmentByObject: MCICompany | undefined;
  if (employmentBy === "MCI Career Services Ptd Ltd") {
    employmentByObject = MCICompany.MCI_CAREER_SERVICES;
  } else if (employmentBy === "MCI Outsourcing Ptd Ltd") {
    employmentByObject = MCICompany.MCI_OUTSOURCING;
  } else {
    return res.status(400).send("Invalid employmentBy parameter.");
  }

  const createData = {
    name,
    clientUEN,
    startDate,
    endDate,
    locations: JSON.stringify(locationsObject),
    employmentBy: employmentByObject,
  };

  try {
    await prisma.project.create({
      data: {
        ...createData,
        Manage: {
          createMany: {
            data: [
              {
                consultantEmail: user.id,
                role: Role.CLIENT_HOLDER,
              },
              ...candidateHolders.map((email: string) => {
                return {
                  consultantEmail: email,
                  role: Role.CANDIDATE_HOLDER,
                };
              }),
            ],
          },
        },
        Client: {
          connectOrCreate: {
            where: {
              UEN: clientUEN,
            },
            create: {
              UEN: clientUEN,
              name: clientName,
            },
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

projectAPIRouter.delete("/project", async (req, res) => {
  const user = req.user as User;
  const { projectId, hardDelete } = req.body;

  if (hardDelete) {
    const hasPermission = await checkPermission(
      user.id,
      "canHardDeleteProjects",
    );

    if (!hasPermission) {
      return res
        .status(401)
        .send(
          'Unauthorized. User does not have permission "canHardDeleteProjects".',
        );
    }

    try {
      await prisma.project.delete({
        where: {
          id: projectId,
        },
      });
    } catch (error) {
      return res.status(500).send("Internal server error.");
    }
  }

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

  return res.send("Project deleted");
});

projectAPIRouter.patch("/project", async (req, res) => {
  const user = req.user as User;

  const {
    name,
    clientUEN,
    employmentBy,
    locations,
    startDate,
    endDate,
    candidateHolders,
    projectId,
  } = req.body;

  if (!projectId) {
    return res.status(400).send("projectId is required.");
  }

  let employmentByObject: MCICompany | undefined;
  if (employmentBy === "MCI Career Services Ptd Ltd") {
    employmentByObject = MCICompany.MCI_CAREER_SERVICES;
  } else if (employmentBy === "MCI Outsourcing Ptd Ltd") {
    employmentByObject = MCICompany.MCI_OUTSOURCING;
  } else {
    return res.status(400).send("Invalid employmentBy parameter.");
  }

  let endDateObject: Date | undefined;
  if (endDate) {
    try {
      endDateObject = new Date(Date.parse(endDate));
    } catch (error) {
      return res.status(400).send("Invalid endDate parameter.");
    }
  }

  let startDateObject: Date | undefined;
  if (startDate) {
    try {
      startDateObject = new Date(Date.parse(startDate));
    } catch (error) {
      return res.status(400).send("Invalid startDate parameter.");
    }
  }

  if (startDateObject && endDateObject && startDateObject >= endDateObject) {
    return res.status(400).send("startDate cannot be after endDate.");
  }

  if (locations && !Array.isArray(locations)) {
    return res.status(400).send("locations must be an array.");
  }

  let locationsObject: Location[] | undefined;
  if (locations && Array.isArray(locations)) {
    try {
      locationsObject = locations.map((location: Location) => {
        return {
          postalCode: location.postalCode,
          address: location.address,
          longitude: location.longitude,
          latitude: location.latitude,
        };
      });
    } catch (error) {
      return res.status(400).send("Invalid locations parameter.");
    }
  }

  if (candidateHolders && !Array.isArray(candidateHolders)) {
    return res.status(400).send("candidateHolders must be an array.");
  }

  const hasCanEditAllProjects = await checkPermission(
    user.id,
    "canEditAllProjects",
  );

  if (hasCanEditAllProjects) {
    const updateData = {
      ...(name && { name }),
      ...(clientUEN && { clientUEN }),
      ...(employmentByObject && {
        employmentBy: { update: employmentByObject },
      }),
      ...(locationsObject && { locations: { update: locationsObject } }),
      ...(startDateObject && { startDate: startDateObject }),
      ...(endDateObject && { endDate: endDateObject }),
      ...(candidateHolders && {
        candidateHolders: { update: candidateHolders },
      }),
    };

    // Check if no fields are provided to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).send("No valid fields provided for update.");
    }

    try {
      await prisma.project.update({
        where: {
          id: projectId,
        },
        data: updateData,
      });
    } catch (error) {
      const prismaError = error as PrismaError;
      if (prismaError.code === "P2025") {
        return res.status(404).send("Project not found.");
      }

      return res.status(500).send(prismaError);
    }
  }

  try {
    const updateData = {
      ...(name && { name }),
      ...(employmentByObject && {
        employmentBy: { update: employmentByObject },
      }),
      ...(locationsObject && { locations: { update: locationsObject } }),
      ...(startDateObject && { startDate: startDateObject }),
      ...(endDateObject && { endDate: endDateObject }),
      ...(candidateHolders && {
        candidateHolders: { update: candidateHolders },
      }),
    };

    await prisma.project.update({
      where: {
        id: projectId,
        Manage: {
          some: {
            consultantEmail: user.id,
          },
        },
      },
      data: updateData,
    });
  } catch (error) {
    const prismaError = error as PrismaError;
    if (prismaError.code === "P2025") {
      return res.status(404).send("Project not found.");
    }

    return res.status(500).send(prismaError);
  }

  return res.send(`Project ${projectId} updated successfully.`);
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
    return res
      .status(401)
      .send(
        'Unauthorized. User does not have permission "canReadAllProjects".',
      );
  }

  const projectsData = await prisma.project.findMany();

  return res.send(projectsData);
});

export default projectAPIRouter;
