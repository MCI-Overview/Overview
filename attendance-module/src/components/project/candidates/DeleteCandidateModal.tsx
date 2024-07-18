import ResponsiveDialog from "../../ResponsiveDialog";
import { CommonCandidate } from "../../../types/common";

import { Button, List, ListItem, Stack, Typography } from "@mui/joy";

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
    <ResponsiveDialog
      open={isDeleteModalOpen}
      handleClose={() => setIsDeleteModalOpen(false)}
      title="Delete candidate"
      subtitle="Are you sure you want to delete the following candidates? This action
          cannot be undone."
      actions={
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
      }
    >
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
    </ResponsiveDialog>
  );
};

export default DeleteCandidateModal;
