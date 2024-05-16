import { Router } from "express";
import passport from "passport";
import "../../utils/microsoft-auth";

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
              window.opener.postMessage(${userString}, 'http://localhost:5173')
          </script>
        </html>
    `);
  },
);

export default adminAuthRouter;
