import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ReactSpreadsheetImport } from "react-spreadsheet-import";
import { Data, Result } from "react-spreadsheet-import/types/types";
import { getExactAge } from "../utils/utils";

import { Box, Button, Divider, Stack, Typography, Card } from "@mui/joy";
import Table from "@mui/joy/Table";

const AssignCandidatePage = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();

  const [existingCddIdList, setExistingCddIdList] = useState<string[]>([]);
  const [newCddList, setNewCddList] = useState<Data<string>[]>([]);
  const [invalidCddList, setInvalidCddList] = useState<Data<string>[]>([]);
  const [overlapCddList, setOverlapCddList] = useState<Data<string>[]>([]);

  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<Result<string>>({
    validData: [],
    all: [],
    invalidData: [],
  });

  // retrieve existing candidates id
  useEffect(() => {
    const fetchExistingCandidates = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/admin/project/${projectId}/candidates`,
          { withCredentials: true }
        );
        setExistingCddIdList(response.data.map((c: any) => c.nric));
      } catch (error) {
        // TODO: Encountered error toast and redirect to project page
        console.error("Error while fetching candidates", error);
      }
    };

    fetchExistingCandidates();
  }, [projectId]);

  // when data is uploaded, update the three candidate lists
  useEffect(() => {
    setOverlapCddList(
      // existing candidate list
      data.all.filter((c) => existingCddIdList.includes(c.nric as string))
    );

    setNewCddList(
      // valid data not in existing candidate list
      data.validData.filter(
        (c) => !existingCddIdList.includes(c.nric as string)
      )
    );

    setInvalidCddList(
      // invalid data not in existing candidate list
      data.invalidData.filter(
        (c) => !existingCddIdList.includes(c.nric as string)
      )
    );
  }, [data]);

  const fields = [
    {
      label: "NRIC/FIN",
      key: "nric",
      alternateMatches: ["nric", "fin", "id"],
      fieldType: { type: "input" },
      example: "S1234567A",
      validations: [
        {
          rule: "required",
          errorMessage: "NRIC/FIN is required",
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
      validations: [
        {
          rule: "required",
          errorMessage: "Name is required",
          level: "error",
        },
      ],
    },
    {
      label: "Phone Number",
      key: "phoneNumber",
      alternateMatches: ["email", "e-mail"],
      fieldType: { type: "input" },
      example: "98765432",
      validations: [
        {
          rule: "required",
          errorMessage: "Phone number is required",
          level: "error",
        },
      ],
    },
    {
      label: "Date of birth",
      key: "dateOfBirth",
      alternateMatches: ["date of birth", "dob", "birth date"],
      fieldType: { type: "input" },
      example: "09/08/1965",
      validations: [
        {
          rule: "required",
          errorMessage: "Date of birth is required",
          level: "error",
        },
      ],
    },
  ];

  const rowHook = (row: Data<string>, addError: any) => {
    // nric validation
    if (!row.nric) {
      addError("nric", {
        message: "NRIC/FIN is required",
        level: "error",
      });
    } else if (!/^[STFGM]\d{7}[A-Z]$/i.test(row.nric as string)) {
      addError("nric", {
        message: "Invalid NRIC/FIN",
        level: "error",
      });
    }

    // phone number validation
    const phoneRegex = /^(\+\d{1,3}\s?)?(\d{4}\s?)?\d{4}$/;
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

    // date of birth validation
    const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
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
      console.log(newCddList);
      await axios.post(
        `http://localhost:3000/api/admin/project/${projectId}/candidates`,
        newCddList,
        { withCredentials: true }
      );

      // TODO: toast success message
      // wait for 2 seconds before redirecting to correct link
      setTimeout(() => {
        navigate(`/admin/projects/${projectId}`);
      }, 2000);
    } catch (error) {
      // TODO: toast error message
      console.error("Error while adding candidates", error);
    }
  };

  return (
    <>
      <Stack
        spacing={4}
        sx={{
          display: "flex",
          maxWidth: "800px",
          mx: "auto",
          px: { xs: 2, md: 6 },
          py: { xs: 2, md: 3 },
        }}
      >
        <Card>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Box>
              <Typography level="title-md">Assign Candidates</Typography>
              <Typography level="body-sm">
                Assign new candidates to the project
              </Typography>
            </Box>
            <Button
              onClick={() => setIsOpen(true)}
              sx={{ ml: "10dvh", px: { xs: 2, md: 6 } }}
            >
              {data.all.length > 0 ? "Re-Upload" : "Upload"}
            </Button>
          </Box>

          <ReactSpreadsheetImport
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            onSubmit={(result) => setData(result)}
            fields={fields}
            rowHook={rowHook}
          />

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

          {newCddList.length > 0 && (
            <>
              <Divider />
              <Button onClick={handleSubmitData}>Submit</Button>
            </>
          )}
        </Card>
      </Stack>
    </>
  );
};

interface CandidateTableProps {
  tableTitle: string;
  tableDescription: string;
  tableProps: any;
  tableData: Data<string>[];
}

const CandidateTable = ({
  tableTitle,
  tableDescription,
  tableProps,
  tableData,
}: CandidateTableProps) => (
  <Box>
    <Typography level="title-sm">{tableTitle}</Typography>
    <Typography level="body-xs">{tableDescription}</Typography>
    <Table sx={{ "& tr > *": { textAlign: "center" } }} {...tableProps}>
      <thead>
        <tr>
          <th>NRIC/FIN</th>
          <th>Full name</th>
          <th>Phone Number</th>
          <th>Date of birth</th>
          <th>Age</th>
        </tr>
      </thead>
      <tbody>
        {tableData.map((row: any, index: number) => (
          <tr key={index}>
            <td>{row.nric}</td>
            <td>{row.name}</td>
            <td>{row.phoneNumber}</td>
            <td>{row.dateOfBirth}</td>
            <td>
              {row.dateOfBirth ? getExactAge(row.dateOfBirth as string) : "-"}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  </Box>
);

export default AssignCandidatePage;
