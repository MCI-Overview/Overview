export type Profile = {
  provider: string;
  id: string;
  displayName: string;
  userPrincipalName: string;
};

export type User = {
  id: string;
  isUser?: boolean;
  isAdmin?: boolean;
};
