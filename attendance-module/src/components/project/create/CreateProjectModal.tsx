import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CommonConsultant, CommonLocation } from "../../../types/common";
import { CreateProjectData } from "../../../types";
import ProjectDetailsSection from "./DetailsSection";
import ProjectLocationsSection from "./LocationsSection";
import ProjectCandidateHoldersSection from "./CandidateHoldersSection";

import {
  Box,
  Button,
  Divider,
  Modal,
  ModalClose,
  ModalDialog,
  ModalOverflow,
} from "@mui/joy";

// Define the interface for the error response data
interface ErrorResponseData {
  message: string;
}

interface CreateProjectModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const CreateProjectModal = ({ isOpen, setIsOpen }: CreateProjectModalProps) => {
  const [projectDetails, setProjectDetails] = useState<CreateProjectData>({
    name: null,
    clientUEN: null,
    clientName: null,
    employmentBy: null,
    startDate: null,
    endDate: null,
    noticePeriodDuration: null,
    noticePeriodUnit: null,
  });
  const [locations, setLocations] = useState<CommonLocation[]>([]);
  const [candidateHolders, setCandidateHolders] = useState<CommonConsultant[]>(
    []
  );

  const navigate = useNavigate();

  const handleSaveProject = async () => {
    const body = {
      ...projectDetails,
      locations,
      candidateHolders: candidateHolders.map((holder) => holder.cuid),
    };

    try {
      const { status, data } = await axios.post("/api/admin/project", body);
      if (status === 200) {
        navigate(`/admin/project/${data.projectCuid}`);
        return toast.success(data.message);
      }

      toast.error(data.message);
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponseData>;
      toast.error(
        axiosError.response?.data.message ||
          "Error while creating project. Please try again later."
      );
    }
  };

  return (
    <Modal open={isOpen} onClose={() => setIsOpen(false)}>
      <ModalOverflow sx={{ height: "100vh", width: "100vw" }}>
        <ModalDialog sx={{ width: { xs: "100%", sm: "600px" } }}>
          <ModalClose onClick={() => setIsOpen(false)} />

          <ProjectDetailsSection
            projectDetails={projectDetails}
            setProjectDetails={setProjectDetails}
          />

          <Divider />

          <ProjectLocationsSection
            locations={locations}
            setLocations={setLocations}
          />

          <Divider />

          <ProjectCandidateHoldersSection
            candidateHolders={candidateHolders}
            setCandidateHolders={setCandidateHolders}
          />

          <Divider />

          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Button size="sm" variant="solid" onClick={handleSaveProject}>
              Create Project
            </Button>
          </Box>
        </ModalDialog>
      </ModalOverflow>
    </Modal>
  );
};

export default CreateProjectModal;
