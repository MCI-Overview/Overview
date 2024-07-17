import { useEffect, useState } from "react";
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import Settings from "./Settings.tsx";
import {
  AdminBreadcrumb,
  BreadcrumbPart,
} from "../components/project/ui/AdminBreadcrumb";
import { Tab, TabBar } from "../components/TabBar";
import { useProjectContext } from "../providers/projectContextProvider";
import TimetablePage from "../components/project/roster/TimetablePage.tsx";
import ProjectOverview from "../components/project/overview/OverviewPage.tsx";
import AdminRequestsPage from "../components/project/requests/AdminRequestsPage.tsx";
import AdminProjectCandidatesPage from "../components/project/candidates/AdminProjectCandidatesPage.tsx";
import AdminProjectAttendancePage from "../components/project/attendance/AdminProjectAttendancePage.tsx";

import { Typography, Box } from "@mui/joy";
import { useUserContext } from "../providers/userContextProvider.tsx";

const AdminProjects = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { projectCuid } = useParams();
  const { user } = useUserContext();
  const { project, updateProject } = useProjectContext();

  const [tabValue, setTabValue] = useState<number>(0);

  const tabs: (Tab & {
    clientHolderOnly: boolean;
  })[] = [
    {
      label: "Overview",
      content: <ProjectOverview />,
      clientHolderOnly: false,
    },
    {
      label: "Attendance",
      content: <AdminProjectAttendancePage />,
      clientHolderOnly: false,
    },
    {
      label: "Candidates",
      content: <AdminProjectCandidatesPage />,
      clientHolderOnly: false,
    },
    {
      label: "Requests",
      content: (
        <AdminRequestsPage
          baseURL={`/api/admin/project/${project?.cuid}/requests`}
        />
      ),
      clientHolderOnly: true,
    },
    {
      label: "Timetable",
      content: <TimetablePage />,
      clientHolderOnly: false,
    },
    {
      label: "Settings",
      content: <Settings />,
      clientHolderOnly: false,
    },
  ];

  const filteredTabs = tabs.filter(
    (tab) =>
      project?.consultants.find((c) => c.cuid === user?.cuid)?.role ===
        "CLIENT_HOLDER" || !tab.clientHolderOnly
  );

  useEffect(() => {
    updateProject(projectCuid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.title = `${project?.name} - Overview`;
  }, [project]);

  useEffect(() => {
    const hash = location.hash.replace("#", "");
    switch (hash) {
      case "attendance":
        setTabValue(1);
        break;
      case "candidates":
        setTabValue(2);
        break;
      case "requests":
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
      link: "/admin/home",
    },
    {
      label: project?.name,
      link: `/admin/project/${project?.cuid}`,
    },
  ];

  const handleTabChange = (
    _event: React.SyntheticEvent<Element, Event> | null,
    newValue: string | number | null
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
        navigate(`/admin/project/${project.cuid}#requests`);
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
          tabs={filteredTabs}
        />
      </Box>
    </Box>
  );
};

export default AdminProjects;
