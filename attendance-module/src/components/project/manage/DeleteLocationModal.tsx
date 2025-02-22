import axios from "axios";
import toast from "react-hot-toast";
import { useProjectContext } from "../../../providers/projectContextProvider";
import { CommonLocation } from "../../../types/common";

import { Modal, ModalDialog, Button, Stack, Typography } from "@mui/joy";

interface DeleteLocationModalProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  locations: CommonLocation[];
  locationToDelete: CommonLocation;
}

const DeleteLocationModal = ({
  isOpen,
  setIsOpen,
  locations,
  locationToDelete,
}: DeleteLocationModalProps) => {
  const { project, updateProject } = useProjectContext();
  if (!project) return null;

  const handleDeleteLocation = async () => {
    const updatedLocations = locations.filter(
      (location) =>
        location.name !== locationToDelete.name &&
        location.latitude !== locationToDelete.latitude &&
        location.longitude !== locationToDelete.longitude
    );

    try {
      axios
        .patch("/api/admin/project", {
          projectCuid: project.cuid,
          locations: updatedLocations,
        })
        .then(() => {
          updateProject();
          toast.success("Location deleted successfully");
        });
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
