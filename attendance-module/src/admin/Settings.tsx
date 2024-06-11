import ManageProjectAccess from "../components/project/manage/ManageProjectAccess";

import {
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemDecorator,
  ListItemContent,
  Grid,
  Typography,
} from "@mui/joy";
import { KeyboardArrowRight } from "@mui/icons-material";
import GroupIcon from "@mui/icons-material/Group";

const Settings = () => {
  return (
    <>
      <Grid container spacing={2} sx={{ flexGrow: 1 }}>
        <Grid xs={12} lg={3}>
          <Typography>Access</Typography>
          <List>
            <ListItem>
              <ListItemButton>
                <ListItemDecorator>
                  <GroupIcon />
                </ListItemDecorator>
                <ListItemContent>Collaborators</ListItemContent>
                <KeyboardArrowRight />
              </ListItemButton>
            </ListItem>
          </List>
          <Divider />
          <Typography>Other settings</Typography>
          <List>
            <ListItem>
              <ListItemButton>
                <ListItemDecorator></ListItemDecorator>
                <ListItemContent></ListItemContent>
                <KeyboardArrowRight />
              </ListItemButton>
            </ListItem>
            <ListItem>
              <ListItemButton>
                <ListItemDecorator></ListItemDecorator>
                <ListItemContent></ListItemContent>
                <KeyboardArrowRight />
              </ListItemButton>
            </ListItem>
            <ListItem>
              <ListItemButton>
                <ListItemDecorator></ListItemDecorator>
                <ListItemContent></ListItemContent>
                <KeyboardArrowRight />
              </ListItemButton>
            </ListItem>
            <ListItem>
              <ListItemButton>
                <ListItemDecorator></ListItemDecorator>
                <ListItemContent></ListItemContent>
                <KeyboardArrowRight />
              </ListItemButton>
            </ListItem>
          </List>
          <Divider />
        </Grid>
        <Grid xs={12} lg={9}>
          <ManageProjectAccess />
        </Grid>
      </Grid>
    </>
  );
};

export default Settings;
