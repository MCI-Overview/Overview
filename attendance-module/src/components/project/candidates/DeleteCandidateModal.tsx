import { CandidateBasic } from "../../../types";

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
  candidatesData: CandidateBasic[];
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
        <Typography level="title-md">
          Are you sure you want to delete the following candidates? This action
          cannot be undone.
        </Typography>
        <List component="ol" marker="decimal">
          {candidatesData.map((c) => {
            if (candidatesToDelete.includes(c.nric)) {
              return (
                <ListItem key={c.nric}>
                  <Typography level="title-md">
                    {c.nric} - {c.name}
                  </Typography>
                </ListItem>
              );
            }
          })}
        </List>
        <Stack direction="row" spacing={1}>
          <Button
            onClick={() => handleDeleteCandidates()}
            color="danger"
            fullWidth
          >
            Confirm
          </Button>
          <Button onClick={() => setIsDeleteModalOpen(false)} fullWidth>
            Cancel
          </Button>
        </Stack>
      </ModalDialog>
    </Modal>
  );
};

export default DeleteCandidateModal;
