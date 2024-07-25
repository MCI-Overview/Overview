import { Assign, Candidate } from "@prisma/client";
import { JsonObject } from "@prisma/client/runtime/library";
import {
  CommonLocation,
  CommonAddress,
  BankDetails,
  EmergencyContact,
  GetCandidateResponse,
} from "@/types/common";
import { PermissionList, checkPermission } from "./permissions";
import { Dayjs } from "dayjs";

export function maskNRIC(nric: string): string {
  return "*****" + nric.slice(5, 9);
}

export function defaultDate(dateTime: Dayjs): Dayjs {
  return dateTime.set("date", 1).set("month", 0).set("year", 2000);
}

type ParameterValidity =
  | {
      isValid: false;
      message: string;
    }
  | {
      isValid: true;
      message?: string;
    };

export function checkLocationsValidity(locations: any): ParameterValidity {
  if (!locations)
    return {
      isValid: true,
    };

  if (!Array.isArray(locations))
    return {
      isValid: false,
      message: "Locations must be an array",
    };

  try {
    locations.map((location: CommonLocation) => {
      return {
        name: location.name,
        longitude: location.longitude,
        latitude: location.latitude,
      };
    });

    return {
      isValid: true,
    };
  } catch (error) {
    return {
      isValid: false,
      message: "Invalid location object",
    };
  }
}

export function checkEmploymentByValidity(
  employmentBy: string
): ParameterValidity {
  const VALID_EMPLOYMENT_BY = [
    "MCI Career Services Pte Ltd",
    "MCI Outsourcing Pte Ltd",
  ];

  if (!employmentBy) {
    return {
      isValid: true,
    };
  }

  if (VALID_EMPLOYMENT_BY.includes(employmentBy)) {
    return {
      isValid: true,
    };
  }

  return {
    isValid: false,
    message: "Invalid employment by parameter",
  };
}

export function checkDatesValidity(
  startDateString: string,
  endDateString: string
) {
  let startDate: Date | null = null;
  let endDate: Date | null = null;

  if (startDateString) {
    try {
      startDate = new Date(Date.parse(startDateString));
    } catch {
      return {
        isValid: false,
        message: "Invalid start date parameter",
      };
    }
  }

  if (endDateString) {
    try {
      endDate = new Date(Date.parse(endDateString));
    } catch {
      return {
        isValid: false,
        message: "Invalid end date parameter",
      };
    }
  }

  if (startDate && endDate && startDate > endDate) {
    return {
      isValid: false,
      message: "Start date cannot be later than end date",
    };
  }

  return {
    isValid: true,
  };
}

export function checkNoticePeriodValidity(
  noticePeriodDurationString: string,
  noticePeriodUnit: string,
  projectStartDateString: string,
  projectEndDateString: string
) {
  let noticePeriodDuration;
  try {
    noticePeriodDuration = parseInt(noticePeriodDurationString);
  } catch {
    return {
      isValid: false,
      message: "Invalid notice period input",
    };
  }

  if (noticePeriodDuration < 0) {
    return {
      isValid: false,
      message: "Notice period duration must not be negative",
    };
  }

  if (
    noticePeriodUnit !== "DAY" &&
    noticePeriodUnit !== "WEEK" &&
    noticePeriodUnit !== "MONTH"
  ) {
    return {
      isValid: false,
      message: "Invalid notice period unit",
    };
  }

  if (!projectStartDateString || !projectEndDateString) {
    return {
      isValid: false,
      message: "Project start date and end date must be provided",
    };
  }

  const projectDateValidity = checkDatesValidity(
    projectStartDateString,
    projectEndDateString
  );

  if (!projectDateValidity.isValid) {
    return projectDateValidity;
  }

  const startDate = new Date(Date.parse(projectStartDateString));
  const endDate = new Date(Date.parse(projectEndDateString));

  const startDatePlusNoticePeriod = new Date(startDate);
  switch (noticePeriodUnit) {
    case "DAY":
      startDatePlusNoticePeriod.setDate(
        startDate.getDate() + noticePeriodDuration
      );
      break;
    case "WEEK":
      startDatePlusNoticePeriod.setDate(
        startDate.getDate() + noticePeriodDuration * 7
      );
      break;
    case "MONTH":
      startDatePlusNoticePeriod.setMonth(
        startDate.getMonth() + noticePeriodDuration
      );
      break;
  }

  if (startDatePlusNoticePeriod > endDate) {
    return {
      isValid: false,
      message: "Notice period exceeds project duration",
    };
  }

  return {
    isValid: true,
  };
}

export function checkTimesValidity(
  startTime: string,
  endTime: string
): ParameterValidity {
  if (!startTime || !endTime) {
    return {
      isValid: false,
      message: "Start time and end time must be provided",
    };
  }

  const [startTimeHour, startTimeMinute] = startTime.split(":").map(Number);
  const [endTimeHour, endTimeMinute] = endTime.split(":").map(Number);

  if (
    isNaN(startTimeHour) ||
    isNaN(startTimeMinute) ||
    isNaN(endTimeHour) ||
    isNaN(endTimeMinute)
  ) {
    return {
      isValid: false,
      message: "Invalid time format",
    };
  }

  if (startTimeHour < 0 || startTimeHour > 23) {
    return {
      isValid: false,
      message: "Invalid start time hour",
    };
  }

  if (startTimeMinute < 0 || startTimeMinute > 59) {
    return {
      isValid: false,
      message: "Invalid start time minute",
    };
  }

  if (endTimeHour < 0 || endTimeHour > 23) {
    return {
      isValid: false,
      message: "Invalid end time hour",
    };
  }

  if (endTimeMinute < 0 || endTimeMinute > 59) {
    return {
      isValid: false,
      message: "Invalid end time minute",
    };
  }

  return {
    isValid: true,
  };
}

export async function processCandidateData(
  userCuid: string,
  assignData: (Assign & {
    Consultant: { cuid: string };
    Candidate: Candidate;
  })[],
  permissionData?: JsonObject
): Promise<GetCandidateResponse> {
  const hasReadCandidateDetailsPermission = await checkPermission(
    userCuid,
    PermissionList.CAN_READ_CANDIDATE_DETAILS,
    permissionData
  );

  if (!hasReadCandidateDetailsPermission) {
    return assignData.map((assign) => {
      const {
        cuid,
        nric,
        name,
        contact,
        residency,
        dateOfBirth,
        hasOnboarded,
      } = assign.Candidate;
      return {
        cuid,
        nric: maskNRIC(nric),
        name,
        contact,
        residency,
        dateOfBirth: dateOfBirth.toISOString(),
        consultantCuid: assign.Consultant.cuid,
        startDate: assign.startDate.toISOString(),
        endDate: assign.endDate.toISOString(),
        employmentType: assign.employmentType,
        hasOnboarded,
        restDay: assign.restDay,
      };
    });
  }

  return assignData.map((assign) => {
    return {
      ...assign.Candidate,
      dateOfBirth: assign.Candidate.dateOfBirth.toISOString(),
      startDate: assign.startDate.toISOString(),
      endDate: assign.endDate.toISOString(),
      residency: assign.Candidate.residency,
      employmentType: assign.employmentType,
      consultantCuid: assign.Consultant.cuid,
      address: assign.Candidate.address as CommonAddress,
      bankDetails: assign.Candidate.bankDetails as BankDetails,
      emergencyContact: assign.Candidate.emergencyContact as EmergencyContact,
      restDay: assign.restDay,
    };
  });
}
