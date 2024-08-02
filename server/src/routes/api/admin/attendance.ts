import { GetObjectCommand } from "@aws-sdk/client-s3";
import { Request, Response, Router } from "express";
import { User } from "@/types/common";
import { Readable } from "stream";

import { prisma, s3 } from "../../../client";
import {
  checkPermission,
  PERMISSION_ERROR_TEMPLATE,
  PermissionList,
} from "../../../utils/permissions";
import { RequestStatus } from "@prisma/client";
import dayjs from "dayjs";

const attendanceApiRouter: Router = Router();

/**
GET /api/admin/attendance/:attendanceCuid/image

Retrieve the image of the attendance record with the given cuid.

Parameters:
attendanceCuid

Steps:
1. Check permissions, requires either:
  a. User is either a client or a candidate holder of the project
  b. User has CAN_READ_ALL_PROJECTS permission
2. Retrieve the attendance image with the given cuid from the S3 bucket
*/
attendanceApiRouter.get(
  "/attendance/:attendanceCuid/image",
  async (req: Request, res: Response) => {
    const user = req.user as User;
    const { attendanceCuid } = req.params;

    try {
      const attendanceData = await prisma.attendance.findUnique({
        where: {
          cuid: attendanceCuid,
          clockInTime: {
            not: null,
          },
        },
        select: {
          candidateCuid: true,
          Shift: {
            select: {
              projectCuid: true,
              Project: {
                select: {
                  Manage: true,
                },
              },
            },
          },
        },
      });

      if (!attendanceData) {
        return res.status(404).send("Attendance not found");
      }

      if (
        !attendanceData.Shift.Project.Manage.some(
          (manage) => manage.consultantCuid === user.cuid
        ) ||
        (await checkPermission(user.cuid, PermissionList.CAN_READ_ALL_PROJECTS))
      ) {
        return res.status(403).send("Forbidden");
      }
      const command = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: `projects/${attendanceData.Shift.projectCuid}/clock-in/${attendanceData.candidateCuid}/${attendanceCuid}.jpg`,
      });

      const response = await s3.send(command);
      if (response.Body instanceof Readable) {
        return response.Body.pipe(res);
      } else {
        return res.status(500).send("Unexpected response body type");
      }
    } catch (error) {
      console.error(error);
      return res.status(500).send("Internal server error");
    }
  }
);

/**
PATCH /api/admin/attendance/:attendanceCuid/edit

Edit the attendance record with the given cuid.

Parameters:
attendanceCuid

Steps:
1. Check permissions, requires either:
  a. User is a client holder of the project
  b. User has CAN_EDIT_ALL_PROJECTS permission
2. Update the attendance record
*/
attendanceApiRouter.patch(
  "/attendance/:attendanceCuid/edit",
  async (req: Request, res: Response) => {
    const user = req.user as User;
    const { attendanceCuid } = req.params;
    const { clockInTime, clockOutTime, location, status } = req.body;

    try {
      const attendance = await prisma.attendance.findUnique({
        where: {
          cuid: attendanceCuid,
        },
        select: {
          Shift: {
            select: {
              projectCuid: true,
              Project: {
                select: {
                  Manage: true,
                },
              },
            },
          },
        },
      });

      if (!attendance) {
        return res.status(404).json({
          message: "Attendance not found.",
        });
      }

      if (
        !attendance.Shift.Project.Manage.some(
          (manage) => manage.consultantCuid === user.cuid
        ) ||
        (await checkPermission(user.cuid, PermissionList.CAN_EDIT_ALL_PROJECTS))
      ) {
        return res.status(403).json({
          message: "Forbidden.",
        });
      }

      const clockInTimeObject = dayjs(clockInTime);
      let clockOutTimeObject = dayjs(clockOutTime);

      if (
        clockOutTimeObject.isValid() &&
        clockOutTimeObject.isBefore(clockInTimeObject)
      ) {
        clockOutTimeObject.add(1, "day");
      }

      await prisma.attendance.update({
        data: {
          ...(clockInTimeObject.isValid() && {
            clockInTime: clockInTimeObject.toDate(),
          }),
          ...(clockOutTimeObject.isValid() && {
            clockOutTime: clockOutTimeObject.toDate(),
          }),
          location,
          status,
        },
        where: {
          cuid: attendanceCuid,
        },
      });

      return res.json({
        message: "Attendance updated successfully.",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal server error.",
      });
    }
  }
);

/**
 * DELETE /api/admin/roster/:rosterCuid
 *
 * Delete the roster record with the given cuid.
 *
 * Parameters:
 * rosterCuid
 *
 * Steps:
 * 1. Check permissions, requires either:
 *  a. User is a client holder of the project
 *  b. User has CAN_EDIT_ALL_PROJECTS permission
 * 2. Check if any requests are pending or approved
 * 3. Perform the deletion
 *
 */
attendanceApiRouter.delete("/roster/:rosterCuid", async (req, res) => {
  const user = req.user as User;
  const { rosterCuid } = req.params;

  if (!rosterCuid)
    return res.status(400).json({
      message: "Please specify a roster cuid.",
    });

  try {
    const attendanceToBeDeleted = await prisma.attendance.findUnique({
      where: { cuid: rosterCuid },
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
        Request: {
          select: {
            status: true,
          },
        },
      },
    });

    if (!attendanceToBeDeleted) {
      return res.status(404).json({ message: "Attendance not found." });
    }

    const hasPermission =
      attendanceToBeDeleted.Shift.Project.Manage.some(
        (manage) => manage.consultantCuid === user.cuid
      ) ||
      (await checkPermission(user.cuid, PermissionList.CAN_EDIT_ALL_PROJECTS));

    if (!hasPermission) {
      return res
        .status(401)
        .send(PERMISSION_ERROR_TEMPLATE + PermissionList.CAN_EDIT_ALL_PROJECTS);
    }

    // Check if any requests are pending or approved
    const hasPendingOrApprovedRequests = attendanceToBeDeleted.Request.some(
      (request) =>
        request.status === RequestStatus.PENDING ||
        request.status === RequestStatus.APPROVED
    );

    if (hasPendingOrApprovedRequests) {
      return res.status(400).json({
        message: "Cannot delete roster with pending or approved requests.",
      });
    }

    // Perform the deletion
    await prisma.attendance.delete({
      where: { cuid: rosterCuid },
    });

    return res.json({ message: "Attendance deleted successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

export default attendanceApiRouter;
