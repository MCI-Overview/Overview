import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import routes from "./routes";
import passport from "passport";
import session from "express-session";
import PgSession from "connect-pg-simple";
import path from "path";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;
const pgSession = PgSession(session);

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    store: new pgSession({
      tableName: "Sessions",
      createTableIfMissing: true,
      conObject: {
        user: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
        host: process.env.DATABASE_HOST,
        port: parseInt(process.env.DATABASE_PORT as string),
        database: process.env.DATABASE_NAME,
        ssl: {
          rejectUnauthorized: true,
          ca: process.env.DATABASE_CA_CERT,
        },
      },
    }),
  }),
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/", routes);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
