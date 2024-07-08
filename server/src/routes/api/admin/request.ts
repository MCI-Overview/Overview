import { User } from "@/types/common";
import { prisma, s3 } from "../../../client";
import { Router } from "express";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";
import dayjs from "dayjs";

const requestAPIRouter = Router();

requestAPIRouter.post("/request/:requestCuid/approve", async (req, res) => {
  const user = req.user as User;
  const { requestCuid } = req.params;

  try {
    const request = await prisma.request.findUniqueOrThrow({
      where: {
        cuid: requestCuid,
        status: "PENDING",
      },
      include: {
        Assign: {
          select: {
            Project: {
              select: {
                Manage: true,
              },
            },
          },
        },
      },
    });

    if (
      !request.Assign.Project.Manage.some(
        (assign) =>
          assign.consultantCuid === user.cuid && assign.role === "CLIENT_HOLDER"
      )
    ) {
      return res
        .status(403)
        .send("You are not authorized to approve this request.");
    }

    const transactionRequests = [];

    if (request.type === "MEDICAL_LEAVE") {
      transactionRequests.push(
        prisma.attendance.updateMany({
          where: {
            candidateCuid: request.candidateCuid,
            NOT: {
              leave: "FULLDAY",
            },
            OR: [
              {
                status: null,
              },
              {
                status: "NO_SHOW",
              },
            ],
            shiftDate: {
              gte: dayjs(
                (
                  request.data as {
                    startDate: string;
                  }
                ).startDate
              ).toDate(),
              lte: dayjs(
                (
                  request.data as {
                    startDate: string;
                  }
                ).startDate
              )
                .add(
                  parseInt(
                    (
                      request.data as {
                        numberOfDays: string;
                      }
                    ).numberOfDays,
                    10
                  ) - 1,
                  "day"
                )
                .endOf("day")
                .toDate(),
            },
            Shift: {
              projectCuid: request.projectCuid,
            },
          },
          data: {
            status: "MEDICAL",
          },
        })
      );
    }

    if (request.type === "RESIGNATION") {
      transactionRequests.push(
        prisma.assign.update({
          where: {
            projectCuid_candidateCuid: {
              projectCuid: request.projectCuid,
              candidateCuid: request.candidateCuid,
            },
          },
          data: {
            endDate: (request.data as { lastDay: string }).lastDay,
          },
        })
      );
    }

    if (request.type === "PAID_LEAVE" || request.type === "UNPAID_LEAVE") {
      const leaveDuration = (request.data as { leaveDuration: string })
        .leaveDuration;

      if (leaveDuration === "FULL_DAY") {
        transactionRequests.push(
          prisma.attendance.update({
            where: {
              cuid: (request.data as { leaveRosterCuid: string })
                .leaveRosterCuid,
            },
            data: {
              leave: "FULLDAY",
            },
          })
        );
      }

      if (leaveDuration === "FIRST_HALF") {
        transactionRequests.push(
          prisma.attendance.update({
            where: {
              cuid: (request.data as { leaveRosterCuid: string })
                .leaveRosterCuid,
            },
            data: {
              leave: "HALFDAY",
              shiftType: "SECOND_HALF",
            },
          })
        );
      }

      if (leaveDuration === "SECOND_HALF") {
        transactionRequests.push(
          prisma.attendance.update({
            where: {
              cuid: (request.data as { leaveRosterCuid: string })
                .leaveRosterCuid,
            },
            data: {
              leave: "HALFDAY",
              shiftType: "FIRST_HALF",
            },
          })
        );
      }
    }

    transactionRequests.push(
      prisma.request.update({
        where: {
          cuid: requestCuid,
        },
        data: {
          status: "APPROVED",
        },
      })
    );

    await prisma.$transaction(transactionRequests);

    return res.send("Request approved.");
  } catch (error) {
    console.error("Error while approving request:", error);
    return res.status(500).send("Internal server error");
  }
});

requestAPIRouter.post("/request/:requestCuid/reject", async (req, res) => {
  const user = req.user as User;
  const { requestCuid } = req.params;

  try {
    const request = await prisma.request.findUniqueOrThrow({
      where: {
        cuid: requestCuid,
        status: "PENDING",
      },
      select: {
        Assign: {
          select: {
            Project: {
              select: {
                Manage: true,
              },
            },
          },
        },
      },
    });

    if (
      !request.Assign.Project.Manage.some(
        (assign) =>
          assign.consultantCuid === user.cuid && assign.role === "CLIENT_HOLDER"
      )
    ) {
      return res
        .status(403)
        .send("You are not authorized to reject this request.");
    }

    await prisma.request.update({
      where: {
        cuid: requestCuid,
      },
      data: {
        status: "REJECTED",
      },
    });

    return res.send("Request rejected.");
  } catch (error) {
    console.error("Error while rejecting request:", error);
    return res.status(500).send("Internal server error");
  }
});

