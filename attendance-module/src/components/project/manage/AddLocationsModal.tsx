import axios from "axios";
import { toast } from "react-hot-toast";
import { useEffect, useState } from "react";

import ResponsiveDialog from "../../ResponsiveDialog";
import { CommonLocation } from "../../../types/common";
import { readableEnum } from "../../../utils/capitalize";
import { useProjectContext } from "../../../providers/projectContextProvider";

import {
  Input,
  Stack,
  Button,
  FormControl,
  FormLabel,
  FormHelperText,
} from "@mui/joy";

interface AddLocationsModalProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  locations: CommonLocation[];
}

const AddLocationsModal = ({
  isOpen,
  setIsOpen,
  locations,
}: AddLocationsModalProps) => {
  const [newPostalCode, setNewPostalCode] = useState("");
  const [newLocation, setNewLocation] = useState<CommonLocation | null>(null);

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

  const error =
    !newLocation ||
    locations.some((location) => location.postalCode === newPostalCode);

  return (
    <ResponsiveDialog
      title="Add new site locations"
      open={isOpen}
      handleClose={() => setIsOpen(false)}
      actions={
        <Stack direction="row" spacing={1} width="100%">
          <Button variant="outlined" onClick={() => setIsOpen(false)} fullWidth>
            Cancel
          </Button>
          <Button
            onClick={handleAddLocation}
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
      }
    >
      <FormControl error={error}>
        <FormLabel>Postal Code</FormLabel>
        <Input
          type="text"
          value={newPostalCode}
          onChange={(e) => {
            setNewPostalCode(e.target.value);
          }}
        />
        <FormHelperText>
          {!newLocation
            ? "Please enter a valid postal code"
            : locations.some(
                (location) => location.postalCode === newPostalCode
              )
            ? "Location already added"
            : readableEnum(newLocation.address)}
        </FormHelperText>
      </FormControl>
    </ResponsiveDialog>
  );
};

export default AddLocationsModal;
