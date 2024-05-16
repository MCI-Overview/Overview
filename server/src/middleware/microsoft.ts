import passport from "passport";
import { Strategy as MicrosoftStrategy } from "passport-microsoft";
import { config } from "dotenv";

config();

const clientID = process.env.MICROSOFT_CLIENT_ID as string;
const clientSecret = process.env.MICROSOFT_CLIENT_SECRET as string;
const tenantID = "ece545f5-646e-4176-a3f5-0e7c920be6e0";

if (!clientID || !clientSecret) {
  throw new Error("MICROSOFT_CLIENT_ID and MICROSOFT_CLIENT_SECRET must be defined in your environment variables");
}

passport.use("auth-microsoft", new MicrosoftStrategy({
    // Standard OAuth2 options
    clientID,
    clientSecret,
    callbackURL: "http://localhost:3000/auth/microsoft/callback",
    scope: ['user.read'],

    // Microsoft specific options

    // [Optional] The tenant for the application. Defaults to 'common'. 
    // Used to construct the authorizationURL and tokenURL
    tenant: tenantID,

    authorizationURL: `https://login.microsoftonline.com/${tenantID}/oauth2/v2.0/authorize`,
    tokenURL: `https://login.microsoftonline.com/${tenantID}/oauth2/v2.0/token`,
  },
  function(accessToken: string, refreshToken: string, profile: any, done: (error: any, user?: any) => void) {
    console.log(profile);
    done(null, profile);
  }
));
