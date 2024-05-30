// ./login/choose-role.tsx
import { useEffect, useState } from "react";
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { Tab, TabBar } from "../components/TabBar";
import { Typography, Box, CircularProgress } from "@mui/joy";
import {
  AdminBreadcrumb,
  BreadcrumbPart,
} from "../components/project/ui/AdminBreadcrumb";
import axios from "axios";
import ProjectOverview from "./projects-components/overview-tab-components/project-overview";
import AssignCandidatePage from "../components/project/candidates/Page";
import RosterPage from "../components/project/manage/Roster";
import { useProjectContext } from "../providers/projectContextProvider";

const tabs: Tab[] = [
  {
    label: "Overview",
    content: <ProjectOverview />,
  },
  {
    label: "Attendance",
    content: <div>Attendance</div>,
  },
  {
    label: "Candidates",
    content: <AssignCandidatePage />,
  },
  {
    label: "Roster",
    content: <RosterPage />,
  },
];

const AdminProjects: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const projectCuid = useParams().projectCuid;

  const { project, setProject } = useProjectContext();

  const [tabValue, setTabValue] = useState<number>(0);

  const breadcrumbs: BreadcrumbPart[] = [
    {
      label: "Projects",
      link: "/admin/projects",
    },
    {
      label: project?.name,
      link: `/admin/project/${projectCuid}`,
    },
  ];

  useEffect(() => {
    setProject(null);

    if (!projectCuid) return;

    axios.get(`/api/admin/project/${projectCuid}`).then((res) => {
      setProject(res.data);
    });
  }, [projectCuid, setProject]);

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

  if (!projectCuid) return <Navigate to="/admin/projects" />;

  if (!project) return null;

  const handleTabChange = (
    _event: React.SyntheticEvent<Element, Event> | null,
    newValue: string | number | null,
  ) => {
    if (newValue === null || typeof newValue === "string") return;
    setTabValue(newValue);
    switch (newValue) {
      case 0:
        navigate(`/admin/project/${projectCuid}`);
        break;
      case 1:
        navigate(`/admin/project/${projectCuid}#attendance`);
        break;
      case 2:
        navigate(`/admin/project/${projectCuid}#candidates`);
        break;
      case 3:
        navigate(`/admin/project/${projectCuid}#roster`);
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
            {project?.name}
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
