import axios from "axios";
import toast from "react-hot-toast";
import { useState } from "react";
import { CommonConsultant } from "../../../types/common";
import { useProjectContext } from "../../../providers/projectContextProvider";

import { Stack, Typography, Autocomplete, Button } from "@mui/joy";
interface InviteCollaboratorsProps {
  allConsultants: CommonConsultant[];
}

const InviteCollaborators = ({ allConsultants }: InviteCollaboratorsProps) => {
  const [newConsultants, setNewConsultants] = useState<CommonConsultant[]>([]);

  const { project, updateProject } = useProjectContext();
  if (!project) return null;

  // exclude consultants that are already in the project
  const filteredConsultants = allConsultants.filter(
    (consultant) =>
      !project.consultants.find((c) => c.email === consultant.email)
  );

  const handleConfirmInvite = async () => {
    try {
      await Promise.all(
        newConsultants.map(async (newConsultant) => {
          const consultant = allConsultants.find(
            (c) => c.email === newConsultant.email
          );
          if (!consultant) throw new Error("Consultant not found");

          await axios.post(`/api/admin/project/${project.cuid}/manage`, {
            consultantCuid: consultant.cuid,
            role: "CANDIDATE_HOLDER",
          });
        })
      );

      setNewConsultants([]);
      updateProject();
    } catch (error) {
      console.error(error);
      toast.error("Failed to invite collaborator.");
    }
  };

  return (
    <Stack spacing={2}>
      <Typography level="title-md">Invite collaborators</Typography>
      <Stack spacing={2}>
        <Autocomplete
          multiple
          id="collaborators-invite"
          options={filteredConsultants}
          getOptionLabel={(option) => option.email}
          value={newConsultants}
          onChange={(_event, newValue) => setNewConsultants(newValue)}
        />
        <Button
          disabled={newConsultants.length === 0}
          onClick={handleConfirmInvite}
        >
          Invite
        </Button>
      </Stack>
    </Stack>
  );
};

export default InviteCollaborators;
