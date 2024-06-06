import { Card, Table } from "@mui/joy";
import CreateShiftModal from "./CreateShiftModal";

import { useProjectContext } from "../../../providers/projectContextProvider";
import CreateShiftGroupModal from "./CreateShiftGroupModel";

const DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

export default function RosterPage() {
  const { project } = useProjectContext();

  console.log(project?.shifts);

  return (
    <Card>
      <Table>
        <thead>
          <tr>
            <td>Day</td>
            <td>Headcount</td>
            <td>Start Time</td>
            <td>End Time</td>
            <td>Break Duration</td>
          </tr>
        </thead>
        <tbody>TODO:</tbody>
      </Table>
      <CreateShiftModal />
      <CreateShiftGroupModal />
    </Card>
  );
}
