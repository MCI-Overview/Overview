import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { PrismaError } from "@/types";

const prisma = new PrismaClient();

const clientAPIRoutes: Router = Router();

clientAPIRoutes.get("/client/:clientUEN"),
  async (req: Request, res: Response) => {
    const clientUEN = req.params.clientId;

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

clientAPIRoutes.get("/clients", async (_req, res) => {
  // const clientsData = await prisma.client.findMany({
  //   select: {
  //     id: true,
  //     name: true,
  //   },
  // });

  const clientsData = [
    {
      UEN: "123456789A",
      name: "company A"
    },
    {
      UEN: "987654321B",
      name: "company B"
    },
  ]
  return res.send(clientsData);
});

clientAPIRoutes.post("/client/create", async (req, res) => {
  const clientUEN = req.body.uen;
  const clientName = req.body.name;

  if (!clientName) {
    return res.status(400).send("name is required.");
  }

  try {
    await prisma.client.create({
      data: {
        UEN: clientUEN,
        name: clientName,
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

export default clientAPIRoutes;
