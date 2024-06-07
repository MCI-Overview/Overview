import React from 'react';
import { Stack, Typography, Autocomplete, Button } from "@mui/joy";
import { Consultant } from "../../../types/common";

interface InviteCollaboratorsProps {
    filteredConsultants: Consultant[];
    selectedCollaborators: Consultant[];
    setSelectedCollaborators: React.Dispatch<React.SetStateAction<Consultant[]>>;
    handleConfirmInvite: () => void;
    invitationError: string | null;
}

const InviteCollaborators: React.FC<InviteCollaboratorsProps> = ({
    filteredConsultants,
    selectedCollaborators,
    setSelectedCollaborators,
    handleConfirmInvite,
    invitationError
}) => {
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
                <Button disabled={selectedCollaborators.length === 0} onClick={handleConfirmInvite}>
                    Invite
                </Button>
                {invitationError && <Typography>{invitationError}</Typography>}
            </Stack>
        </Stack>
    );
};

export default InviteCollaborators;