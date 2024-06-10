import express, { Express } from "express";
import dotenv from "dotenv";
import routes from "./routes";
import passport from "passport";
import session from "express-session";
import PgSession from "connect-pg-simple";

dotenv.config();

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
    cookie: {
      sameSite: process.env.NODE_ENV === "production" ? 'none' : 'lax', // must be 'none' to enable cross-site delivery
      secure: process.env.NODE_ENV === "production", // must be true if sameSite='none'
    },
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
            "ascii",
          ),
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
