import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { User } from "@/types";
import {
  Permission,
  checkPermission,
  PERMISSION_ERROR_TEMPLATE,
} from "../../../utils/check-permission";

const prisma = new PrismaClient();
const attendanceAPIRouter: Router = Router();

const FOURTEEN_DAYS_OFFSET = 14 * 24 * 60 * 60 * 1000;

attendanceAPIRouter.get(
  "/attendance/:candidateNRIC&:projectId&:startDate&:endDate",
  async (req: Request, res: Response) => {
    const user = req.user as User;
    const { candidateNRIC, projectId, startDate, endDate } = req.params;

    if (!candidateNRIC || !projectId) {
      return res.status(400).send("candidateNRIC or projectId is required.");
    }

    let startDateObject = new Date();
    startDateObject.setTime(startDateObject.getTime() - FOURTEEN_DAYS_OFFSET);

    if (startDate) {
      try {
        startDateObject = new Date(startDate);
      } catch (error) {
        return res.status(400).send("Invalid start date.");
      }
    }

    let endDateObject = new Date();
    endDateObject.setTime(endDateObject.getTime() + FOURTEEN_DAYS_OFFSET);

    if (endDate) {
      try {
        endDateObject = new Date(endDate);
      } catch (error) {
        return res.status(400).send("Invalid end date.");
      }
    }

    if (startDateObject > endDateObject) {
      return res.status(400).send("Start date cannot be later than end date.");
    }

    if (candidateNRIC && projectId) {
      const attendanceData = await prisma.attendance.findMany({
        where: {
          candidateNric: candidateNRIC,
          shiftDate: {
            gte: startDateObject,
            lte: endDateObject,
          },
          Shift: {
            projectId: projectId,
          },
          NOT: {
            status: null,
          },
        },
        include: {
          Shift: {
            include: {
              Project: {
                include: {
                  Manage: true,
                },
              },
            },
          },
        },
      });

      if (
        attendanceData.some((shift) =>
          shift.Shift.Project.Manage.some(
            (consultant) => consultant.consultantEmail === user.id,
          ),
        )
      ) {
        return res.send(attendanceData);
      }

      const hasReadAllProjectPermission = await checkPermission(
        user.id,
        Permission.CAN_READ_ALL_PROJECTS,
      );

      if (hasReadAllProjectPermission) {
        return res.send(attendanceData);
      }

      return res
        .status(403)
        .send(PERMISSION_ERROR_TEMPLATE + Permission.CAN_READ_ALL_PROJECTS);
    }

    if (candidateNRIC && !projectId) {
      const hasReadAllProjectPermission = await checkPermission(
        user.id,
        Permission.CAN_READ_ALL_PROJECTS,
      );

      if (hasReadAllProjectPermission) {
        const attendanceData = await prisma.attendance.findMany({
          where: {
            candidateNric: candidateNRIC,
            shiftDate: {
              gte: startDateObject,
              lte: endDateObject,
            },
            NOT: {
              status: null,
            },
          },
          include: {
            Shift: {
              include: {
                Project: {
                  include: {
                    Manage: true,
                  },
                },
              },
            },
          },
        });

        return res.send(attendanceData);
      }

      const attendanceData = await prisma.attendance.findMany({
        where: {
          candidateNric: candidateNRIC,
          shiftDate: {
            gte: startDateObject,
            lte: endDateObject,
          },
          Shift: {
            Project: {
              Manage: {
                some: {
                  consultantEmail: user.id,
                },
              },
            },
          },
          NOT: {
            status: null,
          },
        },
        include: {
          Shift: {
            include: {
              Project: {
                include: {
                  Manage: true,
                },
              },
            },
          },
        },
      });

      return res.send(attendanceData);
    }

    if (projectId && !candidateNRIC) {
      const attendanceData = await prisma.attendance.findMany({
        where: {
          shiftDate: {
            gte: startDateObject,
            lte: endDateObject,
          },
          Shift: {
            projectId: projectId,
          },
          NOT: {
            status: null,
          },
        },
        include: {
          Shift: {
            include: {
              Project: {
                include: {
                  Manage: true,
                },
              },
            },
          },
        },
      });

      if (
        attendanceData.some((shift) =>
          shift.Shift.Project.Manage.some(
            (consultant) => consultant.consultantEmail === user.id,
          ),
        )
      ) {
        return res.send(attendanceData);
      }

      const hasReadAllProjectPermission = await checkPermission(
        user.id,
        Permission.CAN_READ_ALL_PROJECTS,
      );

      if (hasReadAllProjectPermission) {
        return res.send(attendanceData);
      }

      return res
        .status(403)
        .send(PERMISSION_ERROR_TEMPLATE + Permission.CAN_READ_ALL_PROJECTS);
    }

    return res.status(400).send("Invalid request.");
  },
);

export default attendanceAPIRouter;
