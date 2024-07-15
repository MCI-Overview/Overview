import axios from "axios";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";

import { Assign } from "../../../types";
import { CommonConsultant, CommonCandidate } from "../../../types/common";
import { useProjectContext } from "../../../providers/projectContextProvider";
import { useUserContext } from "../../../providers/userContextProvider";

import {
  Autocomplete,
  Button,
  Card,
  FormLabel,
  Input,
  Modal,
  ModalClose,
  Stack,
  Table,
  Typography,
} from "@mui/joy";

interface RemoveConsultantModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  consultantToRemove: CommonConsultant;
}

const RemoveConsultantModal = ({
  isOpen,
  setIsOpen,
  consultantToRemove,
}: RemoveConsultantModalProps) => {
  const [rowSelections, setRowSelections] = useState<Assign[]>([]);
  const [affectedCdds, setAffectedCdds] = useState<CommonCandidate[]>([]);
  const [emailConfirmation, setEmailConfirmation] = useState<string>("");
  const [isSubmitDisabled, setIsSubmitDisabled] = useState<boolean>(true);

  const { project, updateProject } = useProjectContext();

  const { user } = useUserContext();

  useEffect(() => {
    if (!project || !consultantToRemove) return;

    setAffectedCdds(
      project.candidates.filter(
        (candidate) => candidate.consultantCuid === consultantToRemove.cuid
      )
    );
  }, [project, consultantToRemove]);

  useEffect(() => {
    setRowSelections(
      affectedCdds.map((candidate) => ({
        consultantCuid: null,
        candidateCuid: candidate.cuid,
      }))
    );
  }, [affectedCdds]);

  useEffect(() => {
    setIsSubmitDisabled(
      emailConfirmation !== consultantToRemove.email ||
        !rowSelections.every((selection) => selection.consultantCuid !== null)
    );
  }, [emailConfirmation, consultantToRemove.email, rowSelections]);

  if (!project) return null;
  if (!user) return null;

  const availableCollaborators = project.consultants.filter(
    (consultant) => consultant.cuid !== consultantToRemove.cuid
  );

  const handleApplyToAll = (value: CommonConsultant | null) => {
    const consultantCuid = value ? value.cuid : null;
    setRowSelections(
      affectedCdds.map((candidate) => ({
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
      candidateCuid: affectedCdds[index].cuid,
    };
    setRowSelections(updatedSelections);
  };

  const handleConfirmRemove = async () => {
    if (!emailConfirmation || !consultantToRemove) return;

    try {
      const reassignments = rowSelections.filter(
        (rowSelection) => rowSelection.consultantCuid !== null
      );

      await axios.delete(`/api/admin/project/${project.cuid}/manage`, {
        data: {
          consultantCuid: consultantToRemove.cuid,
          reassignments,
        },
      });

      toast.success("Consultant removed successfully.");
      updateProject();
      setIsOpen(false);
      setEmailConfirmation("");
    } catch (error) {
      toast.error("Failed to remove consultant.");
      console.error(error);
    }
  };

  return (
    <Modal
      aria-labelledby="modal-title"
      aria-describedby="modal-desc"
      open={isOpen}
      onClose={() => setIsOpen(false)}
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Card
        sx={{
          maxWidth: 900,
        }}
      >
        <ModalClose />
        <Typography
          component="h2"
          id="modal-title"
          level="h4"
          fontWeight="lg"
          mb={1}
        >
          Confirm removal
        </Typography>
        <Stack spacing={2}>
          {affectedCdds.length > 0 ? (
            <>
              <Typography
                component="p"
                id="modal-desc"
                textColor="text.tertiary"
              >
                Reassign candidates before removing the consultant{" "}
                {consultantToRemove.name}.
              </Typography>
              <Table
                stripe="odd"
                hoverRow
                sx={{
                  captionSide: "top",
                  "& tbody": { bgcolor: "background.surface" },
                }}
              >
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
                  {affectedCdds.map((candidate, index) => (
                    <tr key={candidate.nric}>
                      <td>{candidate.name}</td>
                      <td>{candidate.nric}</td>
                      <td>
                        <Autocomplete
                          placeholder="Select"
                          options={availableCollaborators}
                          value={
                            availableCollaborators.find(
                              (consultant) =>
                                consultant.cuid ===
                                rowSelections[index]?.consultantCuid
                            ) || null
                          }
                          getOptionLabel={(option) => option.email}
                          onChange={(_event, option) =>
                            handleRowSelectionChange(index, option)
                          }
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

          <FormLabel>
            Enter email and reassign all candidates (if any) to allow
            submission.
          </FormLabel>
          <Input
            placeholder={consultantToRemove.email}
            value={emailConfirmation}
            onChange={(e) => setEmailConfirmation(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isSubmitDisabled) {
                handleConfirmRemove();
              }
            }}
          />
          <Button disabled={isSubmitDisabled} onClick={handleConfirmRemove}>
            Confirm
          </Button>
        </Stack>
      </Card>
    </Modal>
  );
};

export default RemoveConsultantModal;
