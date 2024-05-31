import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

passport.use(
  new LocalStrategy(async function verify(username, password, cb) {
    try {
      const loginData = await prisma.user.findUniqueOrThrow({
        where: { username: username.toUpperCase() },
        include: { Candidate: true },
      });

      const { hash, Candidate } = loginData;
      const { cuid, name } = Candidate;

      bcrypt.compare(password, hash, function (err, result) {
        if (err) {
          return cb(err);
        }

        if (!result) {
          return cb(null, false, { message: "Invalid username or password." });
        }

        return cb(null, {
          cuid,
          name,
          nric: username,
          userType: "User",
        });
      });
    } catch (error) {
      return cb(null, false, { message: "Invalid username or password." });
    }
  }),
);
