/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";
import { GetProjectDataResponse, Project } from "../types/common";
import axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const ProjectContext = createContext<{
  project: Project | null;
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
  const [project, setProject] = useState<Project | null>(null);

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
        setProject({
          ...data,
          candidates: data.candidates.map((candidate) => ({
            ...candidate,
            dateOfBirth: dayjs(candidate.dateOfBirth),
            startDate: dayjs(candidate.startDate),
            endDate: dayjs(candidate.endDate),
          })),
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
        });

        console.log(project);
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
      "useProjectContext must be used within a ProjectContextProvider",
    );
  }
  return context;
}
