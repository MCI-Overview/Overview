import axios from "axios";
import { useEffect, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useProjectContext } from "../../../providers/projectContextProvider";
import { Box, Grid, IconButton, Stack, Typography } from "@mui/joy";
import {
  ChevronLeftRounded as ChevronLeftIcon,
  ChevronRightRounded as ChevronRightIcon,
} from "@mui/icons-material";
import { capitalizeWords } from "../../../utils/capitalize";
import dayjs, { Dayjs } from "dayjs";

import { GetRosterResponse, MappedRosterResponse } from "../../../types/common";
import CreateShiftModal from "./CreateShiftModal";
import CandidateDisplay from "./CandidateDisplay";
import CardDisplay from "./CardDisplay";
import DeleteBin from "./DeleteBin";
import DraggableChip from "./DraggableChip";

function getDateRange(date: Dayjs, weekOffset: number, days: number) {
  const startOfWeek = date.startOf("isoWeek").add(weekOffset * 2, "weeks");
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
  const [weekOffset, setWeekOffset] = useState(0);
  const { project } = useProjectContext();
  const [rosterData, setRosterData] = useState<MappedRosterResponse | null>(
    null
  );

  const dateRange = getDateRange(project?.startDate || dayjs(), weekOffset, 13);

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
    <DndProvider backend={HTML5Backend}>
      <Stack
        sx={{ display: "flex", flexGrow: 1, overflow: "hidden" }}
        spacing={3}
      >
        {/* Timetable */}
        <Box height="35vh">
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
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <IconButton
                onClick={() => setWeekOffset(weekOffset - 1)}
                disabled={weekOffset === 0}
              >
                <ChevronLeftIcon />
              </IconButton>
              <Typography level="h4">
                {dateRange.startDate.format("DD MMM YY")} -{" "}
                {dateRange.endDate.format("DD MMM YY")}
              </Typography>
              <IconButton onClick={() => setWeekOffset(weekOffset + 1)}>
                <ChevronRightIcon />
              </IconButton>
            </Stack>

            <Grid container>
              <Grid xs={2}>
                <Box />
              </Grid>
              {enumerateDaysBetweenDates(
                dateRange.startDate,
                dateRange.endDate
              ).map((date, index) => (
                <Grid xs key={index}>
                  <Typography textAlign="center">
                    {date.format("MM/DD")}
                  </Typography>
                  <Typography textAlign="center">
                    {capitalizeWords(date.format("ddd"))}
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
              maxHeight: "25vh",
            }}
            overflow="auto"
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
                <Typography>No candidates found for this period.</Typography>
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
        {/* <Stack direction="row" spacing={1} flexWrap={"wrap"}>
          {project.shiftGroups.map((shiftGroup) => (
            <ShiftTemplate
              key={shiftGroup.name}
              name={shiftGroup.name}
              shiftCuids={shiftGroup.shifts}
            />
          ))}
        </Stack> */}
        {/* Shifts */}
        <Box height="8vh">
          <Stack direction="row" spacing={1} flexWrap={"wrap"}>
            {project.shifts.map((shift) => (
              <Stack spacing={0.5} key={`${shift.cuid} FULL_DAY`}>
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
              </Stack>
            ))}
            <CreateShiftModal />
            <DeleteBin />
          </Stack>
        </Box>
        <Box height="35vh">
          <CardDisplay
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            rosterData={rosterData}
          />
        </Box>
      </Stack>
    </DndProvider>
  );
}
