import { Dispatch, SetStateAction } from "react";
import { Stack, Typography, Autocomplete, Button } from "@mui/joy";
import { CommonConsultant } from "../../../types/common";

interface InviteCollaboratorsProps {
  filteredConsultants: CommonConsultant[];
  selectedCollaborators: CommonConsultant[];
  setSelectedCollaborators: Dispatch<SetStateAction<CommonConsultant[]>>;
  handleConfirmInvite: () => void;
  invitationError: string | null;
}

const InviteCollaborators = ({
  filteredConsultants,
  selectedCollaborators,
  setSelectedCollaborators,
  handleConfirmInvite,
  invitationError,
}: InviteCollaboratorsProps) => {
  return (
    <Stack spacing={2}>
      <Typography level="title-md">Invite collaborators</Typography>
      <Stack spacing={2}>
        <Autocomplete
          multiple
          id="collaborators-invite"
          options={filteredConsultants}
          getOptionLabel={(option) => option.email}
          value={selectedCollaborators}
          onChange={(_event, newValue) => setSelectedCollaborators(newValue)}
        />
        <Button
          disabled={selectedCollaborators.length === 0}
          onClick={handleConfirmInvite}
        >
          Invite
        </Button>
        {invitationError && <Typography>{invitationError}</Typography>}
      </Stack>
    </Stack>
  );
};

export default InviteCollaborators;
