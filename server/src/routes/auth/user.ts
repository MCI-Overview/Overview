import { Request, Response, Router } from "express";
import passport from "passport";
import "../../utils/local-auth";

const userAuthRouter: Router = Router();

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

userAuthRouter.post("/login", function (req: Request, res: Response, next) {
  passport.authenticate("local", function (err: any, user: any, _info: any) {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.json({ success: false, message: "Authentication failed" });
    }

    req.login(user, (loginErr) => {
      if (loginErr) {
        return next(loginErr);
      }
      return res.json({ success: true, message: "Authentication succeeded" });
    });
  })(req, res, next);
});

export default userAuthRouter;
