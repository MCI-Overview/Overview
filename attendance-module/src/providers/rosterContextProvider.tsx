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
    employeeId: string;
    restDay: string;
    startDate: dayjs.Dayjs;
    endDate: dayjs.Dayjs;
    roster: {
      [date: string]: RosterDisplayProps["data"][];
    };
    rosterLength: number;
    newRoster: {
      [date: string]: RosterDisplayProps["data"][];
    };
    possibleDates?: dayjs.Dayjs[];
  };
};

const RosterTableContext = createContext<{
  selectedDates: dayjs.Dayjs[];
  sortOrder:
    | "name-asc"
    | "name-desc"
    | "employeeId-asc"
    | "employeeId-desc"
    | "unassign"
    | "assign";
  weekOffset: number;
  dateRangeEnd: dayjs.Dayjs;
  isPerformanceMode: boolean;
  dateRangeStart: dayjs.Dayjs;
  selectedCandidates: string[];
  setIsPerformanceMode: (isPerformanceMode: boolean) => void;
  setSelectedDates: (selectedDates: dayjs.Dayjs[]) => void;
  setSortOrder: (
    order:
      | "name-asc"
      | "name-desc"
      | "employeeId-asc"
      | "employeeId-desc"
      | "unassign"
      | "assign"
  ) => void;
  setWeekOffset: (offset: number) => void;
  setSelectedCandidates: (cuids: string[]) => void;
}>({
  selectedDates: [],
  weekOffset: 0,
  dateRangeEnd: dayjs(),
  dateRangeStart: dayjs(),
  selectedCandidates: [],
  sortOrder: "employeeId-asc",
  isPerformanceMode: true,
  setIsPerformanceMode: () => {},
  setSelectedDates: () => {},
  setSortOrder: () => {},
  setWeekOffset: () => {},
  setSelectedCandidates: () => {},
});

const RosterDraggingContext = createContext<{
  draggingCuid: string | null;
  hoverDate: dayjs.Dayjs | null;
  hoverRosterCuid: string | null | undefined;
  hoverCandidateCuid: string | null;
  setDraggingCuid: (cuid: string | null) => void;
  setHoverDate: (date: dayjs.Dayjs | null) => void;
  setHoverRosterCuid: (cuid: string | null) => void;
  setHoverCandidateCuid: (cuid: string | null) => void;
}>({
  draggingCuid: null,
  hoverDate: dayjs(),
  hoverRosterCuid: null,
  hoverCandidateCuid: null,
  setDraggingCuid: () => {},
  setHoverDate: () => {},
  setHoverRosterCuid: () => {},
  setHoverCandidateCuid: () => {},
});

const RosterItemContext = createContext<{
  item: DraggableRosterProps | DraggableRosterChipProps | null;
  itemType: "shift" | "roster" | null;
  setItem: (
    item: DraggableRosterProps | DraggableRosterChipProps | null
  ) => void;
  setItemType: (type: "shift" | "roster" | null) => void;
}>({
  item: null,
  itemType: null,
  setItem: () => {},
  setItemType: () => {},
});

const RosterDataContext = createContext<{
  rosterData: MappedRosterResponse | null;
  sortedCandidates: string[];
  updateRosterData: () => void;
  setSortedCandidates: (cuids: string[]) => void;
}>({
  rosterData: null,
  sortedCandidates: [],
  updateRosterData: () => {},
  setSortedCandidates: () => {},
});

function RosterTableContextProvider({ children }: { children: ReactNode }) {
  const { project } = useProjectContext();
  const [weekOffset, setWeekOffset] = useState<number>(
    Math.floor(dayjs().diff(project?.startDate.startOf("isoWeek"), "weeks")) ||
      0
  );

  const [isPerformanceMode, setIsPerformanceMode] = useState<boolean>(true);

  const [selectedDates, setSelectedDates] = useState<dayjs.Dayjs[]>([]);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<
    | "name-asc"
    | "name-desc"
    | "employeeId-asc"
    | "employeeId-desc"
    | "unassign"
    | "assign"
  >("employeeId-asc");

  const baseDay = project?.startDate.startOf("isoWeek");
  const dateRangeStart = baseDay?.add(weekOffset, "weeks");
  const dateRangeEnd = dateRangeStart?.endOf("isoWeek");

  if (!dateRangeStart || !dateRangeEnd) {
    return null;
  }

  return (
    <RosterTableContext.Provider
      value={{
        isPerformanceMode,
        selectedDates,
        sortOrder,
        weekOffset,
        dateRangeEnd,
        dateRangeStart,
        selectedCandidates,
        setIsPerformanceMode,
        setSelectedDates,
        setSortOrder,
        setWeekOffset,
        setSelectedCandidates,
      }}
    >
      {children}
    </RosterTableContext.Provider>
  );
}

