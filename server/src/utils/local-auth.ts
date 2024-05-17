import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

passport.use(
  new LocalStrategy(async function verify(username, password, cb) {
    const loginData = await prisma.users.findUnique({
      where: { username: username },
    });

    if (!loginData) {
      return cb(null, false, { message: "Invalid username or password." });
    }

    const userData = await prisma.candidate.findUnique({
      where: { nric: username },
    });

    if (!userData) {
      return cb(null, false, {
        message: "Invalid profile. Please contact a consultant.",
      });
    }

    const { hash } = loginData;

    bcrypt.compare(password, hash, function (err, result) {
      if (err) {
        return cb(err);
      }

      if (!result) {
        return cb(null, false, { message: "Invalid username or password." });
      }

      return cb(null, {
        id: loginData.username,
        name: userData.name,
        isUser: true,
      });
    });
  }),
);
