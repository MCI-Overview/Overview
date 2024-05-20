export type Profile = {
  provider: string;
  id: string;
  displayName: string;
  userPrincipalName: string;
};

export type User = {
  id: string;
  name: string;
  isUser?: boolean;
  isAdmin?: boolean;
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
