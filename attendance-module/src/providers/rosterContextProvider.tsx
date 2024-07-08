/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { GetRosterResponse } from "../types/common";
import axios from "axios";
import dayjs from "dayjs";
import { useProjectContext } from "./projectContextProvider";
import { RosterDisplayProps } from "../components/project/roster/RosterDisplay";

type MappedRosterResponse = {
  [cuid: string]: {
    name: string;
    startDate: dayjs.Dayjs;
    endDate: dayjs.Dayjs;
    roster: RosterDisplayProps["data"][];
  };
};

const RosterContext = createContext<{
  rosterData: MappedRosterResponse | null;
  hoverCuid: string | null | undefined;
  draggingCuid: string | null;
  weekOffset: number;
  dateRangeStart: dayjs.Dayjs;
  dateRangeEnd: dayjs.Dayjs;
  setDraggingCuid: (cuid: string | null) => void;
  setHoverCuid: (cuid: string | null) => void;
  setPreviewData: (data: RosterDisplayProps["data"] | null) => void;
  setWeekOffset: (offset: number) => void;
  updateRosterData: () => void;
}>({
  rosterData: null,
  hoverCuid: null,
  draggingCuid: null,
  weekOffset: 0,
  dateRangeStart: dayjs(),
  dateRangeEnd: dayjs(),
  setWeekOffset: () => {},
  setPreviewData: () => {},
  setDraggingCuid: () => {},
  setHoverCuid: () => {},
  updateRosterData: () => {},
});

export function RosterContextProvider({ children }: { children: ReactNode }) {
  const { project } = useProjectContext();
  const [rosterData, setRosterData] = useState<MappedRosterResponse | null>(
    null
  );
  const [previewData, setPreviewData] = useState<
    RosterDisplayProps["data"] | null
  >(null);
  const [hoverCuid, setHoverCuid] = useState<string | null>(null);
  const [draggingCuid, setDraggingCuid] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState<number>(
    Math.floor(
      dayjs().diff(project?.startDate.startOf("isoWeek"), "weeks") || 0
    )
  );

  const updateRosterData = useCallback(() => {
    if (!weekOffset || !project) return;

    axios
      .get(`/api/admin/project/${project?.cuid}/roster`, {
        params: {
          startDate: dateRangeStart.subtract(1, "day").toISOString(),
          endDate: dateRangeEnd.add(1, "day").toISOString(),
        },
      })
      .then((res) => {
        const data: GetRosterResponse = res.data;
        const mappedData = data.reduce<MappedRosterResponse>(
          (acc, candidate) => {
            acc[candidate.cuid] = {
              name: candidate.name,
              startDate: dayjs(candidate.startDate),
              endDate: dayjs(candidate.endDate),
              roster: candidate.shifts.map((shift) => ({
                rosterCuid: shift.rosterCuid,
                shiftCuid: shift.shiftCuid,
                consultantCuid: shift.consultantCuid,
                candidateCuid: candidate.cuid,
                projectCuid: shift.projectCuid,
                type: shift.shiftType,
                status: shift.status,
                leave: shift.leave,
                startTime: dayjs(shift.shiftStartTime),
                endTime: dayjs(shift.shiftEndTime),
                originalStartTime: dayjs(shift.shiftStartTime),
                originalEndTime: dayjs(shift.shiftEndTime),
              })),
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

  if (!project) {
    return null;
  }

  const baseDay = project.startDate.startOf("isoWeek");
  const dateRangeStart = baseDay.add(weekOffset, "weeks");
  const dateRangeEnd = dateRangeStart.endOf("isoWeek");

  const mergedData = Object.keys(rosterData || {}).reduce<MappedRosterResponse>(
    (acc, cuid) => {
      if (!rosterData) return acc;

      acc[cuid] = {
        ...rosterData[cuid],
        roster:
          previewData && previewData.candidateCuid === cuid
            ? [...rosterData[cuid].roster, previewData]
            : rosterData[cuid].roster,
      };
      return acc;
    },
    {}
  );
  return (
    <RosterContext.Provider
      value={{
        draggingCuid,
        dateRangeStart,
        dateRangeEnd,
        hoverCuid,
        rosterData: mergedData,
        weekOffset,
        setDraggingCuid,
        setHoverCuid,
        setPreviewData,
        setWeekOffset,
        updateRosterData,
      }}
    >
      {children}
    </RosterContext.Provider>
  );
}

export function useRosterContext() {
  const context = useContext(RosterContext);
  if (context === undefined) {
    throw new Error(
      "useRosterContext must be used within a RosterContextProvider"
    );
  }
  return context;
}
