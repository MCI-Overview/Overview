import axios from "axios";
import { useState, useEffect } from "react";
import { useUserContext } from "../../../providers/userContextProvider";
import { useProjectContext } from "../../../providers/projectContextProvider";
import { CommonCandidate, CommonConsultant } from "../../../types/common";
import { Assign } from "../../../types";
import RemoveConsultantModal from "./RemoveConsultantModal";
import InviteCollaborators from "./InviteCollaborators";
import CollaboratorsTable from "./CollaboratorsTable";

import {
  Box,
  Divider,
  Stack,
  Typography,
  Card,
  CardOverflow,
  CardActions,
} from "@mui/joy";

const ManageProjectAccess = () => {
  const [consultants, setConsultants] = useState<CommonConsultant[]>([]);
  const [selectedCollaborators, setSelectedCollaborators] = useState<
    CommonConsultant[]
  >([]);
  const [rowSelections, setRowSelections] = useState<Assign[]>([]);
  const [emailConfirmation, setEmailConfirmation] = useState<string>("");
  const [invitationError, setInvitationError] = useState<string | null>(null);
  const [openRemoveModal, setOpenRemoveModal] = useState(false);
  const [candidatesToReassign, setCandidatesToReassign] = useState<
    CommonCandidate[]
  >([]);
  const [consultantToRemove, setConsultantToRemove] =
    useState<CommonConsultant | null>(null);

  const { project, updateProject } = useProjectContext();
  const collaborators = project?.consultants ?? [];
  const candidates = project?.candidates ?? [];
  const { user } = useUserContext();
  const currentUserCuid = user?.cuid;

  // Determine the current user's role based on their cuid
  const currentUserRole = collaborators.find(
    (collaborator) => collaborator.cuid === currentUserCuid
  )?.role;

  const filteredConsultants = consultants.filter(
    (consultant) => !collaborators.some((row) => row.cuid === consultant.cuid)
  );

  useEffect(() => {
    const fetchConsultants = async () => {
      try {
        const { data } = await axios.get("/api/admin/consultants");
        setConsultants(data);
      } catch (error) {
        console.error("Failed to fetch consultants", error);
      }
    };
    fetchConsultants();
  }, []);

  const handleApplyToAll = (value: CommonConsultant | null) => {
    const consultantCuid = value ? value.cuid : null;
    setRowSelections(
      candidatesToReassign.map((candidate) => ({
        consultantCuid,
        candidateCuid: candidate.cuid,
      }))
    );
  };

  const handleRowSelectionChange = (
    index: number,
    value: CommonConsultant | null
  ) => {
    const updatedSelections = [...rowSelections];
    updatedSelections[index] = {
      consultantCuid: value?.cuid ?? null,
      candidateCuid: candidatesToReassign[index].cuid,
    };
    setRowSelections(updatedSelections);
  };

  const handleRemoveClick = (cuid: string) => {
    const consultant = collaborators.find((collab) => collab.cuid === cuid);
    if (consultant) {
      const candidatesOfConsultant = candidates.filter(
        (candidate) => candidate.consultantCuid === cuid
      );
      setConsultantToRemove(consultant);
      setCandidatesToReassign(candidatesOfConsultant);
      setRowSelections(
        candidatesOfConsultant.map((candidate) => ({
          consultantCuid: null,
          candidateCuid: candidate.cuid,
        }))
      );
      setRowSelections(
        candidatesOfConsultant.map((candidate) => ({
          consultantCuid: null,
          candidateCuid: candidate.cuid,
        }))
      );
      setOpenRemoveModal(true);
    }
  };

  const handleCloseRemoveModal = () => {
    setOpenRemoveModal(false);
    setRowSelections([]);
    setEmailConfirmation("");
    setCandidatesToReassign([]);
    setConsultantToRemove(null);
  };

  const handleConfirmInvite = async () => {
    try {
      const projectCuid = project?.cuid;
      if (!projectCuid) throw new Error("Project ID is missing");
      await Promise.all(
        selectedCollaborators.map(async (collab) => {
          const consultant = consultants.find((c) => c.email === collab.email);
          if (!consultant) throw new Error("Consultant not found");

          await axios.post(`/api/admin/project/${projectCuid}/manage/add`, {
            consultantCuid: consultant.cuid,
          });

          return consultant;
        })
      );
      updateProject();
    } catch (error) {
      setInvitationError("Failed to invite collaborator.");
    }
  };

  const handleConfirmRemove = async () => {
    if (emailConfirmation === "" || !consultantToRemove) return;
    try {
      const projectCuid = project?.cuid;
      if (!projectCuid) throw new Error("Project ID is missing");

      const reassignments = rowSelections.filter(
        (rowSelection) => rowSelection.consultantCuid !== null
      );

      await axios.post(`/api/admin/project/${projectCuid}/manage/remove`, {
        consultantCuid: consultantToRemove.cuid,
        reassign: reassignments,
      });

      updateProject();
      handleCloseRemoveModal();
    } catch (error) {
      console.error("Failed to remove consultant", error);
    }
  };

  const availableCollaborators = collaborators.filter(
    (consultant) => consultant.cuid !== consultantToRemove?.cuid
  );
  const allCandidatesReassigned = rowSelections.every(
    (selection) => selection.consultantCuid !== null
  );

  return (
    <>
      <RemoveConsultantModal
        open={openRemoveModal}
        onClose={handleCloseRemoveModal}
        consultantToRemove={consultantToRemove}
        candidatesToReassign={candidatesToReassign}
        rowSelections={rowSelections}
        availableCollaborators={availableCollaborators}
        handleApplyToAll={handleApplyToAll}
        handleRowSelectionChange={handleRowSelectionChange}
        emailConfirmation={emailConfirmation}
        setEmailConfirmation={setEmailConfirmation}
        handleConfirmRemove={handleConfirmRemove}
        allCandidatesReassigned={allCandidatesReassigned}
      />
      <Stack
        spacing={4}
        sx={{
          display: "flex",
          mx: "auto",
        }}
      >
        <Card>
          <Box sx={{ mb: 1 }}>
            <Typography level="title-md">Project collaborators</Typography>
            <Typography level="body-sm">
              Only collaborators are allowed access to this project.{" "}
            </Typography>
          </Box>
          <Divider />
          <Stack spacing={2} sx={{ my: 1 }}>
            {currentUserRole === "CLIENT_HOLDER" && (
              <>
                <InviteCollaborators
                  filteredConsultants={filteredConsultants}
                  selectedCollaborators={selectedCollaborators}
                  setSelectedCollaborators={setSelectedCollaborators}
                  handleConfirmInvite={handleConfirmInvite}
                  invitationError={invitationError}
                />
                <Divider />
              </>
            )}
            <CollaboratorsTable
              collaborators={collaborators}
              currentUserRole={currentUserRole}
              handleRemoveClick={handleRemoveClick}
            />
          </Stack>
          <CardOverflow sx={{ borderTop: "1px solid", borderColor: "divider" }}>
            <CardActions sx={{ alignSelf: "flex-start", pt: 2 }}>
              <Typography level="body-sm">
                Only client holders can invite and remove collaborators.
              </Typography>
            </CardActions>
          </CardOverflow>
        </Card>
      </Stack>
    </>
  );
};

export default ManageProjectAccess;
