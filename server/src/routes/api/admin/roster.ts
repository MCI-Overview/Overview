import { Router, Request, Response } from "express";
import { PrismaClient, Role } from "@prisma/client";
import { PrismaError, User } from "@/types";
import {
  PERMISSION_ERROR_TEMPLATE,
  Permission,
  checkPermission,
} from "../../../utils/check-permission";
import moment from "moment";

const prisma = new PrismaClient();
const rosterAPIRouter: Router = Router();

const FOURTEEN_DAYS_OFFSET = 14 * 24 * 60 * 60 * 1000;

function enumerateDays(startDate: Date, endDate: Date) {
  const start = moment(startDate);
  const end = moment(endDate);
  const dates = [];

  for (let date = start; date <= end; date.add(1, "days")) {
    dates.push(date.clone());
  }

  return dates;
}

rosterAPIRouter.get(
  "/roster/:candidateNRIC&:projectId&:startDate&:endDate",
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
          status: null,
          shiftDate: {
            gte: startDateObject,
            lte: endDateObject,
          },
          Shift: {
            ShiftGroup: {
              projectId: projectId,
            },
          },
        },
        include: {
          Shift: {
            include: {
              ShiftGroup: {
                include: {
                  Project: {
                    include: {
                      Manage: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (
        attendanceData.some((shift) =>
          shift.Shift.ShiftGroup.Project.Manage.some(
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
            status: null,
            shiftDate: {
              gte: startDateObject,
              lte: endDateObject,
            },
          },
          include: {
            Shift: {
              include: {
                ShiftGroup: {
                  include: {
                    Project: {
                      include: {
                        Manage: true,
                      },
                    },
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
          status: null,
          shiftDate: {
            gte: startDateObject,
            lte: endDateObject,
          },
          Shift: {
            ShiftGroup: {
              Project: {
                Manage: {
                  some: {
                    consultantEmail: user.id,
                  },
                },
              },
            },
          },
        },
        include: {
          Shift: {
            include: {
              ShiftGroup: {
                include: {
                  Project: {
                    include: {
                      Manage: true,
                    },
                  },
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
          status: null,
          shiftDate: {
            gte: startDateObject,
            lte: endDateObject,
          },
          Shift: {
            ShiftGroup: {
              projectId: projectId,
            },
          },
        },
        include: {
          Shift: {
            include: {
              ShiftGroup: {
                include: {
                  Project: {
                    include: {
                      Manage: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (
        attendanceData.some((shift) =>
          shift.Shift.ShiftGroup.Project.Manage.some(
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
      shiftId,
    },
    include: {
      ShiftGroup: {
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

  if (!shiftData) {
    return res.status(404).send("Shift does not exist.");
  }

  if (
    !shiftData.ShiftGroup.Project.Manage.some(
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
        .send(PERMISSION_ERROR_TEMPLATE + Permission.CAN_EDIT_ALL_PROJECTS);
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
