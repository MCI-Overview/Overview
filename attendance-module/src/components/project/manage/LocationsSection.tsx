import { useEffect, useState } from "react";
import { useUserContext } from "../../../providers/userContextProvider";
import { useProjectContext } from "../../../providers/projectContextProvider";
import { capitalizeWords } from "../../../utils/capitalize";
import { checkPermission } from "../../../utils/permission";
import { CommonLocation, PermissionList } from "../../../types/common";
import AddLocationsModal from "./AddLocationsModal";
import DeleteLocationModal from "./DeleteLocationModal";

import {
  Box,
  Card,
  Divider,
  IconButton,
  List,
  ListItem,
  Stack,
  Typography,
} from "@mui/joy";
import {
  ControlPointRounded as ControlPointIcon,
  DeleteRounded as DeleteIcon,
} from "@mui/icons-material";

const LocationsSection = () => {
  const { user } = useUserContext();
  const { project } = useProjectContext();

  const hasEditProjectsPermission =
    project?.consultants.some(
      (c) => c.cuid === user?.cuid && c.role === "CLIENT_HOLDER"
    ) ||
    (user && checkPermission(user, PermissionList.CAN_EDIT_ALL_PROJECTS));

  const [locations, setLocations] = useState(project?.locations || []);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] =
    useState<CommonLocation | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (project) {
      setLocations(project.locations);
    }
  }, [project]);

  if (!project) return null;

  return (
    <>
      <Stack
        spacing={4}
        sx={{
          display: "flex",
          mx: "auto",
        }}
      >
        <Card>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Box sx={{ mb: 1 }}>
              <Typography level="title-md">Locations</Typography>
              <Typography level="body-sm">
                Site locations of your project
              </Typography>
            </Box>
            {hasEditProjectsPermission && (
              <IconButton
                onClick={() => setIsAddModalOpen(true)}
                sx={{ px: { xs: 1.25 } }}
              >
                <ControlPointIcon />
              </IconButton>
            )}
          </Box>
          <Divider />

          <List component="ol" marker="decimal">
            {locations.length === 0 && (
              <Typography level="body-sm">No locations added yet</Typography>
            )}
            {locations.map((location) => (
              <ListItem key={location.postalCode}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography level="body-md">
                    {location.postalCode} - {capitalizeWords(location.address)}
                  </Typography>
                  {hasEditProjectsPermission && (
                    <IconButton
                      onClick={() => {
                        setLocationToDelete(location);
                        setIsDeleteModalOpen(true);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>
              </ListItem>
            ))}
          </List>
        </Card>
      </Stack>

      <AddLocationsModal
        isOpen={isAddModalOpen}
        setIsOpen={setIsAddModalOpen}
        locations={locations}
      />

      {locationToDelete && (
        <DeleteLocationModal
          isOpen={isDeleteModalOpen}
          setIsOpen={setIsDeleteModalOpen}
          locations={locations}
          locationToDelete={locationToDelete}
        />
      )}
    </>
  );
};

export default LocationsSection;
