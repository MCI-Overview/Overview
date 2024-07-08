import DroppableArea from "./DroppableArea";
import RosterSummary from "./RosterSummary";
import AttendanceSummary from "./AttendanceSummary";
import { RosterDisplayProps } from "./RosterDisplay";
import { useRosterContext } from "../../../providers/rosterContextProvider";
import { useProjectContext } from "../../../providers/projectContextProvider";

import { Sheet, Table, Typography } from "@mui/joy";

type RosterTableProps = {
  type: "ATTENDANCE" | "ROSTER";
};

export default function RosterTable({ type }: RosterTableProps) {
  const { project } = useProjectContext();
  const { rosterData, dateRangeStart, dateRangeEnd } = useRosterContext();

  if (!dateRangeStart || !dateRangeEnd || !project || !rosterData) {
    return null;
  }

  const sortedCandidates = Object.keys(rosterData).sort((a, b) =>
    rosterData[a].name.localeCompare(rosterData[b].name)
  );

  const processedRoster = sortedCandidates.reduce((acc, cuid) => {
    const candidate = rosterData[cuid];
    const candidateRoster = candidate.roster
      .map((roster) => ({
        ...roster,
        originalStartTime: roster.startTime,
        originalEndTime: roster.endTime,
      }))
      .flatMap((roster) => {
        if (
          roster.startTime.isSame(roster.endTime, "day") ||
          roster.endTime.isSame(roster.endTime.startOf("day"))
        ) {
          return roster;
        }

        return [
          {
            ...roster,
            endTime: roster.startTime.endOf("day"),
          },
          {
            ...roster,
            startTime: roster.endTime.startOf("day"),
            type: "OVERLAP",
          },
        ];
      })
      .reduce((acc, roster) => {
        const data = roster as RosterDisplayProps["data"];
        const date = data.startTime.format("DD-MM-YYYY");
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(data);
        return acc;
      }, {} as Record<string, RosterDisplayProps["data"][]>);

    acc[cuid] = candidateRoster;
    return acc;
  }, {} as Record<string, Record<string, RosterDisplayProps["data"][]>>);

  const numberOfDays = dateRangeEnd.diff(dateRangeStart, "days") + 1;

  console.log(rosterData);
  console.log(processedRoster);

  return (
    <Sheet
      variant="outlined"
      className="roster-table"
      sx={{
        "--TableCell-height": "3rem",
        "--Table-firstColumnWidth": "200px",
        overflow: "auto",
        maxHeight: type === "ATTENDANCE" ? "65dvh" : "8 7dvh",
      }}
    >
      <Table
        borderAxis="bothBetween"
        sx={{
          "& tr > td:first-of-type": {
            position: "sticky",
            left: 0,
            boxShadow: "1px 0 var(--TableCell-borderColor)",
            bgcolor: "background.surface",
            zIndex: 1,
            wordWrap: "break-word",
          },
          "& tr > th:first-of-type": {
            position: "sticky",
            left: 0,
            boxShadow: "1px 0 var(--TableCell-borderColor)",
            bgcolor: "background.surface",
            zIndex: 3,
          },
          th: {
            position: "sticky",
            top: 0,
            bottom: 0,
            boxShadow: "1px 0 var(--TableCell-borderColor)",
            bgcolor: "background.surface",
            zIndex: 2,
          },
        }}
      >
        <thead>
          <tr>
            <th style={{ width: "var(--Table-firstColumnWidth)" }}>Name</th>
            {Array.from({
              length: numberOfDays,
            }).map((_, index) => (
              <th
                key={index}
                style={{
                  width: "9rem",
                }}
              >
                {dateRangeStart.add(index, "days").format("ddd DD MMM")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody
          style={{
            scrollBehavior: "smooth",
            scrollSnapType: "y mandatory",
          }}
        >
          {rosterData && Object.keys(rosterData).length === 0 && (
            <tr>
              <td>
                <Typography>No candidates available</Typography>
              </td>
            </tr>
          )}
          {sortedCandidates.map((cuid) => {
            const candidate = rosterData[cuid];
            return (
              <tr key={cuid}>
                <td>{candidate.name}</td>
                {Array.from({
                  length: numberOfDays,
                }).map((_, index) => {
                  const date = dateRangeStart.add(index, "days");
                  return (
                    <DroppableArea
                      type={type}
                      candidate={{
                        ...candidate,
                        cuid,
                        roster:
                          processedRoster[cuid][date.format("DD-MM-YYYY")] ||
                          [],
                      }}
                      date={date}
                    />
                  );
                })}
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          {type === "ATTENDANCE" && <AttendanceSummary />}
          {type === "ROSTER" && <RosterSummary />}
        </tfoot>
      </Table>
    </Sheet>
  );
}
