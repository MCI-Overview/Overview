import dayjs from "dayjs";

import {
  LATE_COLOR,
  LEAVE_COLOR,
  MEDICAL_COLOR,
  NO_SHOW_COLOR,
  ON_TIME_COLOR,
  UPCOMING_COLOR,
} from "../../../utils/colors";
import { RosterDisplayProps } from "./RosterDisplay";
import SummaryDisplayItem from "./SummaryDisplayItem";
import { useRosterContext } from "../../../providers/rosterContextProvider";
import { useProjectContext } from "../../../providers/projectContextProvider";

export default function AttendanceSummary() {
  const { project } = useProjectContext();
  const { rosterData, dateRangeStart, dateRangeEnd } = useRosterContext();

  if (!rosterData || !project) return null;

  const consolidatedRoster = Object.values(rosterData).reduce(
    (acc, candidate) => {
      candidate.roster.forEach((roster) => {
        if (roster.projectCuid !== project.cuid) return;

        const date = roster.startTime.format("DD-MM-YYYY");
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(roster);
      });
      return acc;
    },
    {} as Record<string, RosterDisplayProps["data"][]>
  );

  const statusData = Array.from({
    length: dateRangeEnd.diff(dateRangeStart, "days") + 1,
  }).map((_, index) => {
    const date = dateRangeStart.add(index, "days");
    const rosters = consolidatedRoster[date.format("DD-MM-YYYY")] || [];
    return rosters.reduce(
      (acc, roster) => {
        if (!roster.status && !roster.leave) {
          acc["UPCOMING"]++;
          return acc;
        }

        if (roster.status === "MEDICAL") {
          acc["MEDICAL"]++;
          return acc;
        }

        if (roster.leave === "FULLDAY") {
          acc["LEAVE"]++;
          return acc;
        }

        if (roster.leave === "HALFDAY") {
          acc["LEAVE"] += 0.5;
          return acc;
        }

        if (roster.status) {
          acc[roster.status]++;
          return acc;
        }

        return acc;
      },
      {
        ON_TIME: 0,
        NO_SHOW: 0,
        MEDICAL: 0,
        LEAVE: 0,
        LATE: 0,
        UPCOMING: 0,
      } as Record<string, number>
    );
  });

  return (
    <tr>
      <th>Attendance Summary</th>
      {Array.from({
        length: dateRangeEnd.diff(dateRangeStart, "days") + 1,
      }).map((_, index) => {
        const date = dateRangeStart.add(index, "days");
        const status = statusData[index];

        return (
          <th key={date.format("DD-MM-YYYY")}>
            {status && (
              <div>
                <div>
                  {!!status.ON_TIME && (
                    <SummaryDisplayItem
                      color={ON_TIME_COLOR}
                      text="On time"
                      count={status.ON_TIME}
                    />
                  )}
                  {!!status.LATE && (
                    <SummaryDisplayItem
                      color={LATE_COLOR}
                      text="Late"
                      count={status.LATE}
                    />
                  )}
                  {!!status.NO_SHOW && (
                    <SummaryDisplayItem
                      color={NO_SHOW_COLOR}
                      text="Absent"
                      count={status.NO_SHOW}
                    />
                  )}
                  {!!status.MEDICAL && (
                    <SummaryDisplayItem
                      color={MEDICAL_COLOR}
                      text="Medical"
                      count={status.MEDICAL}
                    />
                  )}
                  {!!status.LEAVE && (
                    <SummaryDisplayItem
                      color={LEAVE_COLOR}
                      text="Leave"
                      count={status.LEAVE}
                    />
                  )}
                  {!!status.UPCOMING && (
                    <SummaryDisplayItem
                      color={UPCOMING_COLOR}
                      text="Upcoming"
                      count={status.UPCOMING}
                    />
                  )}
                  {status.ON_TIME +
                    status.LATE +
                    status.NO_SHOW +
                    status.MEDICAL +
                    status.LEAVE +
                    status.UPCOMING ===
                    0 && "-"}
                </div>
              </div>
            )}
          </th>
        );
      })}
    </tr>
  );
}
