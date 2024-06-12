import { Table, Button } from "@mui/joy";
import { CommonConsultant } from "../../../types/common";

interface CollaboratorsTableProps {
  collaborators: CommonConsultant[];
  currentUserRole: string | undefined;
  handleRemoveClick: (cuid: string) => void;
}

const CollaboratorsTable = ({
  collaborators,
  currentUserRole,
  handleRemoveClick,
}: CollaboratorsTableProps) => {
  return (
    <Table hoverRow>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          {currentUserRole === "CLIENT_HOLDER" && (
            <th style={{ minWidth: "100px", maxWidth: "150px" }}>Action</th>
          )}
        </tr>
      </thead>
      <tbody>
        {collaborators.map((row) => (
          <tr key={row.cuid}>
            <td style={{ wordWrap: "break-word" }}>{row.name}</td>
            <td style={{ wordWrap: "break-word" }}>{row.email}</td>
            <td style={{ wordWrap: "break-word" }}>{row.role}</td>
            {currentUserRole === "CLIENT_HOLDER" && (
              <td>
                <Button onClick={() => handleRemoveClick(row.cuid)}>
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
