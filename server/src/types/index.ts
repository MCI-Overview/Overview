export type Profile = {
  provider: string;
  id: string;
  displayName: string;
  userPrincipalName: string;
  _json: {
    jobTitle: string;
    businessPhones: string[];
  };
};

export type User = ConsultantUser | CandidateUser;

export type ConsultantUser = {
  cuid: string;
  name: string;
  email: string;
  userType: "Admin";
};

export type CandidateUser = {
  cuid: string;
  name: string;
  nric: string;
  userType: "User";
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

export type Address = {
  block: String;
  building: String;
  floor: String;
  unit: String;
  street: String;
  postal: String;
  country: String;
};

export type Location = {
  postalCode: String;
  address: String;
  longitude: String;
  latitude: String;
};

export type BankDetails = {
  bankHolderName: String;
  bankName: String;
  bankNumber: String;
};

export type EmergencyContact = {
  name: String;
  relationship: String;
  contact: String;
};
