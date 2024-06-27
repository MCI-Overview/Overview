import { Stack, Card, Table, Typography, Tooltip } from "@mui/joy";
import { useProjectContext } from "../../../providers/projectContextProvider";
import { Dayjs } from "dayjs";
import { MappedRosterResponse } from "../../../types/common";
import { Fragment } from "react";

export default function CardDisplay({
  startDate,
  endDate,
  rosterData,
}: {
  startDate: Dayjs;
  endDate: Dayjs;
  rosterData: MappedRosterResponse | null;
}) {
  const { project } = useProjectContext();

  if (!project) return null;

  const collectedRosterData = rosterData?.reduce((acc, candidate) => {
    candidate.roster.forEach((shift) => {
      const day = shift.startTime.format("YYYY-MM-DD");
      if (!acc[day]) {
        acc[day] = {};
      }
      if (!acc[day][shift.shiftCuid]) {
        acc[day][shift.shiftCuid] = {
          FULL_DAY: 0,
          FIRST_HALF: 0,
          SECOND_HALF: 0,
        };
      }
      acc[day][shift.shiftCuid][shift.type] += 1;
    });
    return acc;
  }, {} as Record<string, Record<string, Record<string, number>>>);

  // TODO: Fix card display not showing rostered data when shift is not in project context
  return (
    <Stack
      direction="row"
      spacing={1}
      flexWrap="nowrap"
      height="100%"
      sx={{
        overflow: "auto",
        "&::-webkit-scrollbar": {
          display: "none",
        },
        "-ms-overflow-style": "none",  // Internet Explorer 10+
        "scrollbar-width": "none",     // Firefox
      }}
    >
      {Array.from({
        length: endDate.diff(startDate, "days") + 1,
      }).map((_, index) => {
        const date = startDate.add(index, "days");
        return (
          <Card
            sx={{
              display: "flex",
              "&:hover": {
                boxShadow: "md",
                borderColor: "neutral.outlinedHoverBorder",
              },
            }}
            key={date.format("YYYY-MM-DD, ddd")}
          >
            <Stack sx={{ minWidth: "15rem", flexGrow: 1 }}>
              <Table
                sx={{
                  tr: { textAlign: "center" },
                  flexGrow: 1,
                }}
              >
                <thead>
                  <tr>
                    <td colSpan={3}>
                      <Typography level="title-md">
                        {date.format("YYYY-MM-DD, ddd")}
                      </Typography>
                    </td>
                  </tr>
                </thead>
                <tbody>
                  {collectedRosterData &&
                    collectedRosterData[date.format("YYYY-MM-DD")] &&
                    Object.entries(
                      collectedRosterData[date.format("YYYY-MM-DD")],
                    ).map(([shiftCuid, shiftCounts]) => {
                      if (!project.shiftDict[shiftCuid]) return null;

                      const { FULL_DAY, FIRST_HALF, SECOND_HALF } = shiftCounts;
                      const {
                        startTime,
                        endTime,
                        halfDayEndTime,
                        halfDayStartTime,
                      } = project.shiftDict[shiftCuid];
                      return (
                        <Fragment key={shiftCuid}>
                          <tr>
                            <td
                              rowSpan={halfDayStartTime ? 3 : 1}
                              colSpan={halfDayStartTime ? 1 : 2}
                            >{`${startTime.format("HHmm")} - ${endTime.format(
                              "HHmm",
                            )}`}</td>
                            {halfDayStartTime && <td>Full</td>}
                            <td>{FULL_DAY}</td>
                          </tr>
                          {halfDayEndTime && (
                            <Tooltip
                              title={`${startTime.format(
                                "HHmm",
                              )} - ${halfDayEndTime?.format("HHmm")}`}
                            >
                              <tr>
                                <td>1st Half</td>
                                <td>{FIRST_HALF}</td>
                              </tr>
                            </Tooltip>
                          )}
                          {halfDayStartTime && (
                            <Tooltip
                              title={`${halfDayStartTime?.format(
                                "HHmm",
                              )} - ${endTime.format("HHmm")}`}
                            >
                              <tr>
                                <td>2nd Half</td>
                                <td>{SECOND_HALF}</td>
                              </tr>
                            </Tooltip>
                          )}
                        </Fragment>
                      );
                    })}

                  {collectedRosterData &&
                    !collectedRosterData[date.format("YYYY-MM-DD")] && (
                      <tr>
                        <td colSpan={3}>No rostered data</td>
                      </tr>
                    )}
                </tbody>
              </Table>
            </Stack>
          </Card>
        );
      })}
    </Stack>
  );
}
