export type MicrosoftProfile = {
  provider: string;
  id: string;
  displayName: string;
  userPrincipalName: string;
  _json: {
    jobTitle: string;
    businessPhones: string[];
  };
};

export type PrismaError = {
  name: string;
  code: string;
  clientVersion: string;
  meta: {
    modelName: string;
    field_name?: string;
    target?: string[];
  };
};
