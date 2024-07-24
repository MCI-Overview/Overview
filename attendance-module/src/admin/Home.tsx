import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  AdminBreadcrumb,
  BreadcrumbPart,
} from "../components/project/ui/AdminBreadcrumb";
import { Tab, TabBar } from "../components/TabBar";

import { Box, Stack, Typography } from "@mui/joy";
import { HomeRounded as HomeIcon } from "@mui/icons-material";
import AdminProjects from "../components/project/AdminProjects";

const tabs: Tab[] = [
  {
    label: "My projects",
    content: <AdminProjects apiURL="/api/admin/projects" />,
  },
  {
    label: "All projects",
    content: <AdminProjects apiURL="/api/admin/projects/all" />,
  },
];

const AdminHome = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [tabValue, setTabValue] = useState<number>(0);

  const breadcrumbs: BreadcrumbPart[] = [
    {
      label: "Home",
      link: "/admin/home",
    },
  ];

  useEffect(() => {
    const hash = location.hash.replace("#", "");
    switch (hash) {
      case "all":
        setTabValue(1);
        break;
      default:
        setTabValue(0);
        break;
    }
  }, [location.hash]);

  useEffect(() => {
    document.title = "Home - Overview";
  }, []);

  const handleTabChange = (
    _event: React.SyntheticEvent<Element, Event> | null,
    newValue: string | number | null
  ) => {
    if (newValue === null || typeof newValue === "string") return;
    setTabValue(newValue);
    switch (newValue) {
      case 0:
        navigate("/admin/home");
        break;
      case 1:
        navigate("/admin/home#all");
        break;
      default:
        break;
    }
  };

  return (
    <Box sx={{ flex: 1, width: "100%" }}>
      <Box
        sx={{
          position: "sticky",
          top: { sm: -100, md: -110 },
          bgcolor: "background.body",
        }}
      >
        <Box sx={{ px: { xs: 2, md: 6 } }}>
          <AdminBreadcrumb breadcrumbs={breadcrumbs} />
          <Typography
            level="h2"
            component="h1"
            sx={{ mt: 1, mb: 2, display: "flex", alignItems: "center" }}
          >
            <Stack direction="row" gap={1}>
              <HomeIcon />
              Home
            </Stack>
          </Typography>
        </Box>
        <TabBar
          tabValue={tabValue}
          handleTabChange={handleTabChange}
          tabs={tabs}
        />
      </Box>
    </Box>
  );
};

export default AdminHome;
