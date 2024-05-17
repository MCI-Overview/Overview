import { Router } from "express";
import passport from "passport";
import "../../utils/microsoft-auth";

const CLIENT_URL = process.env.CLIENT_URL as string;
const SERVER_URL = process.env.SERVER_URL as string;

if (!CLIENT_URL) {
  throw new Error("CLIENT_URL must be defined in your environment variables");
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
  passport.authenticate("microsoft", { failureRedirect: `${SERVER_URL}/admin/login` }),
  (req, res) => {
    // Assuming req.user contains the authenticated user information
    const userString = encodeURIComponent(JSON.stringify(req.user));
    res.redirect(`${CLIENT_URL}/admin/dashboard`);
  },
);

export default adminAuthRouter;
