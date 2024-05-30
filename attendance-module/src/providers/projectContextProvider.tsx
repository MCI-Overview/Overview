/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";
import { Project } from "../types";

const ProjectContext = createContext<{
  project: Project | null;
  setProject: React.Dispatch<React.SetStateAction<Project | null>>;
}>({
  project: null,
  setProject: () => {},
});

export function ProjectContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [project, setProject] = useState<Project | null>(null);

  return (
    <ProjectContext.Provider value={{ project, setProject }}>
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
