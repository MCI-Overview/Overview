// ./login/choose-role.tsx
import React, { useEffect, useState } from "react";
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { Tab, TabBar } from "../components/TabBar";
import { Typography, Box } from "@mui/joy";
import {
  AdminBreadcrumb,
  BreadcrumbPart,
} from "../components/project/ui/AdminBreadcrumb";
import { Project } from "../types";
import axios from "axios";
import RosterPage from "../components/project/manage/Roster";

const tabs: Tab[] = [
  {
    label: "Overview",
    content: <div>Overview</div>,
  },
  {
    label: "Attendance",
    content: <div>Attendance</div>,
  },
  {
    label: "Candidates",
    content: <div>Candidates</div>,
  },
  {
    label: "Roster",
    content: <RosterPage />,
  },
];

const AdminProjects: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const projectId = useParams().projectId;

  const [tabValue, setTabValue] = useState<number>(0);
  const [projectDetails, setProjectDetails] = useState<Project | null>(null);

  const breadcrumbs: BreadcrumbPart[] = [
    {
      label: "Projects",
      link: "/admin/projects",
    },
    {
      label: projectDetails?.name || "No Project Title",
      link: `/admin/project/${projectId}`,
    },
  ];

  useEffect(() => {
    const hash = location.hash.replace("#", "");
    switch (hash) {
      case "attendance":
        setTabValue(1);
        break;
      case "candidates":
        setTabValue(2);
        break;
      case "roster":
        setTabValue(3);
        break;
      default:
        setTabValue(0);
        break;
    }
  }, [location.hash]);

  useEffect(() => {
    if (!projectId) return;

    axios.get(`/api/admin/project/${projectId}`).then((res) => {
      setProjectDetails(res.data);
    });
  }, [projectId]);

  if (!projectId) {
    return <Navigate to="/admin/projects" />;
  }

  const handleTabChange = (
    _event: React.SyntheticEvent<Element, Event> | null,
    newValue: string | number | null,
  ) => {
    if (newValue === null || typeof newValue === "string") return;
    setTabValue(newValue);
    switch (newValue) {
      case 0:
        navigate(`/admin/project/${projectId}`);
        break;
      case 1:
        navigate(`/admin/project/${projectId}#attendance`);
        break;
      case 2:
        navigate(`/admin/project/${projectId}#candidates`);
        break;
      case 3:
        navigate(`/admin/project/${projectId}#roster`);
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
            {projectDetails?.name}
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
