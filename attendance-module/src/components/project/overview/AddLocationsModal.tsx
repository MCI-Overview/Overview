import { Modal, ModalDialog, Typography, Input, Stack, Button } from "@mui/joy";

interface AddLocationsModalProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

const AddLocationsModal = ({ isOpen, setIsOpen }: AddLocationsModalProps) => {
  const handleAddLocation = () => {};

  return (
    <Modal open={isOpen} onClose={() => setIsOpen(false)}>
      <ModalDialog sx={{ maxWidth: "525px" }}>
        <Typography level="title-md">
          Add a new location to the project
        </Typography>

        <Input type="text" placeholder="Postal code" fullWidth />

        <Stack direction="row" spacing={1}>
          <Button onClick={() => setIsOpen(false)} fullWidth>
            Cancel
          </Button>
          <Button onClick={() => handleAddLocation()} color="danger" fullWidth>
            Confirm
          </Button>
        </Stack>
      </ModalDialog>
    </Modal>
  );
};

export default AddLocationsModal;