function RosterItemContextProvider({ children }: { children: ReactNode }) {
  const [item, setItem] = useState<
    DraggableRosterProps | DraggableRosterChipProps | null
  >(null);
  const [itemType, setItemType] = useState<"shift" | "roster" | null>(null);

  return (
    <RosterItemContext.Provider
      value={{ item, setItem, itemType, setItemType }}
    >
      {children}
    </RosterItemContext.Provider>
  );
}

function RosterDraggingContextProvider({ children }: { children: ReactNode }) {
  const [hoverDate, setHoverDate] = useState<dayjs.Dayjs | null>(null);
  const [draggingCuid, setDraggingCuid] = useState<string | null>(null);
  const [hoverRosterCuid, setHoverRosterCuid] = useState<string | null>(null);
  const [hoverCandidateCuid, setHoverCandidateCuid] = useState<string | null>(
    null
  );
  return (
    <RosterDraggingContext.Provider
      value={{
        hoverDate,
        setHoverDate,
        draggingCuid,
        setDraggingCuid,
        hoverRosterCuid,
        setHoverRosterCuid,
        hoverCandidateCuid,
        setHoverCandidateCuid,
      }}
    >
      {children}
    </RosterDraggingContext.Provider>
  );
}

function RosterDataContextProvider({ children }: { children: ReactNode }) {
  const { project } = useProjectContext();
  const { item, itemType } = useRosterItemContext();
  const {
    selectedDates,
    dateRangeStart,
    dateRangeEnd,
    weekOffset,
    sortOrder,
    isPerformanceMode,
    selectedCandidates,
    setSelectedCandidates,
  } = useRosterTableContext();
  const { hoverCandidateCuid, hoverDate } = useRosterDraggingContext();

  const [sortedCandidates, setSortedCandidates] = useState<string[]>([]);
  const [rosterData, setRosterData] = useState<MappedRosterResponse | null>(
    null
  );
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
              employeeId: candidate.employeeId,
              restDay: candidate.restDay,
              startDate: dayjs(candidate.startDate),
              endDate: dayjs(candidate.endDate),
              roster: candidate.rosters.reduce((acc, roster) => {
                const date = dayjs(roster.startTime).format("DD-MM-YYYY");

                if (!acc[date]) {
                  acc[date] = [];
                }

                acc[date].push({
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
                });

                return acc;
              }, {} as Record<string, RosterDisplayProps["data"][]>),
              newRoster: {},
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

  useEffect(() => {
    if (!rosterData) return;

    const candidatesList = Object.keys(rosterData).filter(
      (c) => !selectedCandidates.includes(c)
    );

    if (sortOrder === "name-asc") {
      setSortedCandidates([
        ...selectedCandidates,
        ...candidatesList.sort((a, b) =>
          rosterData[a].name.localeCompare(rosterData[b].name)
        ),
      ]);
    }

    if (sortOrder === "name-desc") {
      setSortedCandidates([
        ...selectedCandidates,
        ...candidatesList.sort((a, b) =>
          rosterData[b].name.localeCompare(rosterData[a].name)
        ),
      ]);
    }

    if (sortOrder === "employeeId-asc") {
      setSortedCandidates([
        ...selectedCandidates,
        ...candidatesList.sort((a, b) =>
          rosterData[a].employeeId.localeCompare(rosterData[b].employeeId)
        ),
      ]);
    }

    if (sortOrder === "employeeId-desc") {
      setSortedCandidates([
        ...selectedCandidates,
        ...candidatesList.sort((a, b) =>
          rosterData[b].employeeId.localeCompare(rosterData[a].employeeId)
        ),
      ]);
    }

    if (sortOrder === "unassign") {
      setSortedCandidates([
        ...selectedCandidates,
        ...candidatesList.sort((a, b) => {
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
        }),
      ]);
    }

    if (sortOrder === "assign") {
      setSortedCandidates([
        ...selectedCandidates,
        ...candidatesList.sort((a, b) => {
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
        }),
      ]);
    }
  }, [rosterData, selectedCandidates, sortOrder]);

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
            const isHoveredCandidate =
              hoverCandidateCuid && hoverCandidateCuid === cuid;
            const isHoveredDate = hoverDate?.isSame(date, "day");

            const isSelectedCandidate =
              itemType === "shift" && selectedCandidates.includes(cuid);
            const isSelectedDate =
              itemType === "shift" &&
              selectedDates.some((d) => d.isSame(date, "day"));

            const isCandidate =
              (selectedCandidates.length === 0 && isHoveredCandidate) ||
              isSelectedCandidate;
            const isDate =
              (selectedDates.length === 0 && isHoveredDate) || isSelectedDate;

            if (isPerformanceMode && itemType === "roster") {
              // Skip if cuid is not hovered candidate
              if (hoverCandidateCuid && !isHoveredCandidate) {
                return acc;
              }

              // Skip if date is not hovered date
              if (hoverDate && !isHoveredDate) {
                return acc;
              }
            }

            if (isPerformanceMode && itemType === "shift") {
              // Skip if cuid is not hovered candidate or selected
              if (
                !(
                  (selectedCandidates.length === 0 && isHoveredCandidate) ||
                  isSelectedCandidate
                )
              ) {
                return acc;
              }

              // Skip if date is not hovered date or selected
              if (
                !(
                  (selectedDates.length === 0 && hoverDate && isHoveredDate) ||
                  isSelectedDate
                )
              ) {
                return acc;
              }
            }

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

            const candidateRoster = rosterData[cuid].roster;

            const currentDate = itemStartTime.format("DD-MM-YYYY");
            const previousDate = itemStartTime
              .subtract(1, "day")
              .format("DD-MM-YYYY");
            const nextDate = itemStartTime.add(1, "day").format("DD-MM-YYYY");

            const possibleOverlappingRosters = [
              ...(candidateRoster[currentDate] || []),
              ...(candidateRoster[previousDate] || []),
              ...(candidateRoster[nextDate] || []),
            ];

            const hasNoOverlap = possibleOverlappingRosters
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
                if (isCandidate && isDate) {
                  acc[0][currentDate] = [
                    ...(acc[0][currentDate] || []),
                    {
                      ...item,
                      isPartial: false,
                      originalStartTime: itemStartTime,
                      originalEndTime: itemEndTime,
                      startTime: itemStartTime,
                      endTime: itemEndTime,
                      state: "PREVIEW",
                    },
                  ];
                }
              }

              if (itemType === "roster") {
                if (isCandidate && isDate) {
                  acc[0][currentDate] = [
                    ...(acc[0][currentDate] || []),
                    {
                      ...item,
                      isPartial: false,
                      originalStartTime: itemStartTime,
                      originalEndTime: itemEndTime,
                      startTime: itemStartTime,
                      endTime: itemEndTime,
                      state: "PREVIEW",
                    },
                  ];
                }
              }

              return acc;
            }

            return acc;
          },
          [{}, []] as [
            Record<string, RosterDisplayProps["data"][]>,
            dayjs.Dayjs[]
          ]
        );

      acc[cuid] = {
        ...rosterData[cuid],
        possibleDates,
        newRoster,
      };

      return acc;
    }, {});
  }, [
    rosterData,
    dateRangeEnd,
    dateRangeStart,
    hoverCandidateCuid,
    hoverDate,
    itemType,
    selectedCandidates,
    selectedDates,
    isPerformanceMode,
    item,
  ]);

  return (
    <RosterDataContext.Provider
      value={{
        rosterData: memomizedMergedData,
        updateRosterData,
        sortedCandidates,
        setSortedCandidates,
      }}
    >
      {children}
    </RosterDataContext.Provider>
  );
}

