import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  AdminBreadcrumb,
  BreadcrumbPart,
} from "../components/project/ui/AdminBreadcrumb";
import { Tab, TabBar } from "../components/TabBar";
import MyCandidatesPage from "../components/candidates/MyCandidatesPage";

import { Typography, Box, Stack } from "@mui/joy";
import { PeopleRounded as PeopleIcon } from "@mui/icons-material";

const tabs: Tab[] = [
  {
    label: "Candidates",
    content: <MyCandidatesPage />,
  },
];

const AdminCandidates = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [tabValue, setTabValue] = useState<number>(0);

  const breadcrumbs: BreadcrumbPart[] = [
    {
      label: "Candidates",
      link: "/admin/candidates",
    },
  ];

  useEffect(() => {
    const hash = location.hash.replace("#", "");
    switch (hash) {
      default:
        setTabValue(0);
        break;
    }
  }, [location.hash]);

  useEffect(() => {
    document.title = "Candidates - Overview";
  }, []);

  const handleTabChange = (
    _event: React.SyntheticEvent<Element, Event> | null,
    newValue: string | number | null
  ) => {
    if (newValue === null || typeof newValue === "string") return;
    setTabValue(newValue);
    switch (newValue) {
      case 0:
        navigate("/admin/candidates");
        break;
      default:
        break;
    }
  };

  return (
    <Box
      sx={{
        flex: 1,
        width: "100%",
        position: "sticky",
        top: { sm: -100, md: -110 },
        bgcolor: "background.body",
        zIndex: 12,
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
            <PeopleIcon />
            Candidates
          </Stack>
        </Typography>
      </Box>

      <TabBar
        tabValue={tabValue}
        handleTabChange={handleTabChange}
        tabs={tabs}
      />
    </Box>
  );
};

export default AdminCandidates;
