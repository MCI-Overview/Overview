import { PermissionList } from "@/utils/permissions";

export type CommonCandidate = {
  cuid: string;
  nric: string;
  name: string;
  contact: string;
  dateOfBirth: Date;
  consultantCuid: string;
  nationality?: string | null;
  address?: Address;
  bankDetails?: BankDetails;
  emergencyContact?: EmergencyContact;
};

export type Consultant = {
  cuid: string;
  email: string;
  name: string;
  role: "CLIENT_HOLDER" | "CANDIDATE_HOLDER";
};

export type Location = {
  postalCode: string;
  address: string;
  longitude: string;
  latitude: string;
};

export type Address = {
  block: string;
  building: string;
  floor: string;
  unit: string;
  street: string;
  postal: string;
  country: string;
};

export type BankDetails = {
  bankHolderName: string;
  bankName: string;
  bankNumber: string;
};

export type EmergencyContact = {
  name: string;
  relationship: string;
  contact: string;
};

export type Client = {
  name: string;
  uen: string;
};

export type User = ConsultantUser | CandidateUser;

export type ConsultantUser = {
  cuid: string;
  name: string;
  email: string;
  userType: "Admin";
  permissions: {
    [key in PermissionList]?: boolean;
  };
};

export type CandidateUser = {
  cuid: string;
  name: string;
  nric: string;
  userType: "User";
};

export type ShiftGroup = {
  cuid: string;
  name: string;
  headcount: number;
  shifts: Shift[];
};

export type Shift = {
  cuid: string;
  day: string;
  startTime: Date;
  endTime: Date;
};

export type GetProjectDataResponse = {
  cuid: string;
  name: string;
  employmentBy: string;
  locations: Location[];
  startDate: string;
  endDate: string;
  createdAt: string;
  noticePeriodDuration: number;
  noticePeriodUnit: string;
  status: string;
  client: {
    name: string;
    uen: string;
  };
  candidates: CommonCandidate[];
  consultants: Consultant[];
  shifts: ShiftGroup[];
};
