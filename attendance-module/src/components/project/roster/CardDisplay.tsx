import { Stack, Card, Table, CardOverflow, Typography } from "@mui/joy";
import { useProjectContext } from "../../../providers/projectContextProvider";
import { Dayjs } from "dayjs";
import { MappedRosterResponse } from "../../../types/common";
import { Fragment } from "react";
import { TdTypo, ThTypo } from "../ui/TableTypo";

import {
  HourglassFullRounded as HourglassFullIcon,
  HourglassTopRounded as HourglassTopIcon,
  HourglassBottomRounded as HourglassBottomIcon,
} from "@mui/icons-material";

function getPrefix(type: "FULL_DAY" | "FIRST_HALF" | "SECOND_HALF") {
  switch (type) {
    case "FULL_DAY":
      return <HourglassFullIcon />;
    case "FIRST_HALF":
      return <HourglassTopIcon />;
    case "SECOND_HALF":
      return <HourglassBottomIcon />;
  }
}

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
        "-ms-overflow-style": "none", // Internet Explorer 10+
        "scrollbar-width": "none", // Firefox
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
              "& tr > *": { textAlign: "center" },
              minWidth: "150px",
            }}
            key={date.format("YYYY-MM-DD, ddd")}
          >
            <CardOverflow sx={{ p: 0 }}>
              <Table
                sx={{
                  "& tr > *": { textAlign: "center" },
                  flexGrow: 1,
                }}
              >
                <thead>
                  <tr>
                    <ThTypo>{date.format("YYYY-MM-DD, ddd")}</ThTypo>
                  </tr>
                </thead>
                <tbody>
                  {collectedRosterData &&
                    collectedRosterData[date.format("YYYY-MM-DD")] &&
                    Object.entries(
                      collectedRosterData[date.format("YYYY-MM-DD")]
                    ).map(([shiftCuid, shiftCounts]) => {
                      if (!project.shiftDict[shiftCuid]) return null;

                      const {
                        FULL_DAY: fullDayCount,
                        FIRST_HALF: firstHalfCount,
                        SECOND_HALF: secondHalfCount,
                      } = shiftCounts;

                      const {
                        startTime,
                        endTime,
                        halfDayEndTime,
                        halfDayStartTime,
                      } = project.shiftDict[shiftCuid];
                      return (
                        <Fragment key={shiftCuid}>
                          {fullDayCount != 0 && (
                            <tr>
                              <TdTypoNowrap
                                type="FULL_DAY"
                                startTime={startTime}
                                endTime={endTime}
                              >
                                {fullDayCount}
                              </TdTypoNowrap>
                            </tr>
                          )}
                          {halfDayEndTime && firstHalfCount != 0 && (
                            <tr>
                              <TdTypoNowrap
                                type="FIRST_HALF"
                                startTime={startTime}
                                endTime={halfDayEndTime}
                              >
                                {firstHalfCount}
                              </TdTypoNowrap>
                            </tr>
                          )}
                          {halfDayStartTime && secondHalfCount != 0 && (
                            <tr>
                              <TdTypoNowrap
                                type="SECOND_HALF"
                                startTime={halfDayStartTime}
                                endTime={endTime}
                              >
                                {secondHalfCount}
                              </TdTypoNowrap>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}

                  {collectedRosterData &&
                    !collectedRosterData[date.format("YYYY-MM-DD")] && (
                      <tr>
                        <TdTypo>No rostered data</TdTypo>
                      </tr>
                    )}
                </tbody>
              </Table>
            </CardOverflow>
          </Card>
        );
      })}
    </Stack>
  );
}

const TdTypoNowrap = ({
  type,
  startTime,
  endTime,
  children,
}: {
  type: "FULL_DAY" | "FIRST_HALF" | "SECOND_HALF";
  startTime: Dayjs;
  endTime: Dayjs;
  children?: React.ReactNode;
}) => {
  return (
    <TdTypo sx={{ whiteSpace: "nowrap" }}>
      <Typography fontSize={14}>{getPrefix(type)} </Typography>
      {`${startTime.format("HHmm")} - ${endTime.format("HHmm")}: `}
      {children}
    </TdTypo>
  );
};
