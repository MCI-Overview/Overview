import { Card, Table } from "@mui/joy";
import CreateShiftModal from "./CreateShiftModal";


export default function RosterPage() {

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
