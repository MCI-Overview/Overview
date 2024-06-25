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
};

export type Manage = {
  role: "CLIENT_HOLDER" | "CANDIDATE_HOLDER";
  consultantCuid: string;
  projectCuid: string;
  Consultant: {
    // TODO: fix type
    name: string;
  };
};

export type DraggableChipProps = {
  type: "FULL_DAY" | "FIRST_HALF" | "SECOND_HALF";
  cuid: string;
  startTime: Dayjs;
  endTime: Dayjs;
};

export type Assign = {
  consultantCuid: string | null;
  candidateCuid: string;
};

export type Project = {
  cuid: string;
  name: string;
  clientUEN: string;
  employmentBy: string;
  locations: JSON;
  shiftGroups: JSON;
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
};

export type CustomAttendance = {
  cuid: string;
  candidateCuid: string;
  shiftId: string;
  shiftDate: Date;
  clockInTime: Date;
  clockOutTime: Date;
  leave: "FULL_DAY" | "HALD_DAY";
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
  date: Date;
  nric: string;
  name: string;
  shiftStart: Date;
  shiftEnd: Date;
  rawStart: Date | null;
  rawEnd: Date | null;
  status: "ON_TIME" | "LATE" | "NO_SHOW" | "MEDICAL" | null;
};
