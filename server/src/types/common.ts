import { Dayjs } from "dayjs";

export type CommonCandidate = {
  cuid: string;
  nric: string;
  name: string;
  contact: string;
  dateOfBirth: Dayjs;
  consultantCuid: string;
  startDate: Dayjs;
  endDate: Dayjs;
  employmentType: "PART_TIME" | "FULL_TIME" | "CONTRACT";
  nationality?: string | null;
  address?: CommonAddress;
  bankDetails?: BankDetails;
  emergencyContact?: EmergencyContact;
  hasOnboarded: boolean;
};

export type CommonConsultant = {
  cuid: string;
  email: string;
  name: string;
  role: "CLIENT_HOLDER" | "CANDIDATE_HOLDER";
};

export type CommonLocation = {
  postalCode: string;
  address: string;
  longitude: string;
  latitude: string;
};

export type CommonAddress = {
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

export type CommonShift = {
  cuid: string;
  startTime: Dayjs;
  endTime: Dayjs;
  halfDayStartTime: Dayjs | null;
  halfDayEndTime: Dayjs | null;
};

export type CommonProject = {
  cuid: string;
  name: string;
  employmentBy: string;
  locations: CommonLocation[];
  startDate: Dayjs;
  endDate: Dayjs;
  createdAt: Dayjs;
  noticePeriodDuration: number;
  noticePeriodUnit: string;
  timeWindow: number;
  distanceRadius: number;
  status: string;
  client: {
    name: string;
    uen: string;
  };
  candidates: CommonCandidate[];
  consultants: CommonConsultant[];
  shifts: CommonShift[];
  shiftDict: Record<string, CommonShift>;
};

export type GetProjectDataResponse = {
  cuid: string;
  name: string;
  employmentBy: string;
  locations: CommonLocation[];
  startDate: string;
  endDate: string;
  createdAt: string;
  noticePeriodDuration: number;
  noticePeriodUnit: string;
  timeWindow: number;
  distanceRadius: number;
  status: string;
  client: {
    name: string;
    uen: string;
  };
  candidates: GetCandidateResponse;
  consultants: CommonConsultant[];
  shifts: GetShiftResponse;
};

export type GetShiftResponse = {
  cuid: string;
  projectCuid: string;
  startTime: string;
  endTime: string;
  halfDayStartTime: string | null;
  halfDayEndTime: string | null;
  breakDuration: number;
  status: "ACTIVE" | "ARCHIVED";
}[];

export type GetCandidateResponse = {
  cuid: string;
  nric: string;
  name: string;
  contact: string;
  dateOfBirth: string;
  consultantCuid: string;
  startDate: string;
  endDate: string;
  employmentType: "PART_TIME" | "FULL_TIME" | "CONTRACT";
  nationality?: string | null;
  address?: CommonAddress;
  bankDetails?: BankDetails;
  emergencyContact?: EmergencyContact;
  hasOnboarded: boolean;
}[];

export type GetRosterResponse = {
  cuid: string;
  name: string;
  startDate: string;
  endDate: string;
  shifts: {
    shiftType: "FULL_DAY" | "FIRST_HALF" | "SECOND_HALF";
    rosterCuid: string;
    shiftCuid: string;
    shiftStartTime: string;
    shiftEndTime: string;
    consultantCuid: string;
  }[];
}[];

export type MappedRosterResponse = {
  cuid: string;
  name: string;
  startDate: Dayjs;
  endDate: Dayjs;
  roster: Roster[];
}[];

export type Roster = {
  type: "FULL_DAY" | "FIRST_HALF" | "SECOND_HALF";
  rosterCuid: string;
  shiftCuid: string;
  startTime: Dayjs;
  endTime: Dayjs;
  consultantCuid: string;
};

export type CopyAttendanceResponse = {
  attendanceCuid: string;
  date: string;
  startTime: string;
  endTime: string;
  error: string;
};
