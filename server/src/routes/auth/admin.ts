import { Router } from "express";
import passport from "passport";
import "../../utils/microsoft-auth";

const CLIENT_URL = process.env.CLIENT_URL as string;

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
  passport.authenticate("microsoft", {}),
  (req, res) => {
    const userString = JSON.stringify(req.user);
    res.send(`
        <!DOCTYPE html>
        <html>
          <script>
              window.opener.postMessage(${userString}, ${CLIENT_URL});
          </script>
        </html>
    `);
  },
);

export default adminAuthRouter;
