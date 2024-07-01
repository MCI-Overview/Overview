/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";
import {
  GetProjectDataResponse,
  CommonProject,
  CommonShift,
} from "../types/common";
import axios from "axios";
import dayjs from "dayjs";

const ProjectContext = createContext<{
  project: CommonProject | null;
  updateProject: (projectCuid?: string | undefined) => void;
}>({
  project: null,
  updateProject: () => {},
});

export function ProjectContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [project, setProject] = useState<CommonProject | null>(null);

  function updateProject(projectCuid?: string | undefined) {
    const previousProjectCuid = project?.cuid;

    if (projectCuid) {
      setProject(null);
    }

    if (!projectCuid && !previousProjectCuid) return;

    axios
      .get(`/api/admin/project/${projectCuid || previousProjectCuid}`)
      .then((res) => {
        const data = res.data as GetProjectDataResponse;
        const projectData: CommonProject = {
          ...data,
          candidates: data.candidates,
          shifts: data.shifts.map((shift) => ({
            ...shift,
            startTime: dayjs(shift.startTime),
            endTime: dayjs(shift.endTime),
            halfDayStartTime: shift.halfDayStartTime
              ? dayjs(shift.halfDayStartTime)
              : null,
            halfDayEndTime: shift.halfDayEndTime
              ? dayjs(shift.halfDayEndTime)
              : null,
          })),
          startDate: dayjs(data.startDate),
          endDate: dayjs(data.endDate),
          createdAt: dayjs(data.createdAt),
          shiftDict: {},
        };
        projectData["shiftDict"] = projectData.shifts.reduce((acc, shift) => {
          acc[shift.cuid] = shift;
          return acc;
        }, {} as Record<string, CommonShift>);
        setProject(projectData);
      });
  }

  return (
    <ProjectContext.Provider value={{ project, updateProject }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjectContext() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error(
      "useProjectContext must be used within a ProjectContextProvider"
    );
  }
  return context;
}
