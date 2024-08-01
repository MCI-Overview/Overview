import dayjs from "dayjs";
import axios from "axios";
import { useDrop } from "react-dnd";
import { useStore } from "@tanstack/react-store";

import DroppableArea from "./DroppableArea";
import RosterSummary from "./RosterSummary";
import AttendanceSummary from "./AttendanceSummary";
import { RosterDisplayProps } from "./RosterDisplay";
import {
  useRosterDataContext,
  useRosterDraggingContext,
  useRosterTableContext,
} from "../../../providers/rosterContextProvider";
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
    dateRangeStart,
    dateRangeEnd,
    selectedCandidates,
    dates,
    setDates,
    setSelectedCandidates,
  } = useRosterTableContext();

  const { rosterData, updateRosterData, sortedCandidates } =
    useRosterDataContext();
  const { hoverDate, setHoverDate, hoverCandidateCuid, setHoverCandidateCuid } =
    useRosterDraggingContext();

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
            ...Object.values(rosterData[cuid].newRoster)
              .flat()
              .map((roster) => ({
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
            candidateCuid: hoverCandidateCuid,
            rosterDate: hoverDate,
          })
          .then(() => {
            updateRosterData();
          });
      }
    },
    hover: () => {
      setHoverDate(null);
      setHoverCandidateCuid(null);
    },
    collect: (monitor) => ({
      item: monitor.getItem(),
      itemType: monitor.getItemType(),
    }),
  });

  if (!dateRangeStart || !dateRangeEnd || !project || !rosterData) {
    return null;
  }

  // Code that splits overnight rosters
  // Object.keys(rosterData).forEach((cuid) =>
  //   Object.keys(rosterData[cuid].roster).forEach((date) => {
  //     const candidateRoster = rosterData[cuid].roster;
  //     candidateRoster[date] = candidateRoster[date]
  //       .map((roster) => ({
  //         ...roster,
  //         originalStartTime: roster.startTime,
  //         originalEndTime: roster.endTime,
  //       }))
  //       .flatMap((roster) => {
  //         if (
  //           roster.startTime.isSame(roster.endTime, "day") ||
  //           roster.endTime.isSame(roster.endTime.startOf("day"))
  //         ) {
  //           return roster;
  //         }

  //         return [
  //           {
  //             ...roster,
  //             endTime: roster.startTime.endOf("day"),
  //           },
  //           {
  //             ...roster,
  //             startTime: roster.endTime.startOf("day"),
  //             isPartial: true,
  //           },
  //         ];
  //       });
  //   })
  // );

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

            if (!candidate) return;

            return (
              <tr key={cuid}>
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
                      <Typography level="body-xs">
                        {candidate.employeeId}
                      </Typography>
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
                        roster: [
                          ...(rosterData[cuid].roster[
                            date.format("DD-MM-YYYY")
                          ] || []),
                          ...(rosterData[cuid].newRoster[
                            date.format("DD-MM-YYYY")
                          ] || []),
                        ],
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
