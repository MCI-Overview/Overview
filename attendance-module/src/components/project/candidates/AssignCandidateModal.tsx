import axios from "axios";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { ReactSpreadsheetImport } from "react-spreadsheet-import";
import { Result, RowHook } from "react-spreadsheet-import/types/types";
import { useUserContext } from "../../../providers/userContextProvider";
import { useProjectContext } from "../../../providers/projectContextProvider";
import { dateRegex, nricRegex, contactRegex } from "../../../utils/validation";
import { generateCapitalizations } from "../../../utils/capitalize";
import CandidateTable, {
  CandidateTableProps,
  CddTableDataType,
} from "./CandidateTable";

import {
  Box,
  Button,
  Checkbox,
  Divider,
  Modal,
  ModalClose,
  ModalDialog,
  ModalOverflow,
  Stack,
  Typography,
} from "@mui/joy";
import dayjs from "dayjs";

interface AssignCandidateModalProps {
  isUploadOpen: boolean;
  setIsUploadOpen: (isOpen: boolean) => void;
}

const AssignCandidateModal = ({
  isUploadOpen,
  setIsUploadOpen,
}: AssignCandidateModalProps) => {
  const { user } = useUserContext();
  const { project, updateProject } = useProjectContext();

  const [validCddList, setValidCddList] = useState<CddTableDataType[]>([]);
  const [invalidCddList, setInvalidCddList] = useState<CddTableDataType[]>([]);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState<boolean>(true);
  const [overlapCddList, setOverlapCddList] = useState<CddTableDataType[]>([]);
  const [isOverlapModalOpen, setIsOverlapModalOpen] = useState<boolean>(false);
  const [data, setData] = useState<Result<string>>({
    validData: [],
    all: [],
    invalidData: [],
  });

  useEffect(() => {
    setValidCddList(
      reformatDates(data.validData as unknown as CddTableDataType[])
    );
    setInvalidCddList(
      reformatDates(data.invalidData as unknown as CddTableDataType[])
    );
  }, [data]);

  if (!project || !user) return null;

  const projectCuid = project.cuid;

  const handleSubmitModalClose = () => {
    if (isSubmitModalOpen) {
      const confirmClose = window.confirm(
        "Are you sure you want to close the modal? Uploaded information will be lost."
      );
      if (confirmClose) {
        setIsSubmitModalOpen(false);
      }
    }
  };

  const fields = [
    {
      label: "NRIC",
      key: "nric",
      alternateMatches: generateCapitalizations(["nric", "fin"]),
      fieldType: { type: "input" },
      example: "S1234567A",
      validations: [
        {
          rule: "unique",
          errorMessage: "NRIC should be unique.",
          level: "error",
        },
      ],
    },
    {
      label: "Full name",
      key: "name",
      alternateMatches: generateCapitalizations([
        "full name",
        "name",
        "candidate name",
      ]),
      fieldType: { type: "input" },
      example: "John Doe Xiao Ming",
    },
    {
      label: "Contact",
      key: "contact",
      alternateMatches: generateCapitalizations([
        "phone number",
        "phone",
        "contact",
      ]),
      fieldType: { type: "input" },
      example: "98765432",
    },
    {
      label: "Date of birth",
      key: "dateOfBirth",
      alternateMatches: generateCapitalizations([
        "date of birth",
        "dob",
        "birth date",
        "birthday",
      ]),
      fieldType: { type: "input" },
      example: "09/08/1965",
    },
    {
      label: "Start Date",
      key: "startDate",
      alternateMatches: generateCapitalizations(["start date", "start"]),
      fieldType: { type: "input" },
      example: "13/05/2024",
    },
    {
      label: "End Date",
      key: "endDate",
      alternateMatches: generateCapitalizations(["end date", "end"]),
      fieldType: { type: "input" },
      example: "02/08/2024",
    },
    {
      label: "Job Type",
      key: "employmentType",
      alternateMatches: generateCapitalizations([
        "type",
        "employment type",
        "job type",
        "employmentType",
      ]),
      fieldType: {
        type: "select",
        options: [
          { label: "Full-time", value: "FULL_TIME" },
          { label: "Part-time", value: "PART_TIME" },
          { label: "Contract", value: "CONTRACT" },
        ],
      },
      example: "Full-time",
    },
  ];

  const rowHook: RowHook<string> = (row, addError) => {
    // nric validation
    if (!row.nric) {
      addError("nric", {
        message: "NRIC is required",
        level: "error",
      });
    } else if (!nricRegex.test(row.nric as string)) {
      addError("nric", {
        message: "Invalid NRIC/FIN",
        level: "error",
      });
    }

    // phone number validation
    if (!row.contact) {
      addError("contact", {
        message: "Contact number is required",
        level: "error",
      });
    } else if (!contactRegex.test(row.contact as string)) {
      addError("contact", {
        message: "Invalid contact number",
        level: "error",
      });
    }

    // name validation
    if (!row.name) {
      addError("name", {
        message: "Name is required",
        level: "error",
      });
    }

    // date of birth validation
    if (!row.dateOfBirth) {
      addError("dateOfBirth", {
        message: "Date of birth is required",
        level: "error",
      });
    } else if (!dateRegex.test(row.dateOfBirth as string)) {
      addError("dateOfBirth", {
        message: "Invalid format. Please use DD/MM/YYYY",
        level: "error",
      });
    } else if (dayjs().diff(parseDate(row.dateOfBirth), "years") < 16) {
      addError("dateOfBirth", {
        message: "Candidate below 16 years old",
        level: "error",
      });
    }

    // start date validation
    if (!row.startDate) {
      addError("startDate", {
        message: "Start date is required",
        level: "error",
      });
    } else if (!dateRegex.test(row.startDate as string)) {
      addError("startDate", {
        message: "Invalid format. Please use DD/MM/YYYY",
        level: "error",
      });
    } else if (
      row.endDate &&
      parseDate(row.endDate).isBefore(parseDate(row.startDate))
    ) {
      addError("startDate", {
        message: "Start date cannot be after end date",
        level: "error",
      });
    } else if (
      parseDate(row.startDate).isBefore(project.startDate) ||
      parseDate(row.startDate).isAfter(project.endDate)
    ) {
      addError("startDate", {
        message:
          "Start date must be within project period (" +
          project.startDate.format("DD/MM/YYYY") +
          " to " +
          project.endDate.format("DD/MM/YYYY") +
          ")",
        level: "error",
      });
    }

    // end date validation
    if (!row.endDate) {
      addError("endDate", {
        message: "End date is required",
        level: "error",
      });
    } else if (!dateRegex.test(row.endDate as string)) {
      addError("endDate", {
        message: "Invalid format. Please use DD/MM/YYYY",
        level: "error",
      });
    } else if (
      row.startDate &&
      parseDate(row.endDate).isBefore(parseDate(row.startDate))
    ) {
      addError("endDate", {
        message: "End date cannot be before start date",
        level: "error",
      });
    } else if (
      parseDate(row.endDate).isBefore(project.startDate) ||
      parseDate(row.endDate).isAfter(project.endDate)
    ) {
      addError("endDate", {
        message:
          "End date must be within project period (" +
          project.startDate.format("DD/MM/YYYY") +
          " to " +
          project.endDate.format("DD/MM/YYYY") +
          ")",
        level: "error",
      });
    }

    // employment type validation
    if (!row.employmentType) {
      addError("employmentType", {
        message: "Employment type is required",
        level: "error",
      });
    } else if (
      !["FULL_TIME", "PART_TIME", "CONTRACT"].includes(
        row.employmentType as string
      )
    ) {
      addError("employmentType", {
        message: "Invalid employment type",
        level: "error",
      });
    }

    return {
      nric: row.nric ? (row.nric as string).trim() : row.nric,
      name: row.name ? (row.name as string).trim() : row.name,
      contact: row.contact ? (row.contact as string).trim() : row.contact,
      dateOfBirth: row.dateOfBirth
        ? (row.dateOfBirth as string).trim()
        : row.dateOfBirth,
      startDate: row.startDate
        ? (row.startDate as string).trim()
        : row.startDate,
      endDate: row.endDate ? (row.endDate as string).trim() : row.endDate,
      employmentType: row.type
        ? (row.type as string).trim()
        : row.employmentType,
    };
  };

  const candidateTableProps: CandidateTableProps[] = [
    {
      tableTitle: "Valid Candidates",
      tableDescription:
        "These candidates will be added to the project upon submission.",
      tableProps: { stripe: "odd", size: "sm" },
      tableData: validCddList,
    },
    {
      tableTitle: "Invalid Info",
      tableDescription:
        "These candidates have missing/invalid info and will be excluded from submission.",
      tableProps: { variant: "soft", color: "danger", size: "sm" },
      tableData: invalidCddList,
    },
  ];

  const handleSubmitData = async () => {
    try {
      const response = await axios.post(
        `/api/admin/project/${projectCuid}/candidates`,
        validCddList
      );

      toast.success("Candidates added successfully");

      updateProject();
      setIsSubmitModalOpen(false);

      // response is a cuid list of candidates already in the project
      if (response.data.length !== 0) {
        const overlappingCdds = project.candidates
          .filter((cdd) => response.data.includes(cdd.cuid))
          .map((cdd) => ({
            ...cdd,
            startDate: dayjs(cdd.startDate).toISOString(),
            endDate: dayjs(cdd.endDate).toISOString(),
            dateOfBirth: dayjs(cdd.dateOfBirth).toISOString(),
            consultantName: user.name,
          }));

        setOverlapCddList(overlappingCdds);
        setIsOverlapModalOpen(true);
      }
    } catch (error) {
      toast.error("Error while adding candidates");
      console.error(error);
    }
  };

  return (
    <>
      <Modal open={isUploadOpen} onClose={() => setIsUploadOpen(false)}>
        <ModalDialog>
          <ReactSpreadsheetImport
            isOpen={isUploadOpen}
            onClose={() => {
              setIsUploadOpen(false);
            }}
            onSubmit={(result) => {
              setData(result);
              setIsSubmitDisabled(true);
              setIsSubmitModalOpen(true);
            }}
            fields={fields}
            rowHook={rowHook}
            customTheme={{}}
            z-index={0}
            dateFormat="dd/mm/yyyy"
          />
        </ModalDialog>
      </Modal>

      <Modal open={isSubmitModalOpen} onClose={handleSubmitModalClose}>
        <ModalOverflow>
          <ModalClose />
          <ModalDialog style={{ maxWidth: "65%" }}>
            <>
              {candidateTableProps
                .filter((props) => props.tableData.length > 0)
                .map((props, index) => (
                  <Box key={props.tableTitle}>
                    <CandidateTable {...props} />
                    {index !== candidateTableProps.length - 1 && (
                      <Divider sx={{ marginTop: "15px" }} />
                    )}
                  </Box>
                ))}

              {validCddList.length !== 0 ? (
                <>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Checkbox
                      onChange={() => setIsSubmitDisabled(!isSubmitDisabled)}
                      label="I have reviewed all candidate information."
                      sx={{ fontSize: "sm" }}
                    />
                  </Stack>
                  <Button
                    onClick={handleSubmitData}
                    disabled={isSubmitDisabled}
                  >
                    Submit
                  </Button>
                </>
              ) : (
                <Typography level="title-sm" sx={{ textAlign: "center" }}>
                  Please provide valid data.
                </Typography>
              )}
            </>
          </ModalDialog>
        </ModalOverflow>
      </Modal>

      <Modal
        open={isOverlapModalOpen}
        onClose={() => {
          setIsOverlapModalOpen(false);
          updateProject();
        }}
      >
        <ModalOverflow>
          <ModalClose />
          <ModalDialog style={{ maxWidth: "65%" }}>
            <CandidateTable
              tableTitle="Already In Project"
              tableDescription="These candidates have already been added to the project previously. This is just for your information, no action is required."
              tableProps={{ variant: "soft", color: "warning", size: "sm" }}
              tableData={overlapCddList}
            />
            <Box>
              <Button
                onClick={() => {
                  setIsOverlapModalOpen(false);
                  updateProject();
                }}
                fullWidth
              >
                Close
              </Button>
            </Box>
          </ModalDialog>
        </ModalOverflow>
      </Modal>
    </>
  );
};

function parseDate(date: string | boolean) {
  return dayjs(date as string, ["DD/MM/YYYY"]);
}

function IsoOrInvalid(date: dayjs.Dayjs) {
  return date.isValid() ? date.toISOString() : "Invalid";
}

function reformatDates(data: CddTableDataType[]) {
  return data.map((cdd) => ({
    ...cdd,
    startDate: IsoOrInvalid(parseDate(cdd.startDate)),
    endDate: IsoOrInvalid(parseDate(cdd.endDate)),
    dateOfBirth: IsoOrInvalid(parseDate(cdd.dateOfBirth)),
  }));
}

export default AssignCandidateModal;
