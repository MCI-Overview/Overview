// Import dependencies
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import passport from "passport";
import session from "express-session";
import "./middleware/microsoft"
dotenv.config();

// Import routes
import { msLoginRouter } from "./routes/auth-routes";

// Create react app
const app: Express = express();
app.use(session({ 
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
const port = process.env.PORT || 3000;

// Routes
app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});
app.use("/auth", msLoginRouter);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
