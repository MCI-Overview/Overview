import { Router } from "express";
import passport from "passport";
import "../../utils/microsoft-auth";

const CLIENT_URL = process.env.CLIENT_URL as string;
const SERVER_URL = process.env.SERVER_URL as string;

if (!CLIENT_URL) {
  throw new Error("CLIENT_URL must be defined in your environment variables");
}

if (!SERVER_URL) {
  throw new Error("SERVER_URL must be defined in your environment variables");
}

const adminAuthRouter = Router();

adminAuthRouter.get(
  "/login",
  passport.authenticate("microsoft", {
    prompt: "select_account",
  }),
);

adminAuthRouter.get(
  "/auth/callback",
  passport.authenticate("microsoft", {
    failureRedirect: `${SERVER_URL}/admin/login`,
  }),
  (_req, res) => {
    res.redirect(`${CLIENT_URL}/admin`);
  },
);

export default adminAuthRouter;
