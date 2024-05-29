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

clientAPIRoutes.get("/client/:uen"),
  async (req: Request, res: Response) => {
    const { uen } = req.params;

    try {
      const clientData = await prisma.client.findUniqueOrThrow({
        where: {
          uen,
        },
      });

      return res.send(clientData);
    } catch (error) {
      return res.status(404).send("Client does not exist.");
    }
  };

clientAPIRoutes.post("/client", async (req, res) => {
  const { uen, name } = req.body;

  if (!uen) return res.status(400).send("uen is required.");
  if (!name) return res.status(400).send("name is required.");

  try {
    await prisma.client.create({
      data: {
        uen,
        name,
      },
    });
  } catch (error) {
    const prismaError = error as PrismaError;
    if (prismaError.code === "P2002") {
      return res.status(400).send("Client already exists.");
    }

    console.log(error);
    return res.status(500).send("Internal server error.");
  }

  return res.send("Client created successfully.");
});

clientAPIRoutes.delete("/client", async (req, res) => {
  const user = req.user as User;
  const { uen } = req.body;

  if (!uen) return res.status(400).send("uen is required.");

  const hasDeleteClientPermission = checkPermission(
    user.cuid,
    Permission.CAN_DELETE_CLIENTS,
  );

  if (!hasDeleteClientPermission) {
    return res
      .status(401)
      .send(PERMISSION_ERROR_TEMPLATE + Permission.CAN_DELETE_CLIENTS);
  }

  try {
    const clientToDelete = await prisma.client.findUniqueOrThrow({
      where: {
        uen,
      },
      include: {
        Project: true,
      },
    });

    if (clientToDelete.Project.length > 0) {
      return res.status(400).send("Client has linked projects.");
    }

    await prisma.client.delete({
      where: {
        uen,
      },
    });

    return res.send("Client deleted successfully.");
  } catch (error) {
    return res.status(404).send("Client does not exist.");
  }
});

async function updateClient(req: Request, res: Response) {
  const user = req.user as User;
  const { uen, name } = req.body;

  if (!uen) return res.status(400).send("uen is required.");
  if (!name) return res.status(400).send("name is required.");

  const hasUpdateClientPermission = checkPermission(
    user.cuid,
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
        uen,
      },
      data: {
        name: name,
      },
    });

    return res.send("Client updated successfully.");
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error.");
  }
}

clientAPIRoutes.put("/client", updateClient);
clientAPIRoutes.patch("/client", updateClient);

clientAPIRoutes.get("/clients", async (_req, res) => {
  const clientsData = await prisma.client.findMany({
    select: {
      uen: true,
      name: true,
    },
  });

  return res.send(clientsData);
});

export default clientAPIRoutes;
