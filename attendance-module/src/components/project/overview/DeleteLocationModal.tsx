import { Location } from "../../../types/common";
import toast from "react-hot-toast";

import { Modal, ModalDialog, Button, Stack, Typography } from "@mui/joy";

interface DeleteLocationModalProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  locations: Location[];
  setLocations: (value: Location[]) => void;
  locationToDelete: Location;
}

const DeleteLocationModal = ({
  isOpen,
  setIsOpen,
  locations,
  setLocations,
  locationToDelete,
}: DeleteLocationModalProps) => {
  const handleDeleteLocation = async () => {
    try {
      // api call to delete location
      console.log("Deleting location", locationToDelete);

      // update project context
      const updatedLocations = locations.filter(
        (location) => location.postalCode !== locationToDelete.postalCode
      );
      setLocations(updatedLocations);

      toast.success("Location deleted successfully");
    } catch (error) {
      toast.error("Failed to delete location");
      console.log(error);
    }

    setIsOpen(false);
  };

  return (
    <Modal open={isOpen} onClose={() => setIsOpen(false)}>
      <ModalDialog sx={{ maxWidth: "525px" }}>
        <Typography level="title-md">
          Are you sure you want to delete this location?
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button onClick={handleDeleteLocation} color="danger" fullWidth>
            Confirm
          </Button>
          <Button onClick={() => setIsOpen(false)} fullWidth>
            Cancel
          </Button>
        </Stack>
      </ModalDialog>
    </Modal>
  );
};

export default DeleteLocationModal;
