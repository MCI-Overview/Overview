/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";
import { GetProjectDataResponse } from "../types/common";
import axios from "axios";

const ProjectContext = createContext<{
  project: GetProjectDataResponse | null;
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
  const [project, setProject] = useState<GetProjectDataResponse | null>(null);

  function updateProject(projectCuid?: string | undefined) {
    const previousProjectCuid = project?.cuid;

    if (projectCuid) {
      setProject(null);
    }

    if (!projectCuid && !previousProjectCuid) return;

    axios
      .get(`/api/admin/project/${projectCuid || previousProjectCuid}`)
      .then((res) => {
        setProject(convertToDateType(res.data));
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
      "useProjectContext must be used within a ProjectContextProvider"
    );
  }
  return context;
}

function convertToDateType(
  response: GetProjectDataResponse
): GetProjectDataResponse {
  return {
    ...response,
    candidates: response.candidates.map((candidate) => ({
      ...candidate,
      dateOfBirth: new Date(candidate.dateOfBirth),
      startDate: new Date(candidate.startDate),
      endDate: new Date(candidate.endDate),
    })),
  };
}
