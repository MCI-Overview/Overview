import { Request, Response, NextFunction, Router } from "express";

import userAPIRoutes from "./user";
import adminAPIRoutes from "./admin";
import { User } from "@/types/common";
import { prisma } from "../../client";

const router: Router = Router();

function checkAdmin(req: Request, res: Response, next: NextFunction) {
  const user: User = req.user as User;
  if (!(user?.userType == "Admin")) return res.status(401).send("Unauthorized");

  return next();
}

function checkUser(req: Request, res: Response, next: NextFunction) {
  const user: User = req.user as User;
  if (!(user?.userType == "User")) return res.status(401).send("Unauthorized");

  return next();
}

router.use("/user", checkUser, userAPIRoutes);
router.use("/admin", checkAdmin, adminAPIRoutes);

router.get("/", (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).send("Unauthorized, no user login.");
  }

  const user = req.user as User;

  return res.json(user);
});

router.get("/public-holidays", async (_req, res) => {
  const holidays = await prisma.publicHoliday.findMany();

  return res.json(
    holidays.reduce((acc, holiday) => {
      const { date } = holiday;

      const year = date.getFullYear().toString();

      if (!acc[year]) {
        acc[year] = [];
      }

      acc[year].push(holiday);

      return acc;
    }, {} as Record<string, typeof holidays>)
  );
});

router.get("/public-holidays/:year", async (req, res) => {
  const { year } = req.params;

  const holidays = await prisma.publicHoliday.findMany({
    where: {
      date: {
        gte: new Date(`${year}-01-01`),
        lte: new Date(`${year}-12-31`),
      },
    },
  });

  return res.json(holidays);
});

export default router;
