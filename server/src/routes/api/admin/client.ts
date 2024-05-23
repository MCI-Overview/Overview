import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { PrismaError, User } from "@/types";
import {
  Permission,
  checkPermission,
  PERMISSION_ERROR_TEMPLATE,
} from "../../../utils/check-permission";

const prisma = new PrismaClient();

const clientAPIRoutes: Router = Router();

clientAPIRoutes.get("/client/:clientUEN"),
  async (req: Request, res: Response) => {
    const { clientUEN } = req.params;

    const clientData = await prisma.client.findUnique({
      where: {
        UEN: clientUEN,
      },
    });

    if (!clientData) {
      return res.status(404).send("Client does not exist.");
    }

    return res.send(clientData);
  };

clientAPIRoutes.post("/client", async (req, res) => {
  const { UEN, name } = req.body;

  if (!name) {
    return res.status(400).send("name is required.");
  }

  try {
    await prisma.client.create({
      data: {
        UEN: UEN,
        name: name,
      },
    });
  } catch (error) {
    const prismaError = error as PrismaError;
    if (prismaError.code === "P2002") {
      return res.status(400).send("Client already exists.");
    }

    return res.status(500).send("Internal server error.");
  }

  return res.send("Client created successfully.");
});

clientAPIRoutes.delete("/client", async (req, res) => {
  const user = req.user as User;
  const { UEN } = req.body;

  if (!UEN) {
    return res.status(400).send("UEN is required.");
  }

  const hasDeleteClientPermission = checkPermission(
    user.id,
    Permission.CAN_DELETE_CLIENTS,
  );

  if (!hasDeleteClientPermission) {
    return res
      .status(401)
      .send(PERMISSION_ERROR_TEMPLATE + Permission.CAN_DELETE_CLIENTS);
  }

  try {
    const clientToDelete = await prisma.client.findUnique({
      where: {
        UEN: UEN,
      },
      include: {
        Project: true,
      },
    });

    if (!clientToDelete) {
      return res.status(404).send("Client does not exist.");
    }

    if (clientToDelete.Project.length > 0) {
      return res.status(400).send("Client has linked projects.");
    }

    await prisma.client.delete({
      where: {
        UEN: UEN,
      },
    });
  } catch (error) {
    return res.status(500).send("Internal server error.");
  }

  return res.send("Client deleted successfully.");
});

async function updateClient(req: Request, res: Response) {
  const user = req.user as User;
  const { UEN, name } = req.body;

  if (!name) {
    return res.status(400).send("name is required.");
  }

  const hasUpdateClientPermission = checkPermission(
    user.id,
    Permission.CAN_UPDATE_CLIENTS,
  );

  if (!hasUpdateClientPermission) {
    return res
      .status(401)
      .send(PERMISSION_ERROR_TEMPLATE + Permission.CAN_UPDATE_CLIENTS);
  }

  try {
    await prisma.client.update({
      where: {
        UEN: UEN,
      },
      data: {
        name: name,
      },
    });
  } catch (error) {
    return res.status(500).send("Internal server error.");
  }

  return res.send("Client updated successfully.");
}

clientAPIRoutes.put("/client", updateClient);
clientAPIRoutes.patch("/client", updateClient);

clientAPIRoutes.get("/clients", async (_req, res) => {
  const clientsData = await prisma.client.findMany({
    select: {
      UEN: true,
      name: true,
    },
  });

  return res.send(clientsData);
});

export default clientAPIRoutes;
