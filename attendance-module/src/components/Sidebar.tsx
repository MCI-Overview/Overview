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
  Group,
  AccountTree,
  HomeRounded,
  DashboardRounded,
  SupportRounded,
  BrightnessAutoRounded,
  SettingsRounded,
  LogoutRounded,
  Accessibility,
  ReceiptLong,
  Person,
} from "@mui/icons-material";

function AdminList() {
  const navigate = useNavigate();

  const adminSideBarFields = [
    {
      name: "Home",
      icon: <HomeRounded />,
      onClick: () => navigate("/admin/home"),
    },
    {
      name: "Dashboard",
      icon: <DashboardRounded />,
      onClick: () => navigate("/admin/dashboard"),
    },
    {
      name: "Projects",
      icon: <AccountTree />,
      onClick: () => navigate("/admin/projects"),
    },
    {
      name: "Candidates",
      icon: <Group />,
      onClick: () => navigate("/admin/candidates"),
    },
  ];

  return (
    <List
      size="sm"
      sx={{
        gap: 1,
        "--List-nestedInsetStart": "30px",
        "--ListItem-radius": (theme) => theme.vars.radius.sm,
      }}
    >
      {adminSideBarFields.map((field) => (
        <ListItem>
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
}

function UserList() {
  const navigate = useNavigate();

  const userSideBarFields = [
    {
      name: "Home",
      icon: <HomeRounded />,
      onClick: () => navigate("/user/home"),
    },
    {
      name: "Shifts",
      icon: <DashboardRounded />,
      onClick: () => navigate("/user/shift"),
    },
    {
      name: "Leave",
      icon: <Accessibility />,
      onClick: () => navigate("/user/leave"),
    },
    {
      name: "Claims",
      icon: <ReceiptLong />,
      onClick: () => navigate("/user/claims"),
    },
    {
      name: "Profile",
      icon: <Person />,
      onClick: () => navigate("/user/profile"),
    },
  ];

  return (
    <List
      size="sm"
      sx={{
        gap: 1,
        "--List-nestedInsetStart": "30px",
        "--ListItem-radius": (theme) => theme.vars.radius.sm,
      }}
    >
      {userSideBarFields.map((field) => (
        <ListItem>
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
}

export default function Sidebar() {
  const { user, setUser } = useUserContext();

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
        <IconButton variant="soft" color="primary" size="sm">
          <BrightnessAutoRounded />
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
        {user?.userType == "Admin" && <AdminList />}
        {user?.userType == "User" && <UserList />}
        <List
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
              <SupportRounded />
              Support
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton>
              <SettingsRounded />
              Settings
            </ListItemButton>
          </ListItem>
        </List>
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
          onClick={() => axios.post("/logout").then(() => setUser(null))}
        >
          <LogoutRounded />
        </IconButton>
      </Box>
    </Sheet>
  );
}
