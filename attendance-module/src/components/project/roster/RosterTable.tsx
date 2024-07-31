import dayjs from "dayjs";
import axios from "axios";
import { useDrop } from "react-dnd";
import { useEffect, useState } from "react";
import { useStore } from "@tanstack/react-store";

import DroppableArea from "./DroppableArea";
import RosterSummary from "./RosterSummary";
import AttendanceSummary from "./AttendanceSummary";
import { RosterDisplayProps } from "./RosterDisplay";
import { useRosterTableContext } from "../../../providers/rosterContextProvider";
import { useProjectContext } from "../../../providers/projectContextProvider";

import {
  Checkbox,
  Chip,
  Sheet,
  Stack,
  Table,
  Tooltip,
  Typography,
} from "@mui/joy";
import { store } from "../../../store";

type RosterTableProps = {
  type: "ATTENDANCE" | "ROSTER";
};

export default function RosterTable({ type }: RosterTableProps) {
  const { project } = useProjectContext();
  const {
    rosterData,
    dateRangeStart,
    dateRangeEnd,
    selectedCandidates,
    hoverDate,
    candidateHoverCuid,
    dates,
    sortedCandidates,
    updateRosterData,
    setDates,
    setHoverDate,
    setSelectedCandidates,
    setCandidateHoverCuid,
  } = useRosterTableContext();

  const publicHolidays = useStore(
    store,
    (state) => state.publicHolidays
  ) as Record<
    string,
    {
      date: string;
      name: string;
      createdAt: string;
    }[]
  >;

  const [{ item, itemType }, drop] = useDrop({
    accept: ["shift", "roster", "candidate"],
    drop: () => {
      if (!rosterData || !project) return;

      if (itemType === "shift") {
        const newRoster = Object.keys(rosterData).reduce(
          (acc, cuid) => [
            ...acc,
            ...rosterData[cuid].newRoster.map((roster) => ({
              shiftType: roster.type,
              shiftDate: roster.startTime.startOf("day").toDate(),
              shiftCuid: roster.shiftCuid,
              candidateCuid: cuid,
            })),
          ],
          [] as {
            shiftDate: Date;
            shiftType: string;
            shiftCuid: string;
            candidateCuid: string;
          }[]
        );

        axios
          .post(`/api/admin/project/${project.cuid}/roster`, {
            newRoster,
          })
          .then(() => {
            updateRosterData();
          });
      }

      if (itemType === "roster") {
        axios
          .patch(`/api/admin/roster`, {
            rosterCuid: (item as RosterDisplayProps["data"]).rosterCuid,
            candidateCuid: candidateHoverCuid,
            rosterDate: hoverDate,
          })
          .then(() => {
            updateRosterData();
          });
      }
    },
    hover: () => {
      setHoverDate(null);
      setCandidateHoverCuid(null);
    },
    collect: (monitor) => ({
      item: monitor.getItem(),
      itemType: monitor.getItemType(),
    }),
  });

  if (!dateRangeStart || !dateRangeEnd || !project || !rosterData) {
    return null;
  }

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
            isPartial: true,
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

  return (
    <Sheet
      ref={drop}
      variant="outlined"
      className="roster-table"
      sx={{
        "--TableCell-height": "3rem",
        "--Table-firstColumnWidth": "200px",
        overflow: "auto",
        maxHeight: type === "ATTENDANCE" ? "65dvh" : "87dvh",
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
            <th
              style={{
                width: "var(--Table-firstColumnWidth)",
                alignContent: "center",
                placeContent: "center",
              }}
            >
              <Stack direction="row" gap={1}>
                <Checkbox
                  overlay
                  sx={{
                    display: type === "ATTENDANCE" ? "none" : "block",
                  }}
                  checked={
                    selectedCandidates.length > 0 &&
                    selectedCandidates.length === sortedCandidates.length
                  }
                  indeterminate={
                    selectedCandidates.length > 0 &&
                    selectedCandidates.length !== sortedCandidates.length
                  }
                  onChange={(e) => {
                    setSelectedCandidates(
                      e.target.checked ? sortedCandidates : []
                    );
                  }}
                />
                {`Name ${
                  selectedCandidates.length > 0
                    ? `(${selectedCandidates.length} of ${sortedCandidates.length})`
                    : ""
                }`}
              </Stack>
            </th>

            {Array.from({
              length: numberOfDays,
            }).map((_, index) => {
              const date = dateRangeStart.add(index, "days");
              const holiday = publicHolidays[date.year()]?.find((holiday) =>
                dayjs(holiday.date).isSame(date, "day")
              );
              return (
                <th
                  key={index}
                  style={{
                    width: "9rem",
                    alignContent: "center",
                    placeContent: "center",
                  }}
                >
                  <Stack direction="row" gap={1}>
                    <Checkbox
                      overlay
                      sx={{
                        display: type === "ATTENDANCE" ? "none" : "block",
                      }}
                      checked={dates.some((otherDate) =>
                        otherDate.isSame(date, "day")
                      )}
                      onChange={(e) => {
                        setDates(
                          e.target.checked
                            ? [...dates, date]
                            : dates.filter((d) => !d.isSame(date, "day"))
                        );
                      }}
                    />
                    {date.format("ddd DD MMM")}
                    {holiday && (
                      <Tooltip title={holiday.name}>
                        <Chip
                          size="sm"
                          variant="solid"
                          color="danger"
                          sx={{ borderColor: "primary.main" }}
                        >
                          PH
                        </Chip>
                      </Tooltip>
                    )}
                  </Stack>
                </th>
              );
            })}
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
              <td colSpan={8}>
                <Typography textAlign="center">
                  No candidates available
                </Typography>
              </td>
            </tr>
          )}
          {sortedCandidates.map((cuid) => {
            const candidate = rosterData[cuid];
            return (
              <tr key={cuid} onPointerEnter={() => setCandidateHoverCuid}>
                <td>
                  <Stack direction="row" gap={1} alignItems="center">
                    <Checkbox
                      overlay
                      sx={{
                        display: type === "ATTENDANCE" ? "none" : "block",
                      }}
                      checked={selectedCandidates.includes(cuid)}
                      onChange={(e) => {
                        setSelectedCandidates(
                          e.target.checked
                            ? [...selectedCandidates, cuid]
                            : selectedCandidates.filter((c) => c !== cuid)
                        );
                      }}
                    />
                    <Stack direction="column" gap={1}>
                      <Typography level="title-sm">{candidate.name}</Typography>
                      <Typography level="body-xs">{candidate.nric}</Typography>
                    </Stack>
                  </Stack>
                </td>
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
