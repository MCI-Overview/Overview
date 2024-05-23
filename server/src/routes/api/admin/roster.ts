import { Router, Request, Response } from "express";
import { PrismaClient, Role } from "@prisma/client";
import { PrismaError, User } from "@/types";
import {
  Permission,
  PermissionErrorMessage,
  checkPermission,
} from "@/utils/check-permission";
import moment from "moment";

const prisma = new PrismaClient();
const rosterAPIRouter: Router = Router();

function enumerateDays(startDate: Date, endDate: Date) {
  const start = moment(startDate);
  const end = moment(endDate);
  const dates = [];

  for (let date = start; date <= end; date.add(1, "days")) {
    dates.push(date.clone());
  }

  return dates;
}

rosterAPIRouter.post("/roster", async (req: Request, res: Response) => {
  const user = req.user as User;
  const { candidateNRIC, shiftId, shiftDate, startDate, endDate } = req.body;

  if (!candidateNRIC) {
    return res.status(400).send("candidateNRIC is required.");
  }

  if (!shiftId) {
    return res.status(400).send("shiftId is required.");
  }

  if (!shiftDate && !(startDate && endDate)) {
    return res
      .status(400)
      .send("shiftDate or startDate and endDate is required.");
  }

  let shiftDateObject: Date | undefined;
  if (shiftDate) {
    try {
      shiftDateObject = new Date(shiftDate);
    } catch (error) {
      return res.status(400).send("Invalid shiftDate.");
    }
  }

  let startDateObject: Date | undefined;
  if (startDate) {
    try {
      startDateObject = new Date(startDate);
    } catch (error) {
      return res.status(400).send("Invalid startDate.");
    }
  }

  let endDateObject: Date | undefined;
  if (endDate) {
    try {
      endDateObject = new Date(endDate);
    } catch (error) {
      return res.status(400).send("Invalid endDate.");
    }
  }

  if (startDateObject && endDateObject && startDateObject > endDateObject) {
    return res.status(400).send("startDate cannot be later than endDate.");
  }

  const shiftData = await prisma.shift.findUnique({
    where: {
      id: shiftId,
    },
    include: {
      Project: {
        include: {
          Manage: true,
        },
      },
    },
  });

  if (!shiftData) {
    return res.status(404).send("Shift does not exist.");
  }

  if (
    !shiftData.Project.Manage.some(
      (consultant) =>
        consultant.consultantEmail === user.id &&
        consultant.role === Role.CLIENT_HOLDER,
    )
  ) {
    const hasEditAllProjectPermission = await checkPermission(
      user.id,
      Permission.CAN_EDIT_ALL_PROJECTS,
    );

    if (!hasEditAllProjectPermission) {
      return res
        .status(401)
        .send(PermissionErrorMessage.CANNOT_EDIT_PROJECT_ERROR_MESSAGE);
    }
  }

  let createData: {
    candidateNric: string;
    shiftId: string;
    shiftDate: Date;
  }[] = [];

  if (shiftDateObject) {
    createData = [
      {
        candidateNric: candidateNRIC,
        shiftId: shiftId,
        shiftDate: shiftDateObject,
      },
    ];
  }

  if (startDateObject && endDateObject) {
    const dates = enumerateDays(startDateObject, endDateObject);

    createData = dates.map((date) => ({
      candidateNric: candidateNRIC,
      shiftId: shiftId,
      shiftDate: date.toDate(),
    }));
  }

  try {
    await prisma.attendance.createMany({
      data: createData,
      skipDuplicates: true,
    });

    return res.send("Roster created successfully.");
  } catch (error) {
    const prismaError = error as PrismaError;
    if (prismaError.code === "P2002") {
      return res.status(400).send("Attendance already exists.");
    }

    return res.status(500).send("Internal server error.");
  }
});

export default rosterAPIRouter;
