// ./login/choose-role.tsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Tab, TabBar } from "../components/TabBar";
import { Typography, Box } from "@mui/joy";
import {
  AdminBreadcrumb,
  BreadcrumbPart,
} from "../components/project/ui/AdminBreadcrumb";
import MyProjects from "./projects-components/my-projects";
import CreateProjectPage from "../components/project/create/Page";

const tabs: Tab[] = [
  {
    label: "Projects",
    content: <MyProjects />,
  },
  {
    label: "Create",
    content: <CreateProjectPage />,
  },
  {
    label: "Plan",
    content: <div>Plan</div>,
  },
];

const AdminProjects: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [tabValue, setTabValue] = useState<number>(0);

  const breadcrumbs: BreadcrumbPart[] = [
    {
      label: "Projects",
      link: "/admin/projects",
    },
  ];

  useEffect(() => {
    const hash = location.hash.replace("#", "");
    switch (hash) {
      case "create":
        setTabValue(1);
        break;
      case "plan":
        setTabValue(2);
        break;
      default:
        setTabValue(0);
        break;
    }
  }, [location.hash]);

  const handleTabChange = (
    _event: React.SyntheticEvent<Element, Event> | null,
    newValue: string | number | null,
  ) => {
    if (newValue === null || typeof newValue === "string") return;
    setTabValue(newValue);
    switch (newValue) {
      case 0:
        navigate("/admin/projects");
        break;
      case 1:
        navigate("/admin/projects#create");
        break;
      case 2:
        navigate("/admin/projects#plan");
        break;
      case 3:
        navigate("/admin/projects#billing");
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
          <Typography level="h2" component="h1" sx={{ mt: 1, mb: 2 }}>
            Projects
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

export default AdminProjects;
