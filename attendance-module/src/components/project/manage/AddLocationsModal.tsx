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
  Autocomplete,
  Grid,
  FormHelperText,
} from "@mui/joy";

interface AddLocationsModalProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  locations: CommonLocation[];
}

function equalsIgnoringCase(text: string | undefined, other: string) {
  if (!text || !other) return false;

  return text.localeCompare(other, undefined, { sensitivity: "base" }) === 0;
}

const AddLocationsModal = ({
  isOpen,
  setIsOpen,
  locations,
}: AddLocationsModalProps) => {
  const [newLocation, setNewLocation] = useState<CommonLocation | null>(null);

  const { project, updateProject } = useProjectContext();

  const [addressList, setAddressList] = useState<
    {
      POSTAL?: string;
      BLK_NO?: string;
      ROAD_NAME?: string;
      BUILDING?: string;
      LATITUDE?: string;
      LONGITUDE?: string;
    }[]
  >([]);

  const [nameError, setNameError] = useState("");
  const [latitudeError, setLatitudeError] = useState("");
  const [longitudeError, setLongitudeError] = useState("");

  const handleAddLocation = async () => {
    if (!project || !newLocation) return;

    try {
      await axios.patch("/api/admin/project", {
        projectCuid: project.cuid,
        locations: [...locations, newLocation],
      });
      updateProject();
      setNewLocation(null);
      toast.success("Location added successfully");
    } catch (error) {
      console.log(error);
      toast.error("Failed to add location");
    }
  };

  useEffect(() => {
    setNameError("");
    setLatitudeError("");
    setLongitudeError("");

    if (
      locations.some(
        (loc) => loc?.name?.toLowerCase() === newLocation?.name?.toLowerCase()
      )
    ) {
      setNameError("Duplicate location name");
    }

    if (
      locations.some(
        (loc) =>
          parseFloat(loc.latitude) === parseFloat(newLocation?.latitude || "")
      )
    ) {
      setLatitudeError("Duplicate latitude");
    }

    if (
      locations.some(
        (loc) =>
          parseFloat(loc.longitude) === parseFloat(newLocation?.longitude || "")
      )
    ) {
      setLongitudeError("Duplicate longitude");
    }
  }, [newLocation, locations]);

  if (!project) return null;

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
                ? locations.some(
                    (loc) =>
                      loc.latitude === newLocation.latitude ||
                      loc.longitude === newLocation.longitude ||
                      loc.name === newLocation.name
                  )
                : true
            }
          >
            Confirm
          </Button>
        </Stack>
      }
    >
      <Stack gap={1}>
        <FormControl>
          <FormLabel>Search Address</FormLabel>
          <Autocomplete
            autoSelect
            clearOnBlur
            clearOnEscape
            options={addressList}
            getOptionLabel={(option) =>
              `${
                !equalsIgnoringCase(option.BLK_NO, "NIL") ? option.BLK_NO : ""
              }${
                !equalsIgnoringCase(option.ROAD_NAME, "NIL")
                  ? ` ${readableEnum(option.ROAD_NAME)}`
                  : ""
              }${
                !equalsIgnoringCase(option.BUILDING, "NIL")
                  ? ` ${readableEnum(option.BUILDING)}`
                  : ""
              }${
                !equalsIgnoringCase(option.POSTAL, "NIL")
                  ? ` Singapore ${option.POSTAL}`
                  : ""
              }`
            }
            onInput={(e) => {
              setAddressList([]);
              const searchValue = (e.target as HTMLInputElement).value;
              if (searchValue) {
                axios
                  .get(
                    `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${searchValue}&returnGeom=Y&getAddrDetails=Y`,
                    { withCredentials: false }
                  )
                  .then((res) => {
                    setAddressList(res.data.results);
                  });
              }
            }}
            onChange={(_e, value) => {
              if (value) {
                setNewLocation({
                  name: `${
                    !equalsIgnoringCase(value.BLK_NO, "NIL") ? value.BLK_NO : ""
                  }${
                    !equalsIgnoringCase(value.ROAD_NAME, "NIL")
                      ? ` ${readableEnum(value.ROAD_NAME)}`
                      : ""
                  }${
                    !equalsIgnoringCase(value.BUILDING, "NIL")
                      ? ` ${readableEnum(value.BUILDING)}`
                      : ""
                  }${
                    !equalsIgnoringCase(value.POSTAL, "NIL")
                      ? ` Singapore ${value.POSTAL}`
                      : ""
                  }`,
                  latitude: value.LATITUDE || "",
                  longitude: value.LONGITUDE || "",
                });
              }
            }}
          />
        </FormControl>
        <FormControl error={!!nameError}>
          <FormLabel>Name</FormLabel>
          <Input
            type="text"
            value={newLocation?.name || ""}
            onChange={(e) =>
              setNewLocation({
                ...newLocation,
                name: e.target.value,
                longitude: newLocation?.longitude || "",
                latitude: newLocation?.latitude || "",
              })
            }
          />
          <FormHelperText>{nameError}</FormHelperText>
        </FormControl>
        <Grid container columns={2} spacing={2}>
          <Grid xs={2} sm={1}>
            <FormControl error={!!latitudeError}>
              <FormLabel>Latitude</FormLabel>
              <Input
                type="number"
                value={newLocation?.latitude || ""}
                onChange={(e) =>
                  setNewLocation({
                    ...newLocation,
                    name: newLocation?.name || "",
                    longitude: newLocation?.longitude || "",
                    latitude: e.target.value,
                  })
                }
              />
              <FormHelperText>{latitudeError}</FormHelperText>
            </FormControl>
          </Grid>
          <Grid xs={2} sm={1}>
            <FormControl error={!!longitudeError}>
              <FormLabel>Longitude</FormLabel>
              <Input
                type="number"
                value={newLocation?.longitude || ""}
                onChange={(e) =>
                  setNewLocation({
                    ...newLocation,
                    name: newLocation?.name || "",
                    latitude: newLocation?.latitude || "",
                    longitude: e.target.value,
                  })
                }
              />
              <FormHelperText>{longitudeError}</FormHelperText>
            </FormControl>
          </Grid>
        </Grid>
      </Stack>
    </ResponsiveDialog>
  );
};

export default AddLocationsModal;
