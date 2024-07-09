import { useState } from "react";

import GeneralProjectSettings from "../components/project/manage/GeneralProjectSettings";
import ManageProjectAccess from "../components/project/manage/ManageProjectAccess";

import {
  Button,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemDecorator,
  ListItemContent,
  ToggleButtonGroup,
  Typography,
} from "@mui/joy";
import {
  MenuBookRounded as MenuBookIcon,
  GroupRounded as GroupIcon,
} from "@mui/icons-material";

const sections = [
  {
    title: "General",
    icon: <MenuBookIcon />,
    children: <GeneralProjectSettings />,
  },
  {
    title: "Access",
    icon: <GroupIcon />,
    children: <ManageProjectAccess />,
  },
];

const Settings = () => {
  const [activeSection, setActiveSection] = useState<string | null>("General");

  return (
    <Grid container spacing={2} sx={{ flexGrow: 1 }}>
      <Grid xs={12} lg={2}>
        <List sx={{ display: { xs: "none", lg: "block" } }}>
          {sections.map((section) => (
            <ListItem
              key={section.title}
              onClick={() => setActiveSection(section.title)}
              sx={{
                cursor: "pointer",
              }}
              variant={section.title === activeSection ? "soft" : "plain"}
            >
              <ListItemButton sx={{ gap: 0 }}>
                <ListItemDecorator>{section.icon}</ListItemDecorator>
                <ListItemContent>
                  <Typography level="title-sm">{section.title}</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>
          ))}
          <Divider />
        </List>

        <ToggleButtonGroup
          value={activeSection}
          onChange={(_event, newSection) => {
            if (newSection !== null) {
              setActiveSection(newSection);
            }
          }}
          sx={{ width: "100%", display: { xs: "block", lg: "none" } }}
          variant="plain"
        >
          {sections.map((section) => (
            <Button
              key={section.title}
              value={section.title}
              sx={{ gap: 1, width: "25%" }}
            >
              <ListItemDecorator>{section.icon}</ListItemDecorator>
              <Typography
                level="body-sm"
                sx={{ display: { xs: "none", sm: "block" } }}
              >
                {section.title}
              </Typography>
            </Button>
          ))}
        </ToggleButtonGroup>
      </Grid>

      <Grid xs={12} lg={10}>
        {sections.find((s) => s.title === activeSection)!.children}
      </Grid>
    </Grid>
  );
};

export default Settings;
