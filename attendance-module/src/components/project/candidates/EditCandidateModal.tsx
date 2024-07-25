import ResponsiveDialog from "../../ResponsiveDialog";
import { CommonCandidate } from "../../../types/common";
import axios from "axios";

import { Button, FormControl, Input, Stack } from "@mui/joy";
import { useProjectContext } from "../../../providers/projectContextProvider";

interface EditCandidateModal {
  isDeleteModalOpen: boolean;
  setIsEditModalOpen: (isOpen: boolean) => void;
  candidatesData: CommonCandidate[];
  candidatetoedit: 
}

const EditCandidateModal = ({
  isDeleteModalOpen,
  setIsEditModalOpen,

}: EditCandidateModal) => {
  const projectCuid = useProjectContext().project?.cuid;
  const handleEditCandidates = async () => {
    try {
      await axios.patch(`/api/admin/${projectCuid}/candidates`, {

      })
    }
    catch {

    }
  };

  return (
    <ResponsiveDialog
      open={isDeleteModalOpen}
      handleClose={() => setIsEditModalOpen(false)}
      title="Edit candidate"
      subtitle="Are you sure you want to edit the following candidates?"
      actions={
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            onClick={() => setIsEditModalOpen(false)}
            fullWidth
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleEditCandidates()}
            color="danger"
            fullWidth
          >
            Confirm
          </Button>
        </Stack>
      }
    >
      <FormControl>
        <Input></Input>
      </FormControl>
    </ResponsiveDialog>
  );
};

export default EditCandidateModal;
