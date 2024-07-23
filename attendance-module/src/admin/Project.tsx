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
import { useUserContext } from "../providers/userContextProvider.tsx";

import { RefreshRounded as RefreshIcon } from "@mui/icons-material";

import { Typography, Box, IconButton } from "@mui/joy";

const AdminProjects = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { projectCuid } = useParams();
  const { user } = useUserContext();
  const { project, updateProject } = useProjectContext();

  const [tabValue, setTabValue] = useState<number>(0);

  const tabs: (Tab & {
    clientHolderOnly: boolean;
    hash: string;
  })[] = [
    {
      label: "Overview",
      content: <ProjectOverview />,
      clientHolderOnly: false,
      hash: "",
    },
    {
      label: "Attendance",
      content: <AdminProjectAttendancePage />,
      clientHolderOnly: false,
      hash: "attendance",
    },
    {
      label: "Candidates",
      content: <AdminProjectCandidatesPage />,
      clientHolderOnly: false,
      hash: "candidates",
    },
    {
      label: "Requests",
      content: (
        <AdminRequestsPage
          baseURL={`/api/admin/project/${project?.cuid}/requests`}
        />
      ),
      clientHolderOnly: true,
      hash: "requests",
    },
    {
      label: "Timetable",
      content: <TimetablePage />,
      clientHolderOnly: false,
      hash: "roster",
    },
    {
      label: "Settings",
      content: <Settings />,
      clientHolderOnly: false,
      hash: "settings",
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
    const index = filteredTabs.findIndex((tab) => tab.hash === hash);

    setTabValue(index === -1 ? 0 : index);
  }, [filteredTabs, location.hash]);

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
    navigate(
      `/admin/project/${project.cuid}${
        filteredTabs[newValue].hash ? `#${filteredTabs[newValue].hash}` : ""
      }`
    );
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
            sx={{
              mt: 1,
              mb: 2,
              display: "flex",
              gap: 0.5,
            }}
          >
            {project?.name}
            <IconButton
              onClick={() => {
                updateProject();
              }}
            >
              <RefreshIcon />
            </IconButton>
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
