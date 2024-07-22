import dayjs from "dayjs";
import dotenv from "dotenv";
import passport from "passport";
import utc from "dayjs/plugin/utc";
import session from "express-session";
import PgSession from "connect-pg-simple";
import express, { Express } from "express";
import timezone from "dayjs/plugin/timezone";
import customParseFormat from "dayjs/plugin/customParseFormat";

import routes from "./routes";

import "./cron/cron";

dotenv.config();

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

const port = process.env.PORT;

const app: Express = express();
const pgSession = PgSession(session);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    store: new pgSession({
      tableName: "Session",
      createTableIfMissing: true,
      conObject: {
        user: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
        host: process.env.DATABASE_HOST,
        port: parseInt(process.env.DATABASE_PORT as string),
        database: process.env.DATABASE_NAME,
        ssl: {
          rejectUnauthorized: true,
          ca: Buffer.from(process.env.DATABASE_CA as string, "base64").toString(
            "ascii"
          ),
        },
      },
    }),
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/", routes);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
