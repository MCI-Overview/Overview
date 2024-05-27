import { Router } from "express";
import {
  Candidate,
  MCICompany,
  PrismaClient,
  Role,
  ShiftStatus,
} from "@prisma/client";
import { PrismaError, User, Location } from "@/types";
import {
  checkPermission,
  Permission,
  PERMISSION_ERROR_TEMPLATE,
} from "../../../utils/check-permission";

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
      ShiftGroup: true,
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

  const hasReadAllProjectPermission = await checkPermission(
    user.id,
    Permission.CAN_READ_ALL_PROJECTS,
  );

  if (hasReadAllProjectPermission) {
    return res.send(projectData);
  }

  return res
    .status(401)
    .send(PERMISSION_ERROR_TEMPLATE + Permission.CAN_READ_ALL_PROJECTS);
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

  if (startDateObject && endDateObject && startDateObject > endDateObject) {
    return res.status(400).send("startDate cannot be after endDate.");
  }

  if (locations && !Array.isArray(locations)) {
    return res.status(400).send("locations must be an array.");
  }

  if (locations && Array.isArray(locations)) {
    try {
      locations.map((location: Location) => {
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
  if (employmentBy === "MCI Career Services Pte Ltd") {
    employmentByObject = MCICompany.MCI_CAREER_SERVICES;
  } else if (employmentBy === "MCI Outsourcing Pt Ltd") {
    employmentByObject = MCICompany.MCI_OUTSOURCING;
  } else {
    return res.status(400).send("Invalid employmentBy parameter.");
  }

  const createData = {
    name,
    startDate,
    endDate,
    locations,
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
    const hasHardDeletePermission = await checkPermission(
      user.id,
      Permission.CAN_HARD_DELETE_PROJECTS,
    );

    if (!hasHardDeletePermission) {
      return res
        .status(401)
        .send(PERMISSION_ERROR_TEMPLATE + Permission.CAN_HARD_DELETE_PROJECTS);
    }

    try {
      await prisma.project.delete({
        where: {
          id: projectId,
        },
      });

      return res.send("Project hard deleted.");
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

  if (
    !name &&
    !clientUEN &&
    !employmentBy &&
    !locations &&
    !startDate &&
    !endDate &&
    !candidateHolders
  ) {
    return res
      .status(400)
      .send(
        "At least one field (name, clientUEN, employmentBy, locations, startDate, endDate, candidateHolders) is required to update.",
      );
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

  if (startDateObject && endDateObject && startDateObject > endDateObject) {
    return res.status(400).send("startDate cannot be after endDate.");
  }

  if (locations && !Array.isArray(locations)) {
    return res.status(400).send("locations must be an array.");
  }

  if (locations && Array.isArray(locations)) {
    try {
      locations.map((location: Location) => {
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
    Permission.CAN_EDIT_ALL_PROJECTS,
  );

  if (hasCanEditAllProjects) {
    const updateData = {
      ...(name && { name }),
      ...(clientUEN && { clientUEN }),
      ...(locations && { locations }),
      ...(employmentByObject && {
        employmentBy: { update: employmentByObject },
      }),
      ...(startDateObject && { startDate: startDateObject }),
      ...(endDateObject && { endDate: endDateObject }),
      ...(candidateHolders && {
        candidateHolders: { update: candidateHolders },
      }),
    };

    try {
      await prisma.project.update({
        where: {
          id: projectId,
        },
        data: updateData,
      });
      return res.send(`Project ${projectId} updated successfully.`);
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
      ...(locations && { locations }),
      ...(employmentByObject && {
        employmentBy: { update: employmentByObject },
      }),
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

projectAPIRouter.get("/project/:projectId/candidates", async (req, res) => {
  const user = req.user as User;
  const { projectId } = req.params;

  if (!projectId) {
    return res.status(400).send("projectId is required.");
  }

  const projectData = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
    include: {
      Assign: {
        include: {
          Candidate: true,
        },
      },
      Manage: true,
    },
  });

  if (!projectData) {
    return res.status(404).send("Project does not exist.");
  }

  let candidateData: any = projectData.Assign.map((assign) => assign.Candidate);

  const hasReadCandidateDetailsPermission = await checkPermission(
    user.id,
    Permission.CAN_READ_CANDIDATE_DETAILS,
  );

  if (!hasReadCandidateDetailsPermission) {
    candidateData = candidateData.map((candidate: Candidate) => {
      const { nric, name, phoneNumber, emergencyContact } = candidate;
      return {
        nric,
        name,
        phoneNumber,
        emergencyContact,
      };
    });
  }

  if (
    projectData.Manage.some(
      (consultant) => consultant.consultantEmail === user.id,
    )
  ) {
    return res.send(candidateData);
  }

  const hasReadAllProjectPermission = await checkPermission(
    user.id,
    Permission.CAN_READ_ALL_PROJECTS,
  );

  if (hasReadAllProjectPermission) {
    return res.send(candidateData);
  }

  return res
    .status(401)
    .send(PERMISSION_ERROR_TEMPLATE + Permission.CAN_READ_ALL_PROJECTS);
});

projectAPIRouter.post("/project/:projectId/candidates", async (req, res) => {
  const user = req.user as User;
  const { projectId } = req.params;
  const candidates = req.body;

  if (!projectId) {
    return res.status(400).send("projectId is required.");
  }

  const projectData = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
    include: {
      Manage: true,
    },
  });

  if (!projectData) {
    return res.status(404).send("Project does not exist.");
  }

  const hasPermission =
    projectData.Manage.some((m) => m.consultantEmail === user.id) ||
    (await checkPermission(user.id, Permission.CAN_EDIT_ALL_PROJECTS));

  if (!hasPermission) {
    return res
      .status(401)
      .send(PERMISSION_ERROR_TEMPLATE + Permission.CAN_EDIT_ALL_PROJECTS);
  }

  if (!candidates || !Array.isArray(candidates)) {
    return res.status(400).send("candidates array is required.22");
  }

  // verify all candidates have nric, name, phoneNumber, dateOfBirth
  const invalidCandidates = candidates.filter(
    (cdd: any) =>
      !cdd.nric || !cdd.name || !cdd.phoneNumber || !cdd.dateOfBirth,
  );

  if (invalidCandidates.length > 0) {
    return res.status(400).send("Invalid candidates data.");
  }

  let candidateObjects: {
    nric: any;
    phoneNumber: any;
    name: any;
    hasOnboarded: boolean;
    nationality: null;
    dateOfBirth: Date;
    bankDetails: undefined;
    address: undefined;
    emergencyContact: undefined;
  }[] = [];

  try {
    candidateObjects = candidates.map((cdd: any) => {
      return {
        nric: cdd.nric,
        phoneNumber: cdd.phoneNumber,
        name: cdd.name,
        hasOnboarded: false,
        nationality: null,
        dateOfBirth: new Date(Date.parse(cdd.dateOfBirth)),
        bankDetails: undefined,
        address: undefined,
        emergencyContact: undefined,
      };
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send("Invalid dateOfBirth parameter.");
  }

  const existingCandidates = await prisma.candidate.findMany({
    where: {
      nric: {
        in: candidateObjects.map((cdd) => cdd.nric),
      },
    },
  });

  const newCandidates = candidateObjects.filter(
    (cdd) => !existingCandidates.some((existCdd) => existCdd.nric === cdd.nric),
  );

  try {
    await prisma.$transaction(async (prisma) => {
      await prisma.candidate.createMany({
        data: newCandidates,
      });

      const assignData = candidateObjects.map((cdd) => {
        return {
          candidateNric: cdd.nric,
          consultantEmail: user.id,
          projectId: projectId,
        };
      });

      await prisma.assign.createMany({
        data: assignData,
      });
    });
    return res.send("Candidates added successfully.");
  } catch (error) {
    const err = error as PrismaError;
    console.log(err);
    return res.status(500).send("Internal server error.");
  }
});

projectAPIRouter.get("/project/:projectId/shifts", async (req, res) => {
  const user = req.user as User;
  const { projectId } = req.params;

  if (!projectId) {
    return res.status(400).send("projectId is required.");
  }

  const projectData = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
    include: {
      Manage: true,
      ShiftGroup: {
        include: {
          Shift: true,
        },
      },
    },
  });

  if (!projectData) {
    return res.status(404).send("Project does not exist.");
  }

  const responseData = projectData.ShiftGroup.filter(
    (shift) => shift.shiftStatus === ShiftStatus.ACTIVE,
  ).map((shiftGroup) => shiftGroup.Shift);

  if (
    projectData.Manage.some(
      (consultant) => consultant.consultantEmail === user.id,
    )
  ) {
    return res.send(responseData);
  }

  const hasReadAllProjectPermission = await checkPermission(
    user.id,
    Permission.CAN_READ_ALL_PROJECTS,
  );

  if (hasReadAllProjectPermission) {
    return res.send(responseData);
  }

  return res
    .status(401)
    .send(PERMISSION_ERROR_TEMPLATE + Permission.CAN_READ_ALL_PROJECTS);
});

projectAPIRouter.get("/project/:projectId/shiftGroups", async (req, res) => {
  const user = req.user as User;
  const { projectId } = req.params;

  if (!projectId) {
    return res.status(400).send("projectId is required.");
  }

  const projectData = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
    include: {
      Manage: true,
      ShiftGroup: {
        include: {
          Shift: true,
        },
      },
    },
  });

  if (!projectData) {
    return res.status(404).send("Project does not exist.");
  }

  const responseData = projectData.ShiftGroup.filter(
    (shiftGroup) => shiftGroup.shiftStatus === ShiftStatus.ACTIVE,
  );

  if (
    projectData.Manage.some(
      (consultant) => consultant.consultantEmail === user.id,
    )
  ) {
    return res.send(responseData);
  }

  const hasReadAllProjectPermission = await checkPermission(
    user.id,
    Permission.CAN_READ_ALL_PROJECTS,
  );

  if (hasReadAllProjectPermission) {
    return res.send(responseData);
  }

  return res
    .status(401)
    .send(PERMISSION_ERROR_TEMPLATE + Permission.CAN_READ_ALL_PROJECTS);
});

projectAPIRouter.get("/projects", async (req, res) => {
  const user = req.user as User;

  const projectsData = await prisma.project.findMany({
    where: {
      Manage: {
        some: {
          consultantEmail: user.id,
        },
      },
    },
    include: {
      Client: true,
    },
  });

  return res.send(projectsData);
});

projectAPIRouter.get("/projects/all", async (req, res) => {
  const user = req.user as User;

  const hasReadAllProjectsPermission = await checkPermission(
    user.id,
    Permission.CAN_READ_ALL_PROJECTS,
  );

  if (!hasReadAllProjectsPermission) {
    return res
      .status(401)
      .send(PERMISSION_ERROR_TEMPLATE + Permission.CAN_READ_ALL_PROJECTS);
  }

  const projectsData = await prisma.project.findMany();

  return res.send(projectsData);
});

export default projectAPIRouter;
