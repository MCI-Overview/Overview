import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

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
