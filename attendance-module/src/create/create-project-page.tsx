import { useState, useEffect } from "react";
import axios from "axios";
import { CandidateHolder, Location, ProjectData } from "../types";
import ProjectDetailsSection from "../create/project-details-section";
import CandidateHolderList from "../create/candidate-holder-list";

const CreateProjectPage = () => {
  const [projectData, setProjectData] = useState<ProjectData>({
    projectTitle: "",
    email: "",
    clientCompanyUEN: "",
    clientCompanyName: "",
    employedBy: undefined,
    startDate: "",
    endDate: "",
  });

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
  const handleAddCandidateHolder = (email: string) => {
    const newHolder = allConsultants.find((c) => c.email === email);
    setCandidateHolders([...candidateHolders, newHolder!]);
  };

  const handleSaveProject = async () => {
    const body = {
      name: projectData.projectTitle,
      clientUEN: projectData.clientCompanyUEN,
      clientName: projectData.clientCompanyName,
      employmentBy: projectData.employedBy,
      locations: JSON.stringify(locations),
      startDate: projectData.startDate,
      endDate: projectData.endDate,
      candidateHolders: candidateHolders.map((holder) => holder.email),
    };

    console.log("Saving project with body", body);

    try {
      await axios.post("http://localhost:3000/api/admin/project/create",
        body,
        { withCredentials: true, }
      );
      console.log("Project saved successfully");
    } catch (error) {
      // TODO: Handle failed save
      console.error("Error while saving project", error);
    }
  };

  return (
    <div>
      <ProjectDetailsSection
        projectData={projectData}
        setProjectData={setProjectData}
        locations={locations}
        setLocations={setLocations}
      />

      <CandidateHolderList
        candidateHolders={candidateHolders}
        handleAddCandidateHolder={handleAddCandidateHolder}
        availableConsultants={allConsultants.filter(
          (c) => c.email !== projectData?.email // exclude client handler
        )}
      />

      <br />
      <button onClick={handleSaveProject}>Save project</button>
    </div>
  );
};

export default CreateProjectPage;
