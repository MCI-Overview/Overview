import { Strategy as MicrosoftStrategy } from "passport-microsoft";
import { Profile } from "@/types";
import passport from "passport";

const clientID = process.env.MICROSOFT_CLIENT_ID as string;
const clientSecret = process.env.MICROSOFT_CLIENT_SECRET as string;
const tenantID = process.env.MICROSOFT_TENANT_ID as string;

if (!clientID) {
  throw new Error(
    "MICROSOFT_CLIENT_ID must be defined in your environment variables",
  );
}

if (!clientSecret) {
  throw new Error(
    "MICROSOFT_CLIENT_SECRET must be defined in your environment variables",
  );
}

if (!tenantID) {
  throw new Error(
    "MICROSOFT_TENANT_ID must be defined in your environment variables",
  );
}

passport.use(
  "microsoft",
  new MicrosoftStrategy(
    {
      clientID,
      clientSecret,
      callbackURL: "http://localhost:3000/admin/auth/callback",
      scope: ["user.read"],
      tenant: tenantID,

      authorizationURL: `https://login.microsoftonline.com/${tenantID}/oauth2/v2.0/authorize`,
      tokenURL: `https://login.microsoftonline.com/${tenantID}/oauth2/v2.0/token`,
    },
    function (
      _accessToken: string,
      _refreshToken: string,
      profile: Profile,
      cb: (error: any, user?: any) => void,
    ) {
      cb(null, {
        id: profile.userPrincipalName,
        name: profile.displayName,
        isAdmin: true,
      });
    },
  ),
);
