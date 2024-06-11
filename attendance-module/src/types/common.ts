export type CommonCandidate = {
  cuid: string;
  nric: string;
  name: string;
  contact: string;
  dateOfBirth: Date;
  consultantCuid: string;
  startDate: Date;
  endDate: Date;
  employmentType: "PART_TIME" | "FULL_TIME" | "CONTRACT";
  nationality?: string | null;
  address?: Address;
  bankDetails?: BankDetails;
  emergencyContact?: EmergencyContact;
  hasOnboarded: boolean;
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
  floor?: string;
  unit?: string;
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

export enum PermissionList {
  CAN_READ_ALL_PROJECTS = "canReadAllProjects",
  CAN_EDIT_ALL_PROJECTS = "canEditAllProjects",
  CAN_HARD_DELETE_PROJECTS = "canHardDeleteProjects",

  CAN_DELETE_CLIENTS = "canDeleteClients",
  CAN_UPDATE_CLIENTS = "canUpdateClients",

  CAN_CREATE_CONSULTANTS = "canCreateConsultants",
  CAN_UPDATE_CONSULTANTS = "canUpdateConsultants",
  CAN_DELETE_CONSULTANTS = "canDeleteConsultants",

  CAN_DELETE_CANDIDATES = "canDeleteCandidates",
  CAN_UPDATE_CANDIDATES = "canUpdateCandidates",
  CAN_READ_CANDIDATE_DETAILS = "canRersadCandidateDetails",
}

export type ConsultantUser = {
  cuid: string;
  name: string;
  email: string;
  userType: "Admin";
  permissions: {
    [key in PermissionList]?: boolean;
  };
};

export type CandidateUser = CommonCandidate & {
  userType: "User";
};

export type Shift = {
  cuid: string;
  projectCuid: string;
  startTime: Date;
  endTime: Date;
  halfDayStartTime: Date | null;
  halfDayEndTime: Date | null;
  breakDuration: number;
  status: "ACTIVE" | "ARCHIVED";
};

export type ShiftGroup = {
  name: string;
  shifts: Shift[];
};

export type GetProjectDataResponse = {
  cuid: string;
  name: string;
  employmentBy: string;
  locations: Location[];
  shiftGroups: ShiftGroup[];
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
  shifts: Shift[];
};
