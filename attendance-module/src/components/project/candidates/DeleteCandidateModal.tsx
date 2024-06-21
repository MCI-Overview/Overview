import { CommonCandidate } from "../../../types/common";

import {
  Button,
  List,
  ListItem,
  Modal,
  ModalDialog,
  Stack,
  Typography,
} from "@mui/joy";

interface DeleteCandidateModal {
  isDeleteModalOpen: boolean;
  setIsDeleteModalOpen: (isOpen: boolean) => void;
  candidatesData: CommonCandidate[];
  candidatesToDelete: string[];
  handleDeleteCandidates: () => void;
}

const DeleteCandidateModal = ({
  isDeleteModalOpen,
  setIsDeleteModalOpen,
  candidatesData,
  candidatesToDelete,
  handleDeleteCandidates,
}: DeleteCandidateModal) => {
  return (
    <Modal open={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
      <ModalDialog sx={{ maxWidth: "525px" }}>
        <Typography level="body-md">
          Are you sure you want to delete the following candidates? This action
          cannot be undone.
        </Typography>
        <List component="ol" marker="decimal">
          {candidatesData.map((c) => {
            if (candidatesToDelete.includes(c.cuid)) {
              return (
                <ListItem key={c.cuid}>
                  <Typography level="body-sm">
                    {c.nric} - {c.name}
                  </Typography>
                </ListItem>
              );
            }
          })}
        </List>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            onClick={() => setIsDeleteModalOpen(false)}
            fullWidth
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleDeleteCandidates()}
            color="danger"
            fullWidth
          >
            Confirm
          </Button>
        </Stack>
      </ModalDialog>
    </Modal>
  );
};

export default DeleteCandidateModal;
