import { useState } from "react";
import { ReactSpreadsheetImport } from "react-spreadsheet-import";
import { Result } from "react-spreadsheet-import/types/types";

interface AssignCandidatePageProps {
  // projectId: string
}

const AssignCandidatePage = ({
  // projectId
}: AssignCandidatePageProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<Result<string>>({
    validData: [],
    all: [],
    invalidData: [],
  });

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

  const onSubmit = (data: Result<string>) => {
    // TODO: call api to assign candidate
    // Catch errors then set valid and invalid data accordingly
    setData(data);
  }

  return (
    <div>
      <h1>Assign Candidate Page</h1>

      <button onClick={() => setIsOpen(true)}>Import BUTTON</button>

      <ReactSpreadsheetImport
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={onSubmit}
        fields={fields}
      />

      <br />
      <div>
        Successfully imported:
        <table>
          <thead>
            <tr>
              {fields.map((field) => (
                <th key={field.key}>{field.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data &&
              data.validData.map((row: any, index: number) => (
                <tr key={index}>
                  <td>{row.nric}</td>
                  <td>{row.name}</td>
                  <td>{row.phoneNumber}</td>
                  <td>{row.dateOfBirth}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <br />
      <div>
        Failed to import
        <table>
          <thead>
            <tr>
              {fields.map((field) => (
                <th key={field.key}>{field.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data &&
              data.all
                .filter((row: any) => row.__errors !== undefined)
                .map((row: any, index: number) => (
                  <tr key={index}>
                    <td>{row.nric}</td>
                    <td>{row.name}</td>
                    <td>{row.phoneNumber}</td>
                    <td>{row.dateOfBirth}</td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssignCandidatePage;
