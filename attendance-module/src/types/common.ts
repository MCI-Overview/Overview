import { Dayjs } from "dayjs";

export type CommonCandidate = CandidateDetails & {
  address?: CommonAddress;
  bankDetails?: BankDetails;
  emergencyContact?: EmergencyContact;
  employmentType: "PART_TIME" | "FULL_TIME" | "CONTRACT";
  consultantCuid: string;
  startDate: string;
  endDate: string;
  restDay: "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";
  employeeId: string;
};

export type ProjectCandidate = CommonCandidate & {
  employmentType: "PART_TIME" | "FULL_TIME" | "CONTRACT";
  consultantCuid: string;
  startDate: string;
  endDate: string;
};

export type CandidateDetails = {
  cuid: string;
  nric: string;
  name: string;
  contact: string;
  createdAt: string;
  dateOfBirth: string;
  hasOnboarded: boolean;
  nationality?: string | null;
  residency: string;
};

export type CommonConsultant = {
  cuid: string;
  name: string;
  email: string;
  contact?: string;
  department?: true;
  designation?: true;
  registration?: true;
  role?: "CLIENT_HOLDER" | "CANDIDATE_HOLDER";
};

export type CommonLocation = {
  name: string;
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
  createdAt: string;
};

export type CommonShift = {
  cuid: string;
  startTime: Dayjs;
  endTime: Dayjs;
  halfDayStartTime: Dayjs | null;
  halfDayEndTime: Dayjs | null;
};

export type CommonAttendance = {
  cuid: string;
  candidateCuid: string;
  shiftId: string;
  shiftDate: Date;
  clockInTime: Date;
  clockOutTime: Date;
  leave: "FULLDAY" | "HALFDAY";
  status: "PRESENT" | "NO_SHOW" | "MEDICAL";
  shiftType: "FULL" | "FIRST_HALF" | "SECOND_HALF";
  Shift: CommonShift;
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
  employeeId: string;
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
  employeeId: string;
  cuid: string;
  nric: string;
  name: string;
  contact: string;
  dateOfBirth: string;
  residency: string;
  consultantCuid: string;
  createdAt: string;
  startDate: string;
  endDate: string;
  employmentType: "PART_TIME" | "FULL_TIME" | "CONTRACT";
  nationality?: string | null;
  address?: CommonAddress;
  bankDetails?: BankDetails;
  emergencyContact?: EmergencyContact;
  hasOnboarded: boolean;
  restDay: "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";
}[];

export type GetRosterResponse = {
  cuid: string;
  name: string;
  nric: string;
  restDay: string;
  startDate: string;
  endDate: string;
  rosters: {
    type: "FULL_DAY" | "FIRST_HALF" | "SECOND_HALF";
    breakDuration: number;
    leave: string;
    status: string;
    rosterCuid: string;
    shiftCuid: string;
    projectCuid: string;
    startTime: string;
    endTime: string;
    clockInTime: string | undefined;
    clockOutTime: string | undefined;
    clientHolderCuids: string[];
  }[];
}[];

export type Roster = {
  type: "FULL_DAY" | "FIRST_HALF" | "SECOND_HALF";
  candidateCuid: string;
  rosterCuid: string;
  projectCuid: string;
  shiftCuid: string;
  startTime: Dayjs;
  endTime: Dayjs;
  consultantCuid: string;
};

export type getAttendanceResponse = {
  cuid: string;
  candidateCuid: string;
  shiftCuid: string;
  shiftType: string;
  clockInTime: string;
  clockOutTime: string;
  status: string;
  leave: string;
  shiftDate: string;
  Shift: {
    cuid: string;
    projectCuid: string;
    startTime: string;
    endTime: string;
    halfDayStartTime: string | null;
    halfDayEndTime: string | null;
    breakDuration: number;
    status: string;
    Project: {
      name: string;
      locations: CommonLocation[];
      timeWindow: number;
      distanceRadius: number;
    };
  };
};

export type CopyAttendanceResponse = {
  attendanceCuid: string;
  date: string;
  startTime: string;
  endTime: string;
  error: string;
};
