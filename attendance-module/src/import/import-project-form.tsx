import { useState, useEffect } from "react";
import axios from "axios";
import { CandidateHolder, Location, ProjectData } from "../../types";
import ProjectDetailsSection from "./project-details-section";
import CandidateHolderList from "./candidate-holder-list";

interface ImportProjectFormProps {
  projectId: string | null;
}

const ImportProjectForm = ({ projectId }: ImportProjectFormProps) => {
  const [projectData, setProjectData] = useState<ProjectData>({
    projectId: undefined,
    projectTitle: "",
    email: "",
    clientCompanyName: "",
    employedBy: undefined,
    startDate: "",
    endDate: "",
    candidates: [],
  });
  if (projectId) {
    useEffect(() => {
      const fetchProjectData = async () => {
        if (projectId) {
          try {
            const response = await axios.get(
              `http://localhost:3000/bridge/project/${projectId}`,
              { withCredentials: true }
            );
            setProjectData(response.data);
          } catch (error) {
            console.error("Error while fetching project data", error);
          }
        }
      };

      fetchProjectData();
    }, [projectId]);
  }
  
  const [locations, setLocations] = useState<Location[]>([]);

  const [allConsultants, setAllConsultants] = useState<CandidateHolder[]>([]);
  useEffect(() => {
    const fetchConsultants = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/admin/consultants",
          { withCredentials: true }
        );
        setAllConsultants(response.data);
      } catch (error) {
        console.error("Error while fetching consultants", error);
      }
    };

    fetchConsultants();
  }, []);

  const [candidateHolders, setCandidateHolders] = useState<CandidateHolder[]>(
    []
  );
  useEffect(() => {
    if (projectData.projectId) {
      setCandidateHolders(
        [...new Set(projectData.candidates.map((c) => c.candidateHolder))].map(
          (email) => allConsultants.find((c) => c.email === email)!
        )
      );
    }
  }, [projectData]);

  const handleAddCandidateHolder = (email: string) => {
    const newHolder = allConsultants.find((c) => c.email === email);
    setCandidateHolders([...candidateHolders, newHolder!]);
  };

  if (projectId && !projectData.projectId) {
    // unauthorized user or invalid project id
    return <div>Invalid project ID</div>;
  }

  return (
    <div>
      <ProjectDetailsSection
        projectData={projectData}
        setProjectData={setProjectData}
        locations={locations}
        setLocations={setLocations}
      />

      <CandidateHolderList
        candidateList={projectData?.candidates || []}
        availableConsultants={allConsultants.filter(
          (c) => c.email !== projectData?.email // exclude client handler
        )}
        // availableConsultants={allConsultants}
        candidateHolders={candidateHolders}
        handleAddCandidateHolder={handleAddCandidateHolder}
      />

      <br />
      <button>TODO: Save project</button>
    </div>
  );
};

export default ImportProjectForm;
