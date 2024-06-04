import { useProjectContext } from "../../../providers/projectContextProvider";
import { Location } from "../../../types/common";
import toast from "react-hot-toast";

interface DeleteLocationModalProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  locationToDelete: Location;
}

const DeleteLocationModal = ({
  isOpen,
  setIsOpen,
  locationToDelete,
}: DeleteLocationModalProps) => {
  const { project, updateProject } = useProjectContext();

  const handleDeleteLocation = async (location: Location) => {
    try {
      // api call to delete location
      console.log("Deleting location", location);

      updateProject({
        ...project,
        locations: project.locations.filter(
          (loc) => loc.cuid !== location.cuid,
        ),
      });
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
          <Button
            onClick={() => handleDeleteLocation(locationToDelete)}
            color="danger"
            fullWidth
          >
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
