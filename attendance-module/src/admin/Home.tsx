import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Tab, TabBar } from "../components/TabBar";
import { Typography, Box } from "@mui/joy";
import {
  AdminBreadcrumb,
  BreadcrumbPart,
} from "../components/project/ui/AdminBreadcrumb";
import MyProjects from "../components/project/MyProjects";
import AllProjects from "../components/project/AllProjects";

const tabs: Tab[] = [
  {
    label: "My projects",
    content: <MyProjects />,
  },
  {
    label: "All projects",
    content: <AllProjects />,
  },
];

const AdminProjects = () => {
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
          <Typography level="h2" component="h1" sx={{ mt: 1, mb: 2 }}>
            Home
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
