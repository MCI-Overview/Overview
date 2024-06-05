import axios from "axios";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { ReactSpreadsheetImport } from "react-spreadsheet-import";
import { Result, RowHook } from "react-spreadsheet-import/types/types";
import { useUserContext } from "../../../providers/userContextProvider";
import { useProjectContext } from "../../../providers/projectContextProvider";
import { getExactAge } from "../../../utils/date-time";
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
  if (!project || !user) return null;

  const projectCuid = project.cuid;

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

  useEffect(() => {
    setValidCddList(data.validData as unknown as CddTableDataType[]);
    setInvalidCddList(data.invalidData as unknown as CddTableDataType[]);
  }, [data]);

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
      example: "1965-08-09",
    },
    {
      label: "Start Date",
      key: "startDate",
      alternateMatches: generateCapitalizations(["start date", "start"]),
      fieldType: { type: "input" },
      example: "2024-05-13",
    },
    {
      label: "End Date",
      key: "endDate",
      alternateMatches: generateCapitalizations(["end date", "end"]),
      fieldType: { type: "input" },
      example: "2024-08-02",
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
        message: "Invalid format. Please use YYYY-MM-DD",
        level: "error",
      });
    } else if (getExactAge(new Date(row.dateOfBirth as string)) < 16) {
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
        message: "Invalid format. Please use YYYY-MM-DD",
        level: "error",
      });
    } else if (
      new Date(row.endDate as string) < new Date(row.startDate as string)
    ) {
      addError("startDate", {
        message: "Start date cannot be after end date",
        level: "error",
      });
    } else if (
      new Date(row.startDate as string) < new Date(project.startDate) ||
      new Date(row.startDate as string) > new Date(project.endDate)
    ) {
      addError("startDate", {
        message:
          "Start date must be within project period (" +
          project.startDate.slice(0, 10) +
          " to " +
          project.endDate.slice(0, 10) +
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
        message: "Invalid format. Please use YYYY-MM-DD",
        level: "error",
      });
    } else if (
      new Date(row.endDate as string) < new Date(row.startDate as string)
    ) {
      addError("endDate", {
        message: "End date cannot be before start date",
        level: "error",
      });
    } else if (
      new Date(row.endDate as string) < new Date(project.startDate) ||
      new Date(row.endDate as string) > new Date(project.endDate)
    ) {
      addError("endDate", {
        message:
          "End date must be within project period (" +
          project.startDate.slice(0, 10) +
          " to " +
          project.endDate.slice(0, 10) +
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
        `http://localhost:3000/api/admin/project/${projectCuid}/candidates`,
        validCddList
      );

      toast.success("Candidates added successfully");

      updateProject();
      setIsSubmitModalOpen(false);

      // response is a cuid list of candidates already in the project
      if (response.data.length !== 0) {
        let overlappingCdds = project.candidates
          .filter((cdd) => response.data.includes(cdd.cuid))
          .map((cdd) => ({
            ...cdd,
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
        />
      </Modal>

      <Modal open={isSubmitModalOpen} onClose={handleSubmitModalClose}>
        <ModalOverflow>
          <ModalClose />
          <ModalDialog style={{ maxWidth: "65%" }}>
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
                <Button onClick={handleSubmitData} disabled={isSubmitDisabled}>
                  Submit
                </Button>
              </>
            ) : (
              <Typography level="title-sm" sx={{ textAlign: "center" }}>
                Please provide valid data.
              </Typography>
            )}
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

export default AssignCandidateModal;
