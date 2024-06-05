// ./login/choose-role.tsx
import { useEffect, useState } from "react";
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
import ProjectOverview from "../components/project/overview/Page";
import AssignCandidatePage from "../components/project/candidates/Page";
import RosterPage from "../components/project/roster/RosterPage";
import { useProjectContext } from "../providers/projectContextProvider";
import ShiftPage from "../components/project/shift/ShiftPage";
import Settings from "./Settings.tsx";

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
    label: "Shifts",
    content: <ShiftPage />,
  },
  {
    label: "Roster",
    content: <RosterPage />,
  },
  {
    label: "Settings",
    content: <Settings />,
  },
];

const AdminProjects: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { projectCuid } = useParams();
  const { project, updateProject } = useProjectContext();

  const [tabValue, setTabValue] = useState<number>(0);

  useEffect(() => updateProject(projectCuid), []);

  useEffect(() => {
    const hash = location.hash.replace("#", "");
    switch (hash) {
      case "attendance":
        setTabValue(1);
        break;
      case "candidates":
        setTabValue(2);
        break;
      case "shifts":
        setTabValue(3);
        break;
      case "roster":
        setTabValue(4);
        break;
      case "settings":
        setTabValue(5);
        break;
      default:
        setTabValue(0);
        break;
    }
  }, [location.hash]);

  if (!projectCuid) return <Navigate to="/admin/projects" />;

  if (!project) return null;

  const breadcrumbs: BreadcrumbPart[] = [
    {
      label: "Projects",
      link: "/admin/projects",
    },
    {
      label: project?.name,
      link: `/admin/project/${project?.cuid}`,
    },
  ];

  const handleTabChange = (
    _event: React.SyntheticEvent<Element, Event> | null,
    newValue: string | number | null,
  ) => {
    if (newValue === null || typeof newValue === "string") return;
    setTabValue(newValue);
    switch (newValue) {
      case 0:
        navigate(`/admin/project/${project.cuid}`);
        break;
      case 1:
        navigate(`/admin/project/${project.cuid}#attendance`);
        break;
      case 2:
        navigate(`/admin/project/${project.cuid}#candidates`);
        break;
      case 3:
        navigate(`/admin/project/${project.cuid}#shifts`);
        break;
      case 4:
        navigate(`/admin/project/${project.cuid}#roster`);
        break;
      case 5:
        navigate(`/admin/project/${project.cuid}#settings`);
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
