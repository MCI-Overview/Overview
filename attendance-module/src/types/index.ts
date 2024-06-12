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
  days: string[];
  headcount: string | null;
  breakDuration: string | null;
  startTime: string | null;
  endTime: string | null;
  halfDayStartTime: string | null;
  halfDayEndTime: string | null;
};

export type Manage = {
  role: "CLIENT_HOLDER" | "CANDIDATE_HOLDER";
  consultantEmail: string;
  projectCuid: string;
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
