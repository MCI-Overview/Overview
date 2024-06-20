import { CommonConsultant } from "../../../types/common";
import { readableEnum } from "../../../utils/capitalize";

import { Button, Option, Select, Table, Typography } from "@mui/joy";

interface CollaboratorsTableProps {
  consultants: CommonConsultant[];
  currentUser: CommonConsultant;
  handleRemoveConsultant: (consultant: CommonConsultant) => void;
  handleRoleChange: (
    newRole: "CLIENT_HOLDER" | "CANDIDATE_HOLDER" | null,
    consultant: CommonConsultant
  ) => Promise<void>;
}

const CollaboratorsTable = ({
  consultants,
  currentUser,
  handleRemoveConsultant,
  handleRoleChange,
}: CollaboratorsTableProps) => {
  return (
    <Table hoverRow>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          {currentUser.role === "CLIENT_HOLDER" && (
            <th style={{ minWidth: "100px", maxWidth: "150px" }}>Action</th>
          )}
        </tr>
      </thead>
      <tbody>
        {consultants.map((consultant) => (
          <tr key={consultant.cuid}>
            <td style={{ wordWrap: "break-word" }}>
              <Typography level="body-md">{consultant.name}</Typography>
            </td>
            <td style={{ wordWrap: "break-word" }}>
              <Typography level="body-md">{consultant.email}</Typography>
            </td>

            <td>
              {currentUser.role === "CLIENT_HOLDER" ? (
                <Select
                  value={consultant.role}
                  onChange={(_e, value) => handleRoleChange(value, consultant)}
                  disabled={consultant.cuid === currentUser.cuid}
                >
                  <Option value="CLIENT_HOLDER">Client Holder</Option>
                  <Option value="CANDIDATE_HOLDER">Candidate Holder</Option>
                </Select>
              ) : (
                <Typography level="body-md">
                  {readableEnum(consultant.role)}
                </Typography>
              )}
            </td>

            {currentUser.role === "CLIENT_HOLDER" && (
              <td>
                <Button
                  onClick={() => handleRemoveConsultant(consultant)}
                  disabled={consultant.cuid === currentUser.cuid}
                >
                  Remove
                </Button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default CollaboratorsTable;
