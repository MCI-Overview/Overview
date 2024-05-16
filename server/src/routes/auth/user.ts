import express, { Request, Response, Router } from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const authRouter: Router = express.Router();

passport.serializeUser(function (user: any, cb) {
  process.nextTick(function () {
    cb(null, user);
  });
});

passport.deserializeUser(function (user: any, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});

passport.use(
  new LocalStrategy(async function verify(username, password, cb) {
    const data = await prisma.users.findUnique({
      where: { username: username },
    });

    if (!data) {
      return cb(null, false, { message: "Invalid username or password." });
    }

    const { hash } = data;

    bcrypt.compare(password, hash, function (err, result) {
      if (err) {
        return cb(err);
      }

      if (!result) {
        return cb(null, false, { message: "Invalid username or password." });
      }

      return cb(null, { id: data.username, isUser: true });
    });
  }),
);

authRouter.post("/login", function (req: Request, res: Response, next) {
  passport.authenticate("local", function (err: any, user: any, info: any) {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.send({ success: false, message: "Authentication failed" });
    }

    req.login(user, (loginErr) => {
      if (loginErr) {
        return next(loginErr);
      }
      return res.send({ success: true, message: "Authentication succeeded" });
    });
  })(req, res, next);
});

export default authRouter;