export function RosterContextProvider({ children }: { children: ReactNode }) {
  return (
    <RosterTableContextProvider>
      <RosterDraggingContextProvider>
        <RosterItemContextProvider>
          <RosterDataContextProvider>{children}</RosterDataContextProvider>
        </RosterItemContextProvider>
      </RosterDraggingContextProvider>
    </RosterTableContextProvider>
  );
}

export function useRosterTableContext() {
  const context = useContext(RosterTableContext);
  if (context === undefined) {
    throw new Error(
      "useRosterTableContext must be used within a RosterTableContextProvider"
    );
  }
  return context;
}

export function useRosterItemContext() {
  const context = useContext(RosterItemContext);
  if (context === undefined) {
    throw new Error(
      "useRosterItemContext must be used within a RosterItemContextProvider"
    );
  }
  return context;
}

export function useRosterDataContext() {
  const context = useContext(RosterDataContext);
  if (context === undefined) {
    throw new Error(
      "useRosterDataContext must be used within a RosterDataContextProvider"
    );
  }
  return context;
}

export function useRosterDraggingContext() {
  const context = useContext(RosterDraggingContext);
  if (context === undefined) {
    throw new Error(
      "useRosterDraggingContext must be used within a RosterDraggingContextProvider"
    );
  }
  return context;
}
