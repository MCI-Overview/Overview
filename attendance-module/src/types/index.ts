export type ProjectDetails = {
  name: string | null;
  clientUEN: string | null;
  clientName: string | null;
  employmentBy: MCICompany | null;
  startDate: Date | null;
  endDate: Date | null;
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

export type CandidateBasic = {
  cuid: string;
  nric: string;
  name: string;
  phoneNumber: string;
  dateOfBirth: string;
};

export type Client = {
  UEN: string;
  name: string;
};

export type Manage = {
  role: "CLIENT_HOLDER" | "CANDIDATE_HOLDER";
  consultantEmail: string;
  projectId: string;
};

export type Project = {
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
  id: string;
  projectId: string;
  name: string;
  shiftStatus: string;
  Shift: Shift[];
};

export enum MCICompany {
  MCI_CAREER_SERVICES = "MCI Career Services Pte Ltd",
  MCI_OUTSOURCING = "MCI Outsourcing Pte Ltd",
}
