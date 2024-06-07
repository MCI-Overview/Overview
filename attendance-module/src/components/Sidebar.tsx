import { useNavigate } from "react-router-dom";

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
} from "@mui/joy";

import { listItemButtonClasses } from "@mui/joy/ListItemButton";

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
} from "@mui/icons-material";

import ColorSchemeToggle from "./ColorSchemeToggle";
import { closeSidebar } from "../utils/toggle-sidebar";
import { useUserContext } from "../providers/userContextProvider";
import axios from "axios";

function AdminList() {
  const navigate = useNavigate();

  const handleHomeClick = () => {
    navigate("/admin/home");
  };

  const handleDashboardClick = () => {
    navigate("/admin/dashboard");
  };

  const handleCandidatesClick = () => {
    navigate("/admin/candidates");
  };

  const handleProjectsClick = () => {
    navigate("/admin/projects");
  };

  return (
    <List
      size="sm"
      sx={{
        gap: 1,
        "--List-nestedInsetStart": "30px",
        "--ListItem-radius": (theme) => theme.vars.radius.sm,
      }}
    >
      <ListItem>
        <ListItemButton onClick={handleHomeClick}>
          <HomeRounded />
          <ListItemContent>
            <Typography level="title-sm">Home</Typography>
          </ListItemContent>
        </ListItemButton>
      </ListItem>

      <ListItem>
        <ListItemButton onClick={handleDashboardClick}>
          <DashboardRounded />
          <ListItemContent>
            <Typography level="title-sm">Dashboard</Typography>
          </ListItemContent>
        </ListItemButton>
      </ListItem>

      <ListItem>
        <ListItemButton onClick={handleProjectsClick}>
          <AccountTree />
          <ListItemContent>
            <Typography level="title-sm">Projects</Typography>
          </ListItemContent>
        </ListItemButton>
      </ListItem>

      <ListItem>
        <ListItemButton onClick={handleCandidatesClick}>
          <Group />
          <ListItemContent>
            <Typography level="title-sm">Candidates</Typography>
          </ListItemContent>
        </ListItemButton>
      </ListItem>
    </List>
  );
}

function UserList() {
  const navigate = useNavigate();

  const handleHomeClick = () => {
    navigate("/user/home");
  };

  const handleShiftClick = () => {
    navigate("/user/shift");
  };

  const handleLeaveClick = () => {
    navigate("/user/leave");
  };

  const handleClaimsClick = () => {
    navigate("/user/claims");
  };

  return (
    <List
      size="sm"
      sx={{
        gap: 1,
        "--List-nestedInsetStart": "30px",
        "--ListItem-radius": (theme) => theme.vars.radius.sm,
      }}
    >
      <ListItem>
        <ListItemButton onClick={handleHomeClick}>
          <HomeRounded />
          <ListItemContent>
            <Typography level="title-sm">Home</Typography>
          </ListItemContent>
        </ListItemButton>
      </ListItem>

      <ListItem>
        <ListItemButton onClick={handleShiftClick}>
          <DashboardRounded />
          <ListItemContent>
            <Typography level="title-sm">Shifts</Typography>
          </ListItemContent>
        </ListItemButton>
      </ListItem>

      <ListItem>
        <ListItemButton onClick={handleLeaveClick}>
          <Accessibility />
          <ListItemContent>
            <Typography level="title-sm">Leave</Typography>
          </ListItemContent>
        </ListItemButton>
      </ListItem>

      <ListItem>
        <ListItemButton onClick={handleClaimsClick}>
          <ReceiptLong />
          <ListItemContent>
            <Typography level="title-sm">Claims</Typography>
          </ListItemContent>
        </ListItemButton>
      </ListItem>
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
