import { Dayjs } from "dayjs";
import { Client, CommonShift } from "./common";

export type CreateProjectData = {
  name: string | null;
  clientUEN: string | null;
  clientName: string | null;
  employmentBy: string | null;
  startDate: Date | null;
  endDate: Date | null;
  noticePeriodDuration: string | null;
  noticePeriodUnit: string | null;
};

export type CreateShiftData = {
  breakDuration: string | null;
  startTime: string | null;
  endTime: string | null;
  halfDayStartTime: string | null;
  halfDayEndTime: string | null;
  timezone: string;
};

export type Manage = {
  role: "CLIENT_HOLDER" | "CANDIDATE_HOLDER";
  consultantCuid: string;
  projectCuid: string;
  Consultant: {
    // TODO: fix type
    name: string;
    email: string;
    contact: string;
  };
};

export type Assign = {
  consultantCuid: string | null;
  candidateCuid: string;
};

export type BasicProject = {
  cuid: string;
  name: string;
  createdAt: string;
  startDate: string;
  endDate: string;
  clientName: string;
  clientUEN: string;
  consultants: {
    role: string;
    cuid: string;
  }[];
};

export type Project = {
  cuid: string;
  name: string;
  clientUEN: string;
  employmentBy: string;
  locations: JSON;
  createdAt: Date;
  endDate: Date;
  startDate: Date;
  noticePeriodDuration: number;
  noticePeriodUnit: "DAY" | "WEEK" | "MONTH";
  status: "ACTIVE" | "EXPIRED" | "DELETED";
  Assign: Assign[];
  Manage: Manage[];
  Client: Client;
  Shift: CommonShift[];
};

export type CustomRequest = {
  candidateCuid: string;
  createdAt: string;
  cuid: string;
  projectCuid: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  type:
    | "CLAIM"
    | "PAID_LEAVE"
    | "UNPAID_LEAVE"
    | "MEDICAL_LEAVE"
    | "RESIGNATION";
  data: object;
  Assign: {
    Candidate?: {
      nric: string;
      name: string;
    };
    Project?: {
      name: string;
    };
  };
  affectedRosters: {
    cuid: string;
    correctStartTime: string;
    correctEndTime: string;
  }[];
};

export type CustomAttendance = {
  cuid: string;
  candidateCuid: string;
  shiftId: string;
  shiftDate: Date;
  clockInTime: Date;
  clockOutTime: Date;
  leave: "FULLDAY" | "HALFDAY";
  status: "ON_TIME" | "LATE" | "NO_SHOW" | "MEDICAL" | null;
  shiftType: "FULL" | "FIRST_HALF" | "SECOND_HALF";
  Shift: {
    startTime: Date;
    endTime: Date;
    halfDayStartTime: Date;
    halfDayEndTime: Date;
    breakDuration: number;
    status: string;
    Project: {
      cuid: string;
      name: string;
      clientUEN: string;
      employmentBy: string;
      locations: [
        {
          address: string;
          latitude: string;
          longitude: string;
          postalCode: string;
        }
      ];
    };
  };
};

export type AttendanceRecords = {
  Attendance: CustomAttendance[];
  prispa: {
    isFirstPage: boolean;
    isLastPage: boolean;
    currentPage: number;
    previousPage: number | null;
    nextPage: number | null;
    pageCount: number;
    totalCount: number;
  };
};

export type CustomAdminAttendance = {
  attendanceCuid: string;
  date: Dayjs;
  nric: string;
  name: string;
  shiftStart: Dayjs;
  shiftEnd: Dayjs;
  rawStart: Dayjs | null;
  rawEnd: Dayjs | null;
  postalCode: string;
  leave: "FULLDAY" | "HALFDAY" | null;
  status: "ON_TIME" | "LATE" | "NO_SHOW" | "MEDICAL" | null;
};
