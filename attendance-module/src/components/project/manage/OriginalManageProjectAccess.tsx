import React, { useState, useEffect } from "react";
import {
    Box,
    Button,
    Divider,
    Stack,
    Typography,
    Card,
    Modal,
    ModalClose,
    Autocomplete,
    Input,
    FormLabel,
    Table,
    Sheet,
    CardOverflow,
    CardActions
} from "@mui/joy";
import { useProjectContext } from "../../../providers/projectContextProvider";
import axios from "axios";
import { CommonCandidate, CommonConsultant } from "../../../types/common";
import { useUserContext } from "../../../providers/userContextProvider";
import { Assign } from "../../../types";

const ManageProjectAccess: React.FC = () => {
    const [consultants, setConsultants] = useState<CommonConsultant[]>([]);
    const [selectedCollaborators, setSelectedCollaborators] = useState<CommonConsultant[]>([]);
    const [rowSelections, setRowSelections] = useState<Assign[]>([]);
    const [emailConfirmation, setEmailConfirmation] = useState<string>('');
    const [invitationError, setInvitationError] = useState<string | null>(null);
    const [openRemoveModal, setOpenRemoveModal] = useState(false);
    const [candidatesToReassign, setCandidatesToReassign] = useState<CommonCandidate[]>([]);
    const [consultantToRemove, setConsultantToRemove] = useState<CommonConsultant | null>(null);

    const { project, updateProject } = useProjectContext();
    const collaborators = project?.consultants ?? [];
    const candidates = project?.candidates ?? [];
    const { user } = useUserContext();
    const currentUserCuid = user?.cuid;

    // Determine the current user's role based on their cuid
    const currentUserRole = collaborators.find(collaborator => collaborator.cuid === currentUserCuid)?.role;

    const filteredConsultants = consultants.filter(
        (consultant) => !collaborators.some((row) => row.cuid === consultant.cuid)
    );

    useEffect(() => {
        const fetchConsultants = async () => {
            try {
                const { data } = await axios.get('/api/admin/consultants');
                setConsultants(data);
            } catch (error) {
                console.error("Failed to fetch consultants", error);
            }
        };
        fetchConsultants();
    }, []);

    const handleApplyToAll = (value: CommonConsultant | null) => {
        const consultantCuid = value ? value.cuid : null;
        setRowSelections(candidatesToReassign.map((candidate) => ({ consultantCuid, candidateCuid: candidate.cuid })));
    };

    const handleRowSelectionChange = (index: number, value: CommonConsultant | null) => {
        const updatedSelections = [...rowSelections];
        updatedSelections[index] = { consultantCuid: value?.cuid ?? null, candidateCuid: candidatesToReassign[index].cuid };
        setRowSelections(updatedSelections);
    };

    const handleRemoveClick = (cuid: string) => {
        const consultant = collaborators.find((collab) => collab.cuid === cuid);
        if (consultant) {
            const candidatesOfConsultant = candidates.filter((candidate) => candidate.consultantCuid === cuid);
            setConsultantToRemove(consultant);
            setCandidatesToReassign(candidatesOfConsultant);
            setRowSelections(candidatesOfConsultant.map((candidate) => ({ consultantCuid: null, candidateCuid: candidate.cuid })));
            setOpenRemoveModal(true);
        }
    };

    const handleCloseRemoveModal = () => {
        setOpenRemoveModal(false);
        setRowSelections([]);
        setEmailConfirmation('');
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
            if (error instanceof Error) {
                setInvitationError(error.message || "Failed to invite collaborator.");
            } else {
                setInvitationError("Failed to invite collaborator.");
            }
        }
    };

    const handleConfirmRemove = async () => {
        if (emailConfirmation === '' || !consultantToRemove) return;
        try {
            const projectCuid = project?.cuid;
            if (!projectCuid) throw new Error("Project ID is missing");

            const reassignments = rowSelections.filter((rowSelection) => rowSelection.consultantCuid !== null);

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

    const availableCollaborators = collaborators.filter((consultant) => consultant.cuid !== consultantToRemove?.cuid);

    const allCandidatesReassigned = rowSelections.every((selection) => selection.consultantCuid !== null);

    return (
        <>
            <Modal
                aria-labelledby="modal-title"
                aria-describedby="modal-desc"
                open={openRemoveModal}
                onClose={handleCloseRemoveModal}
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

            <Stack
                spacing={4}
                sx={{
                    display: "flex",
                    mx: "auto",
                    py: { xs: 0 },
                }}
            >
                <Card>
                    <Box sx={{ mb: 1 }}>
                        <Typography level="title-md">Project collaborators</Typography>
                        <Typography level="body-sm">Only collaborators are allowed access to this project. </Typography>
                    </Box>
                    <Divider />
                    <Stack spacing={2} sx={{ my: 1 }}>

                        <Stack spacing={2}>
                            {currentUserRole === "CLIENT_HOLDER" && (
                                <>
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
                                    <Divider />
                                </>
                            )}
                            <Table hoverRow>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        {currentUserRole === "CLIENT_HOLDER" && (
                                            <th style={{ minWidth: "100px", maxWidth: "150px" }}>
                                                Action
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {collaborators.map((row) => (
                                        <tr key={row.cuid}>
                                            <td style={{ wordWrap: 'break-word' }}>{row.name}</td>
                                            <td style={{ wordWrap: 'break-word' }}>{row.email}</td>
                                            <td style={{ wordWrap: 'break-word' }}>{row.role}</td>
                                            {currentUserRole === "CLIENT_HOLDER" && (
                                                <td>
                                                    <Button onClick={() => handleRemoveClick(row.cuid)}>Remove</Button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>

                        </Stack>

                    </Stack>
                    <CardOverflow
                        sx={{ borderTop: "1px solid", borderColor: "divider" }}
                    >
                        <CardActions sx={{ alignSelf: "flex-start", pt: 2 }}>
                            <Typography level="body-sm">Only client holders can invite and remove collaborators.</Typography>
                        </CardActions>

                    </CardOverflow>
                </Card>
            </Stack>
        </>
    );
};


// super final
export default ManageProjectAccess;