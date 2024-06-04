import { Card, Table } from "@mui/joy";
import moment from "moment";
import CreateShiftModal from "./CreateShiftModal";
import { capitalizeWords } from "../../../utils/capitalize";
import { useProjectContext } from "../../../providers/projectContextProvider";
import { Shift } from "../../../types/common";

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
    </Card>
  );
}
