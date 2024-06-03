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
            <td>Shift Name</td>
            <td>Headcount</td>
            <td>Day</td>
            <td>Start Time</td>
            <td>End Time</td>
          </tr>
        </thead>
        <tbody>
          {project?.shifts?.map((group) =>
            group.shifts.sort((a: Shift, b: Shift) => {
              if (a.day === b.day) {
                return a.startTime < b.startTime ? -1 : 1;
              }
              return DAYS.indexOf(a.day) < DAYS.indexOf(b.day) ? -1 : 1;
            }).map((shift) => (
              <tr key={shift.cuid}>
                {group.shifts.indexOf(shift) === 0 && (
                  <>
                    <td rowSpan={group.shifts.length}>{group.name}</td>
                    <td rowSpan={group.shifts.length}>{group.headcount}</td>
                  </>
                )}
                <td>{capitalizeWords(shift.day)}</td>
                <td>{moment(shift.startTime).utc(true).format("HH:mm")}</td>
                <td>{moment(shift.endTime).utc(true).format("HH:mm")}</td>
              </tr>
            )),
          )}
        </tbody>
      </Table>
      <CreateShiftModal />
    </Card>
  );
}
