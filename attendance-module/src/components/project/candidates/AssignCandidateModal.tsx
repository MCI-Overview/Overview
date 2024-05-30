import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ReactSpreadsheetImport } from "react-spreadsheet-import";
import { Data, Result } from "react-spreadsheet-import/types/types";
import { getExactAge } from "../../../utils/date-time";

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
} from "@mui/joy";
import CandidateTable from "./CandidateTable";
import toast from "react-hot-toast";
import { dateRegex, nricRegex, phoneRegex } from "../../../utils/validation";

interface AssignCandidateModalProps {
  isUploadOpen: boolean;
  setIsUploadOpen: (isOpen: boolean) => void;
  existingCddIdList: string[];
}

const AssignCandidateModal = ({
  isUploadOpen,
  setIsUploadOpen,
  existingCddIdList,
}: AssignCandidateModalProps) => {
  const { projectId } = useParams();

  const [newCddList, setNewCddList] = useState<Data<string>[]>([]);
  const [invalidCddList, setInvalidCddList] = useState<Data<string>[]>([]);
  const [overlapCddList, setOverlapCddList] = useState<Data<string>[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const [data, setData] = useState<Result<string>>({
    validData: [],
    all: [],
    invalidData: [],
  });

  const handleModalClose = () => {
    if (isModalOpen) {
      const confirmClose = window.confirm(
        "Are you sure you want to close the modal? Uploaded information will be lost.",
      );
      if (confirmClose) {
        setIsModalOpen(false);
      }
    }
  };

  // when data is uploaded, update the three candidate lists
  useEffect(() => {
    setOverlapCddList(
      // existing candidate list
      data.all.filter((c) => existingCddIdList.includes(c.nric as string)),
    );

    setNewCddList(
      // valid data not in existing candidate list
      data.validData.filter(
        (c) => !existingCddIdList.includes(c.nric as string),
      ),
    );

    setInvalidCddList(
      // invalid data not in existing candidate list
      data.invalidData.filter(
        (c) => !existingCddIdList.includes(c.nric as string),
      ),
    );
  }, [data]);

  const fields = [
    {
      label: "NRIC",
      key: "nric",
      alternateMatches: ["nric", "id"],
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
      alternateMatches: ["full name", "name", "candidate name"],
      fieldType: { type: "input" },
      example: "John Doe Xiao Ming",
    },
    {
      label: "Phone Number",
      key: "phoneNumber",
      alternateMatches: ["phone number", "phone", "contact"],
      fieldType: { type: "input" },
      example: "98765432",
    },
    {
      label: "Date of birth",
      key: "dateOfBirth",
      alternateMatches: ["date of birth", "dob", "birth date"],
      fieldType: { type: "input" },
      example: "1965-08-09",
    },
  ];

  const rowHook = (row: Data<string>, addError: any) => {
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
    if (!row.phoneNumber) {
      addError("phoneNumber", {
        message: "Phone number is required",
        level: "error",
      });
    } else if (!phoneRegex.test(row.phoneNumber as string)) {
      addError("phoneNumber", {
        message: "Invalid phone number",
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
    } else if (getExactAge(row.dateOfBirth as string) < 16) {
      addError("dateOfBirth", {
        message: "Candidate below 16 years old",
        level: "error",
      });
    }

    return {
      nric: row.nric ? (row.nric as string).trim() : row.nric,
      name: row.name ? (row.name as string).trim() : row.name,
      phoneNumber: row.phoneNumber
        ? (row.phoneNumber as string).trim()
        : row.phoneNumber,
      dateOfBirth: row.dateOfBirth
        ? (row.dateOfBirth as string).trim()
        : row.dateOfBirth,
    };
  };

  const candidateTableProps = [
    {
      tableTitle: "New Candidates",
      tableDescription:
        "These candidates will be added to the project upon submission.",
      tableProps: { stripe: "odd", size: "sm" },
      tableData: newCddList,
    },
    {
      tableTitle: "Already In Project",
      tableDescription:
        "These candidates have been previously added to the project and will be excluded from submission.",
      tableProps: { variant: "soft", color: "warning", size: "sm" },
      tableData: overlapCddList,
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
      await axios.post(
        `http://localhost:3000/api/admin/project/${projectId}/candidates`,
        newCddList,
      );

      toast.success("Candidates added successfully");
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      toast.error("Error while adding candidates");
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
            setIsModalOpen(true);
          }}
          fields={fields}
          rowHook={rowHook}
          customTheme={{}}
          z-index={0}
        />
      </Modal>

      <Modal open={isModalOpen} onClose={handleModalClose}>
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
          </ModalDialog>
        </ModalOverflow>
      </Modal>
    </>
  );
};

export default AssignCandidateModal;
