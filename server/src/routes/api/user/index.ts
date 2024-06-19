import { Router } from "express";
import { prisma } from "../../../client";
import { PrismaError } from "@/types";
import { User } from "@/types/common";
import attendanceAPIRoutes from "./attendance";
import profileAPIRoutes from "./profile";
import requestAPIRoutes from "./request";
import dayjs from "dayjs";
const userAPIRouter: Router = Router();

userAPIRouter.use("/", attendanceAPIRoutes);
userAPIRouter.use("/", profileAPIRoutes);
userAPIRouter.use("/", requestAPIRoutes);

userAPIRouter.get("/", async (req, res) => {
  const { cuid } = req.user as User;

  try {
    const candidateData = await prisma.candidate.findUniqueOrThrow({
      where: {
        cuid,
      },
    });

    return res.send({ ...req.user, ...candidateData });
  } catch (error) {
    const prismaError = error as PrismaError;
    if (prismaError.code === "P2025") {
      return res.status(404).send("Candidate does not exist.");
    }

    return res.status(500).send("Internal server error");
  }
});

userAPIRouter.get("/projects", async (req, res) => {
  const { cuid } = req.user as User;

  try {
    const projects = await prisma.project.findMany({
      where: {
        Assign: {
          some: {
            candidateCuid: cuid,
            startDate: {
              lte: new Date(),
            },
            endDate: {
              gte: new Date(),
            },
          },
        },
        status: "ACTIVE",
      },
    });

    return res.send(
      projects.map((project) => ({
        name: project.name,
        cuid: project.cuid,
        startDate: project.startDate,
        endDate: project.endDate,
        noticePeriodDuration: project.noticePeriodDuration,
        noticePeriodUnit: project.noticePeriodUnit,
      })),
    );
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }
});

userAPIRouter.get("/claimableShifts", async (req, res) => {
  const { cuid } = req.user as User;

  try {
    const roster = await prisma.attendance.findMany({
      where: {
        candidateCuid: cuid,
        shiftDate: {
          gte: dayjs().startOf("day").subtract(1, "month").toDate(),
          lte: dayjs().toDate(),
        },
      },
      include: {
        Shift: {
          include: {
            Project: true,
          },
        },
      },
    });

    return res.send(
      roster.reduce((acc, shift) => {
        const projectCuid = shift.Shift.projectCuid;
        if (!acc[projectCuid]) {
          acc[projectCuid] = {};
          acc[projectCuid]["name"] = shift.Shift.Project.name;
          acc[projectCuid]["shifts"] = [];
        }

        acc[projectCuid]["shifts"].push(shift);

        return acc;
      }, {} as Record<string, any>),
    );
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }
});

userAPIRouter.get("/upcomingShifts", async (req, res) => {
  const { cuid } = req.user as User;

  try {
    const shifts = await prisma.attendance.findMany({
      where: {
        candidateCuid: cuid,
        shiftDate: {
          gte: dayjs().startOf("day").toDate(),
          lte: dayjs().endOf("day").add(1, "month").toDate(),
        },
      },
      include: {
        Shift: {
          include: {
            Project: true,
          },
        },
      },
    });

    return res.send(
      shifts.reduce((acc, shift) => {
        const projectCuid = shift.Shift.Project.cuid;
        if (!acc[projectCuid]) {
          acc[projectCuid] = {};
          acc[projectCuid]["name"] = shift.Shift.Project.name;
          acc[projectCuid]["shifts"] = [];
        }

        acc[projectCuid]["shifts"].push(shift);

        return acc;
      }, {} as Record<string, any>),
    );
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }
});

export default userAPIRouter;
