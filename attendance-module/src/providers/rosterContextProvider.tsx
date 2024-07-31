/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import { GetRosterResponse } from "../types/common";
import axios from "axios";
import dayjs from "dayjs";
import { useProjectContext } from "./projectContextProvider";
import { RosterDisplayProps } from "../components/project/roster/RosterDisplay";
import { DraggableRosterChipProps } from "../components/project/roster/DraggableRosterChip";
import { DraggableRosterProps } from "../components/project/roster/DraggableRoster";

type MappedRosterResponse = {
  [cuid: string]: {
    name: string;
    nric: string;
    restDay: string;
    startDate: dayjs.Dayjs;
    endDate: dayjs.Dayjs;
    roster: RosterDisplayProps["data"][];
    rosterLength: number;
    newRoster: RosterDisplayProps["data"][];
    possibleDates?: dayjs.Dayjs[];
  };
};

const RosterTableContext = createContext<{
  item: DraggableRosterProps | DraggableRosterChipProps | null;
  dates: dayjs.Dayjs[];
  itemType: "shift" | "roster" | null;
  hoverDate: dayjs.Dayjs | null;
  hoverCuid: string | null | undefined;
  weekOffset: number;
  rosterData: MappedRosterResponse | null;
  draggingCuid: string | null;
  dateRangeEnd: dayjs.Dayjs;
  dateRangeStart: dayjs.Dayjs;
  sortedCandidates: string[];
  selectedCandidates: string[];
  candidateHoverCuid: string | null;
  setItem: (
    item: DraggableRosterProps | DraggableRosterChipProps | null
  ) => void;
  setDates: (dates: dayjs.Dayjs[]) => void;
  setItemType: (type: "shift" | "roster" | null) => void;
  setSortOrder: (
    order: "name-asc" | "name-desc" | "unassign" | "assign" | "selected"
  ) => void;
  setHoverDate: (date: dayjs.Dayjs | null) => void;
  setHoverCuid: (cuid: string | null) => void;
  setWeekOffset: (offset: number) => void;
  setDraggingCuid: (cuid: string | null) => void;
  updateRosterData: () => void;
  setSelectedCandidates: (cuids: string[]) => void;
  setCandidateHoverCuid: (cuid: string | null) => void;
}>({
  item: null,
  dates: [],
  itemType: null,
  hoverDate: dayjs(),
  hoverCuid: null,
  rosterData: null,
  weekOffset: 0,
  draggingCuid: null,
  dateRangeEnd: dayjs(),
  dateRangeStart: dayjs(),
  candidateHoverCuid: null,
  sortedCandidates: [],
  selectedCandidates: [],
  setItem: () => {},
  setDates: () => {},
  setItemType: () => {},
  setSortOrder: () => {},
  setHoverDate: () => {},
  setHoverCuid: () => {},
  setWeekOffset: () => {},
  setDraggingCuid: () => {},
  updateRosterData: () => {},
  setSelectedCandidates: () => {},
  setCandidateHoverCuid: () => {},
});

