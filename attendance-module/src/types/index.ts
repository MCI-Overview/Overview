export type CreateProjectData = {
  name: string | null;
  clientUEN: string | null;
  clientName: string | null;
  employmentBy: MCICompany | null;
  startDate: Date | null;
  endDate: Date | null;
};

export type CreateShiftData = {
  startTime: string;
  endTime: string;
  headcount: string | null;
  shiftGroupCuid: string | null;
  days: string[];
  shiftGroupName: string | null;
};

export type Location = {
  postalCode: string;
  address: string;
  latitude: string;
  longitude: string;
};

export type ClientCompany = {
  uen: string;
  name: string;
};

export type Consultant = {
  cuid: string;
  email: string;
  name: string;
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

export type Candidate = {
  cuid: string;
  nric: string;
  name: string;
  contact: string;
  dateOfBirth: string;
  nationality?: string;
  address?: Address;
  bankDetails?: BankDetails;
  emergencyContact?: EmergencyContact;
};

export type Address = {
  postalCode: string;
  block: string;
  street: string;
  unit: string;
  building: string;
  floor: string;
};

export type BankDetails = {
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
};

export type EmergencyContact = {
  name: string;
  relationship: string;
  contact: string;
};

export type Client = {
  UEN: string;
  name: string;
};

export type Manage = {
  role: "CLIENT_HOLDER" | "CANDIDATE_HOLDER";
  consultantEmail: string;
  projectCuid: string;
};

export type Project = {
  Assign: {
    Candidate: Candidate;
  }[];
  cuid: string;
  name: string;
  clientUEN: string;
  locations: Location[];
  createdAt: string;
  startDate: string;
  endDate: string;
  employmentBy: MCICompany;
  status: string;
  Client: Client;
  Manage: Manage[];
  ShiftGroup: ShiftGroup[];
};

export type Shift = {
  shiftId: string;
  groupId: string;
  day: string;
  headcount: number;
  startTime: string;
  endTime: string;
};

export type ShiftGroup = {
  cuid: string;
  projectCuid: string;
  name: string;
  shiftStatus: string;
  Shift: Shift[];
  headcount: number;
};

export enum MCICompany {
  MCI_CAREER_SERVICES = "MCI Career Services Pte Ltd",
  MCI_OUTSOURCING = "MCI Outsourcing Pte Ltd",
}
