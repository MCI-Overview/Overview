import { List, ListItem, Stack, Typography } from "@mui/joy";
import { capitalizeWords } from "../../../utils/capitalize";
import { useProjectContext } from "../../../providers/projectContextProvider";

export default function ProjectLocations() {
  const { project } = useProjectContext();

  if (!project) return null;

  const { locations } = project;

  return (
    <List component="ol" marker="decimal">
      {locations.map((location) => (
        <ListItem>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography>
              {location.postalCode} - {capitalizeWords(location.address)}
            </Typography>
            {/* <IconButton onClick={() => {}}>
                <Delete />
              </IconButton> */}
          </Stack>
        </ListItem>
      ))}
    </List>
  );
}
