import axios from "axios";
import { useNavigate } from "react-router-dom";
import { closeSidebar } from "../utils/toggle-sidebar";
import { useUserContext } from "../providers/userContextProvider";
import ColorSchemeToggle from "./ColorSchemeToggle";

import {
  GlobalStyles,
  Box,
  Divider,
  IconButton,
  List,
  ListItem,
  Sheet,
  Typography,
  ListItemContent,
  ListItemButton,
  listItemButtonClasses,
} from "@mui/joy";

import {
  MailRounded as MailIcon,
  HomeRounded as HomeIcon,
  GroupRounded as GroupIcon,
  PersonRounded as PersonIcon,
  LogoutRounded as LogoutIcon,
  SupportRounded as SupportIcon,
  SettingsRounded as SettingsIcon,
  AccountTreeRounded as AccountTreeIcon,
  WorkHistoryRounded as WorkHistoryIcon,
} from "@mui/icons-material";

interface SideBarListProps {
  isAdmin: boolean;
}

const SideBarList = ({ isAdmin }: SideBarListProps) => {
  const navigate = useNavigate();

  const userSideBarFields = [
    {
      name: "Home",
      icon: <HomeIcon />,
      onClick: () => {
        closeSidebar();
        navigate("/user/home");
      },
    },
    {
      name: "Shifts",
      icon: <WorkHistoryIcon />,
      onClick: () => {
        closeSidebar();
        navigate("/user/shifts");
      },
    },
    {
      name: "Requests",
      icon: <MailIcon />,
      onClick: () => {
        closeSidebar();
        navigate("/user/requests");
      },
    },
    {
      name: "Projects",
      icon: <AccountTreeIcon />,
      onClick: () => {
        closeSidebar();
        navigate("/user/projects");
      },
    },
    {
      name: "Profile",
      icon: <PersonIcon />,
      onClick: () => {
        closeSidebar();
        navigate("/user/profile");
      },
    },
  ];

  const adminSideBarFields = [
    {
      name: "Home",
      icon: <HomeIcon />,
      onClick: () => {
        closeSidebar();
        navigate("/admin/home");
      },
    },
    {
      name: "Candidates",
      icon: <GroupIcon />,
      onClick: () => {
        closeSidebar();
        navigate("/admin/candidates");
      },
    },
    // {
    //   name: "Requests",
    //   icon: <MailIcon />,
    //   onClick: () => {
    //     closeSidebar();
    //     navigate("/admin/requests");
    //   },
    // },
  ];

  const fields = isAdmin ? adminSideBarFields : userSideBarFields;

  return (
    <List
      size="sm"
      sx={{
        gap: 1,
        "--List-nestedInsetStart": "30px",
        "--ListItem-radius": (theme) => theme.vars.radius.sm,
      }}
    >
      {fields.map((field) => (
        <ListItem key={field.name}>
          <ListItemButton onClick={field.onClick}>
            {field.icon}
            <ListItemContent>
              <Typography level="title-sm">{field.name}</Typography>
            </ListItemContent>
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

export default function Sidebar() {
  const { user, updateUser } = useUserContext();

  return (
    <Sheet
      className="Sidebar"
      sx={{
        position: { xs: "fixed", md: "sticky" },
        transform: {
          xs: "translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1)))",
          md: "none",
        },
        transition: "transform 0.4s, width 0.4s",
        zIndex: 13,
        height: "100dvh",
        width: "var(--Sidebar-width)",
        top: 0,
        p: 2,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        borderRight: "1px solid",
        borderColor: "divider",
      }}
    >
      <GlobalStyles
        styles={(theme) => ({
          ":root": {
            "--Sidebar-width": "220px",
            [theme.breakpoints.up("lg")]: {
              "--Sidebar-width": "240px",
            },
          },
        })}
      />
      <Box
        className="Sidebar-overlay"
        sx={{
          position: "fixed",
          zIndex: 9998,
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          opacity: "var(--SideNavigation-slideIn)",
          backgroundColor: "var(--joy-palette-background-backdrop)",
          transition: "opacity 0.4s",
          transform: {
            xs: "translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1) + var(--SideNavigation-slideIn, 0) * var(--Sidebar-width, 0px)))",
            lg: "translateX(-100%)",
          },
        }}
        onClick={() => closeSidebar()}
      />
      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <IconButton
          size="sm"
          variant="soft"
          sx={{ borderRadius: 100 }}
          disabled
        >
          <img src="/Images/ovlogo1.svg"></img>
        </IconButton>
        <Typography level="title-lg">Overview</Typography>
        <ColorSchemeToggle sx={{ ml: "auto" }} />
      </Box>

      <Box
        sx={{
          minHeight: 0,
          overflow: "hidden auto",
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          [`& .${listItemButtonClasses.root}`]: {
            gap: 1.5,
          },
        }}
      >
        <SideBarList isAdmin={user?.userType === "Admin"} />
        {/* <List
          size="sm"
          sx={{
            mt: "auto",
            flexGrow: 0,
            "--ListItem-radius": (theme) => theme.vars.radius.sm,
            "--List-gap": "8px",
            mb: 2,
          }}
        >
          <ListItem>
            <ListItemButton>
              <SupportIcon />
              Support
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton>
              <SettingsIcon />
              Settings
            </ListItemButton>
          </ListItem>
        </List> */}
      </Box>
      <Divider />
      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography level="title-sm">{user?.name}</Typography>
          <Typography level="body-xs">
            {user?.userType == "Admin" && user.email}
            {user?.userType == "User" && user.nric}
          </Typography>
        </Box>
        <IconButton
          size="sm"
          variant="plain"
          color="neutral"
          onClick={() => axios.post("/logout").then(() => updateUser())}
        >
          <LogoutIcon />
        </IconButton>
      </Box>
    </Sheet>
  );
}
