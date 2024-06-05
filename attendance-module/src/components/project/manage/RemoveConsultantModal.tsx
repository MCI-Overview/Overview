import React from 'react';
import {
    Modal,
    ModalClose,
    Sheet,
    Typography,
    Stack,
    Table,
    FormLabel,
    Input,
    Button,
    Autocomplete
} from "@mui/joy";
import { Consultant, Assign, CommonCandidate } from "../../../types/common";

interface RemoveConsultantModalProps {
    open: boolean;
    onClose: () => void;
    consultantToRemove: Consultant | null;
    candidatesToReassign: CommonCandidate[];
    rowSelections: Assign[];
    availableCollaborators: Consultant[];
    handleApplyToAll: (value: Consultant | null) => void;
    handleRowSelectionChange: (index: number, value: Consultant | null) => void;
    emailConfirmation: string;
    setEmailConfirmation: React.Dispatch<React.SetStateAction<string>>;
    handleConfirmRemove: () => void;
    allCandidatesReassigned: boolean;
}

const RemoveConsultantModal: React.FC<RemoveConsultantModalProps> = ({
    open,
    onClose,
    consultantToRemove,
    candidatesToReassign,
    rowSelections,
    availableCollaborators,
    handleApplyToAll,
    handleRowSelectionChange,
    emailConfirmation,
    setEmailConfirmation,
    handleConfirmRemove,
    allCandidatesReassigned
}) => {
    return (
        <Modal
            aria-labelledby="modal-title"
            aria-describedby="modal-desc"
            open={open}
            onClose={onClose}
            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
            <Sheet
                variant="outlined"
                sx={{
                    maxWidth: 900,
                    borderRadius: 'md',
                    p: 3,
                    boxShadow: 'lg',
                }}
            >
                <ModalClose variant="plain" sx={{ m: 1 }} />
                <Typography component="h2" id="modal-title" level="h4" fontWeight="lg" mb={1}>
                    Confirm removal
                </Typography>
                <Stack spacing={2}>
                    {candidatesToReassign.length > 0 ? (
                        <>
                            <Typography component="p" id="modal-desc" textColor="text.tertiary">
                                Reassign candidates before removing the consultant {consultantToRemove?.name}.
                            </Typography>
                            <Table stripe="odd" hoverRow sx={{ captionSide: 'top', '& tbody': { bgcolor: 'background.surface' } }}>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>NRIC</th>
                                        <th>
                                            <Autocomplete
                                                placeholder="Apply to all"
                                                options={availableCollaborators}
                                                getOptionLabel={(option) => option.email}
                                                onChange={(_event, value) => handleApplyToAll(value)}
                                                value={null}
                                            />
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {candidatesToReassign.map((candidate, index) => (
                                        <tr key={candidate.nric}>
                                            <td>{candidate.name}</td>
                                            <td>{candidate.nric}</td>
                                            <td>
                                                <Autocomplete
                                                    placeholder="Select"
                                                    options={availableCollaborators}
                                                    value={availableCollaborators.find((consultant) => consultant.cuid === rowSelections[index]?.consultantCuid) || null}
                                                    getOptionLabel={(option) => option.email}
                                                    onChange={(_event, option) => handleRowSelectionChange(index, option)}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </>
                    ) : (
                        <Typography>No candidates to reassign.</Typography>
                    )}
                    <FormLabel>Enter email and reassign all candidates (if any) to allow submission.</FormLabel>
                    <Input
                        placeholder={consultantToRemove?.email || ""}
                        value={emailConfirmation}
                        onChange={(event) => setEmailConfirmation(event.target.value)}
                    />
                    <Button disabled={emailConfirmation !== consultantToRemove?.email || !allCandidatesReassigned} onClick={handleConfirmRemove}>
                        Confirm
                    </Button>
                </Stack>
            </Sheet>
        </Modal>
    );
};

export default RemoveConsultantModal;
