import axios from "axios";
import { toast } from "react-hot-toast";
import { useEffect, useState } from "react";
import { useProjectContext } from "../../../providers/projectContextProvider";
import { Location } from "../../../types/common";

import { Modal, ModalDialog, Typography, Input, Stack, Button } from "@mui/joy";

interface AddLocationsModalProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  locations: Location[];
}

const AddLocationsModal = ({
  isOpen,
  setIsOpen,
  locations,
}: AddLocationsModalProps) => {
  const [newPostalCode, setNewPostalCode] = useState("");
  const [newLocation, setNewLocation] = useState<Location | null>(null);

  const { project, updateProject } = useProjectContext();

  useEffect(() => {
    if (!newPostalCode || newPostalCode.length !== 6) {
      setNewLocation(null);
      return;
    }

    axios
      .get(
        `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${newPostalCode}&returnGeom=Y&getAddrDetails=N`,
        { withCredentials: false }
      )
      .then((res) => {
        if (res.data.found === 0) {
          setNewLocation(null);
          return;
        }

        setNewLocation({
          postalCode: newPostalCode,
          address: res.data.results[0].SEARCHVAL,
          latitude: res.data.results[0].LATITUDE,
          longitude: res.data.results[0].LONGITUDE,
        });
      })
      .catch(() => {
        toast.error("Failed to fetch location details");
      });
  }, [newPostalCode]);

  const handleAddLocation = async () => {
    if (!project || !newLocation) return;

    try {
      await axios.patch("/api/admin/project", {
        projectCuid: project.cuid,
        locations: [...locations, newLocation],
      });
      updateProject();
      setNewPostalCode("");
      toast.success("Location added successfully");
    } catch (error) {
      console.log(error);
      toast.error("Failed to add location");
    }
  };

  if (!project) return null;

  return (
    <Modal open={isOpen} onClose={() => setIsOpen(false)}>
      <ModalDialog sx={{ maxWidth: "525px" }}>
        <Typography level="title-md">Add new site locations</Typography>

        <Input
          type="text"
          placeholder="Postal code"
          fullWidth
          value={newPostalCode}
          onChange={(e) => {
            setNewPostalCode(e.target.value);
          }}
        />

        <Typography level="body-md">
          {!newLocation
            ? "Please enter a valid postal code"
            : locations.some(
              (location) => location.postalCode === newPostalCode
            )
              ? "Location already added"
              : newLocation.address}
        </Typography>

        <Stack direction="row" spacing={1}>
          <Button onClick={() => setIsOpen(false)} fullWidth>
            Cancel
          </Button>
          <Button
            onClick={handleAddLocation}
            color="danger"
            fullWidth
            disabled={
              newLocation
                ? locations.some((loc) => loc.postalCode === newPostalCode)
                : true
            }
          >
            Confirm
          </Button>
        </Stack>
      </ModalDialog>
    </Modal>
  );
};

export default AddLocationsModal;