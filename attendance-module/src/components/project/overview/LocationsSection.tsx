import { useEffect, useState } from "react";
import { useUserContext } from "../../../providers/userContextProvider";
import { useProjectContext } from "../../../providers/projectContextProvider";
import { capitalizeWords } from "../../../utils/capitalize";
import { checkPermission } from "../../../utils/permission";
import { Location, PermissionList } from "../../../types/common";
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
import { ControlPoint, Delete } from "@mui/icons-material";

const LocationsSection = () => {
  const { user } = useUserContext();
  const { project } = useProjectContext();

  const hasDeletePermission =
    project?.consultants.find(
      (consultant) => consultant.role === "CLIENT_HOLDER"
    )?.cuid === user?.cuid ||
    (user && checkPermission(user, PermissionList.CAN_EDIT_ALL_PROJECTS));

  const [locations, setLocations] = useState(project?.locations || []);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [locationToDelete, setLocationToDelete] = useState<Location>();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  if (!project) return null;

  useEffect(() => {
    setLocations(project.locations);
  }, [project.locations]);

  return (
    <>
      <Stack
        spacing={4}
        sx={{
          display: "flex",
          maxWidth: "800px",
          mx: "auto",
          px: { xs: 2, md: 6 },
          py: { xs: 2, md: 3 },
        }}
      >
        <Card>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Box sx={{ mb: 1 }}>
              <Typography level="title-md">Locations</Typography>
              <Typography level="body-sm">
                Add site locations to your project
              </Typography>
            </Box>
            <IconButton
              onClick={() => setIsAddModalOpen(true)}
              sx={{ px: { xs: 1.25 } }}
            >
              <ControlPoint />
            </IconButton>
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
                  {hasDeletePermission && (
                    <IconButton
                      onClick={() => {
                        setLocationToDelete(location);
                        setIsDeleteModalOpen(true);
                      }}
                    >
                      <Delete />
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