requestAPIRouter.get("/request/:requestCuid/image", async (req, res) => {
  const user = req.user as User;
  const { requestCuid } = req.params;

  const request = await prisma.request.findUniqueOrThrow({
    where: {
      cuid: requestCuid,
    },
    select: {
      data: true,
      type: true,
      Assign: {
        select: {
          Project: {
            select: {
              Manage: true,
            },
          },
        },
      },
    },
  });

  if (
    !request.Assign.Project.Manage.some(
      (assign) =>
        assign.consultantCuid === user.cuid && assign.role === "CLIENT_HOLDER"
    )
  ) {
    return res
      .status(403)
      .send("You are not authorized to reject this request.");
  }

  if (request.type === "CLAIM") {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: `receipt/${requestCuid}`,
    });

    const response = await s3.send(command);
    if (response.Body instanceof Readable) {
      return response.Body.pipe(res);
    } else {
      return res.status(500).send("Unexpected response body type");
    }
  }

  if (request.type === "MEDICAL_LEAVE") {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: `mc/${
        (
          request.data as {
            imageUUID: string;
          }
        ).imageUUID
      }`,
    });

    const response = await s3.send(command);
    if (response.Body instanceof Readable) {
      return response.Body.pipe(res);
    } else {
      return res.status(500).send("Unexpected response body type");
    }
  }

  return res.status(400).send("No image found for this request.");
});

requestAPIRouter.get("/request/:requestCuid/roster", async (req, res) => {
  const user = req.user as User;
  const { requestCuid } = req.params;

  try {
    const request = await prisma.request.findUniqueOrThrow({
      where: {
        cuid: requestCuid,
      },
      select: {
        candidateCuid: true,
        projectCuid: true,
        data: true,
        type: true,
        Assign: {
          select: {
            Project: {
              select: {
                Manage: true,
              },
            },
          },
        },
      },
    });

    if (
      !request.Assign.Project.Manage.some(
        (assign) =>
          assign.consultantCuid === user.cuid && assign.role === "CLIENT_HOLDER"
      )
    ) {
      return res
        .status(403)
        .send("You are not authorized to reject this request.");
    }

    if (request.type === "RESIGNATION") {
      return res.status(404).send("No roster details found for this request.");
    }

    if (request.type === "MEDICAL_LEAVE") {
      const affectedRosterData = await prisma.attendance.findMany({
        where: {
          candidateCuid: request.candidateCuid,
          OR: [
            {
              status: null,
            },
            {
              status: "NO_SHOW",
            },
          ],
          shiftDate: {
            gte: dayjs(
              (
                request.data as {
                  startDate: string;
                }
              ).startDate
            ).toDate(),
            lte: dayjs(
              (
                request.data as {
                  startDate: string;
                }
              ).startDate
            )
              .add(
                parseInt(
                  (
                    request.data as {
                      numberOfDays: string;
                    }
                  ).numberOfDays,
                  10
                ) - 1,
                "day"
              )
              .endOf("day")
              .toDate(),
          },
          Shift: {
            projectCuid: request.projectCuid,
          },
        },
        include: {
          Shift: true,
        },
      });

      return res.json(affectedRosterData);
    }

    if (request.type === "CLAIM") {
      const claimRosterData = await prisma.attendance.findUniqueOrThrow({
        where: {
          cuid: (request.data as { claimRosterCuid: string }).claimRosterCuid,
        },
        include: {
          Shift: true,
        },
      });

      return res.json(claimRosterData);
    }

    if (request.type === "UNPAID_LEAVE" || request.type === "PAID_LEAVE") {
      const leaveRosterData = await prisma.attendance.findUniqueOrThrow({
        where: {
          cuid: (request.data as { leaveRosterCuid: string }).leaveRosterCuid,
        },
        include: {
          Shift: true,
        },
      });

      return res.json(leaveRosterData);
    }

    return res.status(400).send("No roster details found for this request.");
  } catch (error) {
    console.error("Error while fetching roster details:", error);
    return res.status(500).send("Internal server error");
  }
});

export default requestAPIRouter;