export function RosterTableContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { project } = useProjectContext();
  const [rosterData, setRosterData] = useState<MappedRosterResponse | null>(
    null
  );
  const [item, setItem] = useState<
    DraggableRosterProps | DraggableRosterChipProps | null
  >(null);
  const [itemType, setItemType] = useState<"shift" | "roster" | null>(null);
  const [hoverCuid, setHoverCuid] = useState<string | null>(null);
  const [hoverDate, setHoverDate] = useState<dayjs.Dayjs | null>(null);
  const [draggingCuid, setDraggingCuid] = useState<string | null>(null);
  const [candidateHoverCuid, setCandidateHoverCuid] = useState<string | null>(
    null
  );
  const [weekOffset, setWeekOffset] = useState<number>(
    Math.floor(dayjs().diff(project?.startDate.startOf("isoWeek"), "weeks")) ||
      0
  );
  const [sortedCandidates, setSortedCandidates] = useState<string[]>(
    Object.keys(rosterData || {})
  );
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<
    "name-asc" | "name-desc" | "unassign" | "assign" | "selected"
  >("selected");

  useEffect(() => {
    if (!rosterData) return;

    const candidatesList = Object.keys(rosterData).sort((a, b) =>
      rosterData[a].name.localeCompare(rosterData[b].name)
    );

    if (sortOrder === "name-asc") {
      setSortedCandidates(candidatesList);
    }

    if (sortOrder === "name-desc") {
      setSortedCandidates(candidatesList.reverse());
    }

    if (sortOrder === "selected") {
      setSortedCandidates([
        ...selectedCandidates,
        ...candidatesList.filter((c) => !selectedCandidates.includes(c)),
      ]);
    }

    if (sortOrder === "unassign") {
      setSortedCandidates(
        candidatesList.sort((a, b) => {
          if (
            rosterData[a].rosterLength === 0 &&
            rosterData[b].rosterLength === 0
          ) {
            return a.localeCompare(b);
          }
          if (rosterData[a].rosterLength === 0) {
            return -1;
          }
          if (rosterData[b].rosterLength === 0) {
            return 1;
          }

          return a.localeCompare(b);
        })
      );
    }

    if (sortOrder === "assign") {
      setSortedCandidates(
        candidatesList.sort((a, b) => {
          if (
            rosterData[a].rosterLength === 0 &&
            rosterData[b].rosterLength === 0
          ) {
            return a.localeCompare(b);
          }
          if (rosterData[a].rosterLength === 0) {
            return 1;
          }
          if (rosterData[b].rosterLength === 0) {
            return -1;
          }

          return a.localeCompare(b);
        })
      );
    }
  }, [rosterData, selectedCandidates, sortOrder]);

  const [dates, setDates] = useState<dayjs.Dayjs[]>([]);
  const baseDay = project?.startDate.startOf("isoWeek");
  const dateRangeStart = baseDay?.add(weekOffset, "weeks");
  const dateRangeEnd = dateRangeStart?.endOf("isoWeek");

  const updateRosterData = useCallback(() => {
    if (!project || !dateRangeStart || !dateRangeEnd) return;

    axios
      .get(`/api/admin/project/${project?.cuid}/roster`, {
        params: {
          startDate: dateRangeStart.toISOString(),
          endDate: dateRangeEnd.toISOString(),
        },
      })
      .then((res) => {
        const data: GetRosterResponse = res.data;
        const mappedData = data.reduce<MappedRosterResponse>(
          (acc, candidate) => {
            acc[candidate.cuid] = {
              name: candidate.name,
              nric: candidate.nric,
              restDay: candidate.restDay,
              startDate: dayjs(candidate.startDate),
              endDate: dayjs(candidate.endDate),
              roster: candidate.rosters.map((roster) => ({
                rosterCuid: roster.rosterCuid,
                shiftCuid: roster.shiftCuid,
                clientHolderCuids: roster.clientHolderCuids,
                candidateCuid: candidate.cuid,
                projectCuid: roster.projectCuid,
                type: roster.type,
                breakDuration: roster.breakDuration,
                status: roster.status,
                leave: roster.leave,
                isPartial: false,
                startTime: dayjs(roster.startTime),
                endTime: dayjs(roster.endTime),
                originalStartTime: dayjs(roster.startTime),
                originalEndTime: dayjs(roster.endTime),
                clockInTime: dayjs(roster.clockInTime),
                clockOutTime: dayjs(roster.clockOutTime),
              })),
              newRoster: [],
              rosterLength: candidate.rosters.length,
            };
            return acc;
          },
          {}
        );

        setRosterData(mappedData);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekOffset, project]);

  useEffect(() => {
    updateRosterData();
  }, [weekOffset, updateRosterData]);

  useEffect(() => {
    setSelectedCandidates(
      selectedCandidates.filter((cuid) => rosterData?.[cuid])
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rosterData]);

  const memomizedMergedData = useMemo(() => {
    if (!rosterData || !dateRangeEnd || !dateRangeStart) return rosterData;

    return Object.keys(rosterData).reduce<MappedRosterResponse>((acc, cuid) => {
      if (!rosterData) return acc;

      const [newRoster, possibleDates] = Array.from({
        length: dateRangeEnd.diff(dateRangeStart, "days") + 1,
      })
        .map((_, i) => dateRangeStart.add(i, "days"))
        .reduce(
          (acc, date) => {
            if (
              !date.isBetween(
                rosterData[cuid].startDate,
                rosterData[cuid].endDate,
                "day",
                "[]"
              )
            ) {
              return acc;
            }

            if (!item) {
              acc[1].push(date);
              return acc;
            }

            let itemStartTime = date;
            let itemEndTime = date;

            if (itemType === "shift") {
              itemStartTime = itemStartTime
                .set("hour", item.startTime.hour())
                .set("minute", item.startTime.minute());
              itemEndTime = itemEndTime
                .set("hour", item.endTime.hour())
                .set("minute", item.endTime.minute());
            }

            if (itemType === "roster") {
              itemStartTime = itemStartTime
                .set(
                  "hour",
                  (item as DraggableRosterProps).originalStartTime.hour()
                )
                .set(
                  "minute",
                  (item as DraggableRosterProps).originalStartTime.minute()
                );
              itemEndTime = itemEndTime
                .set(
                  "hour",
                  (item as DraggableRosterProps).originalEndTime.hour()
                )
                .set(
                  "minute",
                  (item as DraggableRosterProps).originalEndTime.minute()
                );
            }

            if (itemStartTime.isAfter(itemEndTime)) {
              itemEndTime = itemEndTime.add(1, "day");
            }

            const hasNoOverlap = rosterData[cuid].roster
              .filter((roster) => roster.state !== "PREVIEW")
              .every(
                (roster) =>
                  !(
                    itemStartTime.isBetween(roster.startTime, roster.endTime) ||
                    itemEndTime.isBetween(roster.startTime, roster.endTime) ||
                    roster.startTime.isBetween(itemStartTime, itemEndTime) ||
                    roster.endTime.isBetween(itemStartTime, itemEndTime) ||
                    (itemStartTime.isSame(roster.startTime) &&
                      itemEndTime.isSame(roster.endTime))
                  )
              );

            // Enable dragging to past
            // if (hasNoOverlap && itemStartTime.isAfter(dayjs())) {
            if (hasNoOverlap) {
              acc[1].push(date);

              if (itemType === "shift") {
                const isCandidate =
                  selectedCandidates.includes(cuid) ||
                  (!selectedCandidates.length && candidateHoverCuid === cuid);

                const isDateSelected =
                  dates.some((d) => d.isSame(date, "day")) ||
                  (!dates.length && hoverDate && hoverDate.isSame(date, "day"));

                if (isCandidate && isDateSelected) {
                  acc[0].push({
                    ...item,
                    isPartial: false,
                    originalStartTime: itemStartTime,
                    originalEndTime: itemEndTime,
                    startTime: itemStartTime,
                    endTime: itemEndTime,
                    state: "PREVIEW",
                  });
                }
              }

              if (itemType === "roster") {
                const isCandidate = candidateHoverCuid === cuid;

                const isDateSelected =
                  hoverDate && hoverDate.isSame(date, "day");

                if (isCandidate && isDateSelected) {
                  acc[0].push({
                    ...item,
                    isPartial: false,
                    originalStartTime: itemStartTime,
                    originalEndTime: itemEndTime,
                    startTime: itemStartTime,
                    endTime: itemEndTime,
                    state: "PREVIEW",
                  });
                }
              }

              return acc;
            }

            return acc;
          },
          [[], []] as [RosterDisplayProps["data"][], dayjs.Dayjs[]]
        );

      acc[cuid] = {
        ...rosterData[cuid],
        possibleDates,
        roster: [...rosterData[cuid].roster, ...newRoster],
        newRoster: [...newRoster],
      };

      return acc;
    }, {});
  }, [
    rosterData,
    dateRangeEnd,
    dateRangeStart,
    item,
    itemType,
    selectedCandidates,
    candidateHoverCuid,
    dates,
    hoverDate,
  ]);

  if (!project || !dateRangeStart || !dateRangeEnd || !rosterData) {
    return null;
  }

  return (
    <RosterTableContext.Provider
      value={{
        item,
        dates,
        itemType,
        hoverDate,
        hoverCuid,
        weekOffset,
        draggingCuid,
        dateRangeEnd,
        dateRangeStart,
        sortedCandidates,
        selectedCandidates,
        candidateHoverCuid,
        rosterData: memomizedMergedData,
        setItem,
        setDates,
        setItemType,
        setSortOrder,
        setHoverDate,
        setHoverCuid,
        setWeekOffset,
        setDraggingCuid,
        updateRosterData,
        setCandidateHoverCuid,
        setSelectedCandidates,
      }}
    >
      {children}
    </RosterTableContext.Provider>
  );
}

export function useRosterTableContext() {
  const context = useContext(RosterTableContext);
  if (context === undefined) {
    throw new Error(
      "useRosterContext must be used within a RosterContextProvider"
    );
  }
  return context;
}
