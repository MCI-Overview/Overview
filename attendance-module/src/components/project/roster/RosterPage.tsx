import axios from "axios";
import { useEffect, useState } from "react";
import { useProjectContext } from "../../../providers/projectContextProvider";
import {
  Box,
  Card,
  CardOverflow,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/joy";
import {
  ChevronLeftRounded as ChevronLeftIcon,
  ChevronRightRounded as ChevronRightIcon,
} from "@mui/icons-material";
import dayjs, { Dayjs } from "dayjs";

import { GetRosterResponse, MappedRosterResponse } from "../../../types/common";
import CreateShiftModal from "./CreateShiftModal";
import CandidateDisplay from "./CandidateDisplay";
import CardDisplay from "./CardDisplay";
import DeleteBin from "./DeleteBin";
import DraggableChip from "./DraggableChip";

function getDateRange(date: Dayjs, weekOffset: number, days: number) {
  const startOfWeek = date.startOf("isoWeek").add(weekOffset * 7, "days");
  return {
    startDate: startOfWeek.startOf("day"),
    endDate: startOfWeek.clone().add(days, "days").endOf("day"),
  };
}

function enumerateDaysBetweenDates(startDate: Dayjs, endDate: Dayjs) {
  return Array.from(
    { length: dayjs(endDate).diff(startDate, "days") + 1 },
    (_, i) => dayjs(startDate).add(i, "days")
  );
}
export default function RosterPage() {
  const { project } = useProjectContext();
  const dayOffset = Math.floor(dayjs().diff(project?.startDate, "day") / 7);
  const [weekOffset, setWeekOffset] = useState(dayOffset);
  const [rosterData, setRosterData] = useState<MappedRosterResponse | null>(
    null
  );

  const dateRange = getDateRange(project?.startDate || dayjs(), weekOffset, 6);

  function updateRosterData(
    projectCuid: string,
    startDate: Dayjs,
    endDate: Dayjs
  ) {
    setRosterData(null);
    axios
      .get(`/api/admin/project/${projectCuid}/roster`, {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      })
      .then((res) => {
        const data: GetRosterResponse = res.data;
        setRosterData(
          data.map((candidate) => {
            return {
              cuid: candidate.cuid,
              name: candidate.name,
              startDate: dayjs(candidate.startDate),
              endDate: dayjs(candidate.endDate),
              roster: candidate.shifts.map((shift) => ({
                ...shift,
                type: shift.shiftType,
                startTime: dayjs(shift.shiftStartTime),
                endTime: dayjs(shift.shiftEndTime),
              })),
            };
          })
        );
      });
  }

  useEffect(() => {
    if (!project) return;
    updateRosterData(project?.cuid, dateRange.startDate, dateRange.endDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.cuid, weekOffset]);

  if (!project) return null;

  return (
    <Box
      sx={{
        px: { xs: 0, md: 4 },
        display: "flex",
        flexDirection: "column",
        gap: 1,
        position: "sticky",
      }}
    >
      <Stack spacing={2}>
        {/* Timetable */}
        <Box>
          <Stack
            sx={{
              "--Grid-borderWidth": "1px",
              borderTop: "var(--Grid-borderWidth) solid",
              borderLeft: "var(--Grid-borderWidth) solid",
              borderColor: "divider",
              "& > div": {
                borderRight: "var(--Grid-borderWidth) solid",
                borderColor: "divider",
              },
            }}
          >
            <Grid container>
              <Grid
                xs={5}
                sm={3}
                md={1.5}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <IconButton
                  size="sm"
                  onClick={() => setWeekOffset(weekOffset - 1)}
                  disabled={weekOffset === 0}
                >
                  <ChevronLeftIcon />
                </IconButton>

                <IconButton
                  size="sm"
                  onClick={() => setWeekOffset(weekOffset + 1)}
                >
                  <ChevronRightIcon />
                </IconButton>
              </Grid>

              {enumerateDaysBetweenDates(
                dateRange.startDate,
                dateRange.endDate
              ).map((date, index) => (
                <Grid xs key={index}>
                  <Typography
                    level="body-xs"
                    sx={{
                      display: "flex",
                      height: "100%",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {date.format("ddd DD MMM")}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </Stack>

          <Stack
            sx={{
              "--Grid-borderWidth": "1px",
              borderTop: "var(--Grid-borderWidth) solid",
              borderLeft: "var(--Grid-borderWidth) solid",
              borderColor: "divider",
              "& > div": {
                borderRight: "var(--Grid-borderWidth) solid",
                borderBottom: "var(--Grid-borderWidth) solid",
                borderColor: "divider",
              },
              minHeight: "2rem",
              height: "24rem",
              overflow: "auto",
              "&::-webkit-scrollbar": {
                display: "none",
              },
              "-ms-overflow-style": "none", // Internet Explorer 10+
              "scrollbar-width": "none", // Firefox
            }}
          >
            {!rosterData && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "4rem",
                }}
              />
            )}
            {rosterData && rosterData.length === 0 && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "4rem",
                }}
              >
                <Typography level="body-xs">
                  No candidates found for this period.
                </Typography>
              </Box>
            )}
            {rosterData && rosterData.length !== 0 && (
              <>
                {rosterData.map((candidate) => (
                  <CandidateDisplay
                    key={candidate.cuid}
                    cuid={candidate.cuid}
                    name={candidate.name}
                    projectStartDate={project.startDate}
                    projectEndDate={project.endDate}
                    currentRoster={candidate.roster}
                    startDate={dateRange.startDate}
                    endDate={dateRange.endDate}
                    firstDay={dayjs(candidate.startDate)}
                    lastDay={dayjs(candidate.endDate)}
                    updateRosterData={() =>
                      updateRosterData(
                        project.cuid,
                        dateRange.startDate,
                        dateRange.endDate
                      )
                    }
                  />
                ))}
              </>
            )}
          </Stack>
        </Box>
      </Stack>

      {/* Shifts */}
      <Box sx={{ display: "flex", gap: 1 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          <CreateShiftModal />
          <DeleteBin />
        </Box>

        <Stack
          direction="row"
          spacing={1}
          sx={{
            overflow: "auto",
            "&::-webkit-scrollbar": {
              display: "none",
            },
            "-ms-overflow-style": "none", // Internet Explorer 10+
            "scrollbar-width": "none", // Firefox
          }}
        >
          {project.shifts
            .sort((a, b) => (a.startTime.isBefore(b.startTime) ? -1 : 1))
            .map((shift) => (
              <Card>
                <CardOverflow sx={{ p: 1, gap: 1 }}>
                  <DraggableChip
                    type="FULL_DAY"
                    cuid={shift.cuid}
                    startTime={shift.startTime}
                    endTime={shift.endTime}
                  />
                  {shift.halfDayEndTime && (
                    <DraggableChip
                      type="FIRST_HALF"
                      key={`${shift.cuid} FIRST_HALF`}
                      cuid={shift.cuid}
                      startTime={shift.startTime}
                      endTime={shift.halfDayEndTime}
                    />
                  )}
                  {shift.halfDayStartTime && (
                    <DraggableChip
                      type="SECOND_HALF"
                      key={`${shift.cuid} SECOND_HALF`}
                      cuid={shift.cuid}
                      startTime={shift.halfDayStartTime}
                      endTime={shift.endTime}
                    />
                  )}
                </CardOverflow>
              </Card>
            ))}
        </Stack>
      </Box>

      <Stack sx={{ display: "flex" }}>
        <CardDisplay
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          rosterData={rosterData}
        />
      </Stack>
    </Box>
  );
}
