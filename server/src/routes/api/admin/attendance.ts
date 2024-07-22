import { GetObjectCommand } from "@aws-sdk/client-s3";
import { Request, Response, Router } from "express";
import { User } from "@/types/common";
import { Readable } from "stream";

import { prisma, s3 } from "../../../client";

const attendanceApiRouter: Router = Router();

attendanceApiRouter.get("/attendance/:attendanceCuid/image",
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
        )
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

// TODO: Add permission check
attendanceApiRouter.patch("/attendance/:attendanceCuid/edit", async (req: Request, res: Response) => {
  const { attendanceCuid } = req.params;
  const { clockInTime, clockOutTime, postalCode, status } = req.body;

  try {
    await prisma.attendance.update({
      data: {
        clockInTime,
        clockOutTime,
        postalCode,
        status
      },
      where: {
        cuid: attendanceCuid
      }
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
});

export default attendanceApiRouter;
