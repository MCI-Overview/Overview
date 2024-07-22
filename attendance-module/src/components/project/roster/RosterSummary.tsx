import { Stack, Tooltip, Typography } from "@mui/joy";
import { useProjectContext } from "../../../providers/projectContextProvider";
import { useRosterContext } from "../../../providers/rosterContextProvider";
import { seedToColor } from "../../../utils/colors";
import SummaryDisplayItem from "./SummaryDisplayItem";
import { RosterDisplayProps } from "./RosterDisplay";

type RosterSummary = {
  shiftCuid: string;
  FULL_DAY: number;
  FIRST_HALF: number;
  SECOND_HALF: number;
  OVERLAP?: number;
  data?: RosterDisplayProps["data"];
};

export default function RosterSummary() {
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

  const rosterCounts = Object.keys(consolidatedRoster).reduce((acc, date) => {
    const rosters = consolidatedRoster[date];

    const mappedInfo = rosters.reduce((acc, roster) => {
      if (!acc[roster.shiftCuid]) {
        acc[roster.shiftCuid] = {
          shiftCuid: roster.shiftCuid,
          FULL_DAY: 0,
          FIRST_HALF: 0,
          SECOND_HALF: 0,
        };
      }

      // if (roster.state === "PREVIEW") return acc;

      acc[roster.shiftCuid][roster.type] =
        acc[roster.shiftCuid][roster.type] + 1;
      acc[roster.shiftCuid]["data"] = roster;

      return acc;
    }, {} as Record<string, RosterSummary>);
    acc[date] = Object.values(mappedInfo);
    return acc;
  }, {} as Record<string, RosterSummary[]>);

  return (
    <tr>
      <th>Roster Summary</th>
      {Array.from({
        length: dateRangeEnd.diff(dateRangeStart, "days") + 1,
      }).map((_, index) => {
        const date = dateRangeStart.add(index, "days").format("DD-MM-YYYY");
        const rosterData = rosterCounts[date];

        return (
          <th key={date}>
            {!rosterData && <Typography textAlign="center">-</Typography>}
            <Stack spacing={0.5}>
              {rosterData &&
                rosterData
                  .filter((roster) => !!project.shiftDict[roster.shiftCuid])
                  .sort((a, b) => {
                    const aStartTime = project.shiftDict[a.shiftCuid].startTime;
                    const bStartTime = project.shiftDict[b.shiftCuid].startTime;

                    return aStartTime.isBefore(bStartTime) ? -1 : 1;
                  })
                  .map((roster) => {
                    const { startTime, endTime } =
                      project.shiftDict[roster.shiftCuid];

                    return (
                      <Tooltip
                        title={
                          <Stack>
                            <Typography>
                              Full Day: {roster.FULL_DAY || 0}
                            </Typography>
                            <Typography>
                              First Half: {roster.FIRST_HALF || 0}
                            </Typography>
                            <Typography>
                              Second Half: {roster.SECOND_HALF || 0}
                            </Typography>
                          </Stack>
                        }
                      >
                        <SummaryDisplayItem
                          color={seedToColor(roster.shiftCuid)}
                          text={`${startTime.format("HHmm")} - ${endTime.format(
                            "HHmm"
                          )}`}
                          count={
                            roster.FIRST_HALF +
                            roster.SECOND_HALF +
                            roster.FULL_DAY
                          }
                        />
                      </Tooltip>
                    );
                  })}
            </Stack>
          </th>
        );
      })}
    </tr>
  );
}
