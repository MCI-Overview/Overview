import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { PrismaError, User } from "@/types";
import {
  checkPermission,
  Permission,
  PERMISSION_ERROR_TEMPLATE,
} from "../../../utils/check-permission";

const prisma = new PrismaClient();

const consultantAPIRoutes: Router = Router();

consultantAPIRoutes.get("/consultant/:consultantId"),
  async (req: Request, res: Response) => {
    const { consultantId } = req.params;

    const consultantData = await prisma.consultant.findUnique({
      where: {
        email: consultantId,
        status: "ACTIVE",
      },
      select: {
        email: true,
        name: true,
        contact: true,
        department: true,
        designation: true,
        registration: true,
      },
    });

    if (!consultantData) {
      return res.status(404).send("Consultant does not exist.");
    }

    return res.send(consultantData);
  };

consultantAPIRoutes.get("/consultants", async (_req, res) => {
  const consultantsData = await prisma.consultant.findMany({
    select: {
      email: true,
      name: true,
    },
  });

  return res.send(consultantsData);
});

consultantAPIRoutes.post("/consultant/create", async (req, res) => {
  const user = req.user as User;

  const {
    email,
    name,
    contact,
    designation,
    department,
    registration,
    permissions,
  } = req.body;

  if (!email) {
    return res.status(400).send("email is required.");
  }

  if (!name) {
    return res.status(400).send("name is required.");
  }

  if (!contact) {
    return res.status(400).send("contact is required.");
  }

  if (!designation) {
    return res.status(400).send("designation is required.");
  }

  if (!department) {
    return res.status(400).send("department is required.");
  }

  const hasCreateConsultantPermission = await checkPermission(
    user.id,
    Permission.CAN_CREATE_CONSULTANTS,
  );

  if (!hasCreateConsultantPermission) {
    return res
      .status(401)
      .send(PERMISSION_ERROR_TEMPLATE + Permission.CAN_CREATE_CONSULTANTS);
  }

  try {
    await prisma.consultant.create({
      data: {
        email: email,
        name: name,
        contact: contact,
        designation: designation,
        department: department,
        registration: registration,
        permissions: permissions,
      },
    });
  } catch (error) {
    const prismaError = error as PrismaError;
    if (prismaError.code === "P2002") {
      const prismaErrorMetaTarget = prismaError.meta.target || [];

      if (prismaErrorMetaTarget.includes("email")) {
        return res
          .status(400)
          .send("Consultant already exists. (Duplicate Email)");
      }

      if (prismaErrorMetaTarget.includes("contact")) {
        return res.status(400).send("Duplicate contact number specified.");
      }
    }

    return res.status(500).send("Internal server error.");
  }

  return res.send("Consultant created successfully.");
});

export default consultantAPIRoutes;
