import { FC, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Tab, TabBar } from "../components/TabBar";

import { Typography, Box } from "@mui/joy";
import {
  UserBreadcrumb,
  BreadcrumbPart,
} from "../components/project/ui/UserBreadcrumb";
import JoinedProjects from "../components/user/projects/JoinedProjects";

const tabs: Tab[] = [
  {
    label: "Joined",
    content: <JoinedProjects />,
  },
];

const UserProjects: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [tabValue, setTabValue] = useState<number>(0);

  const breadcrumbs: BreadcrumbPart[] = [
    {
      label: "Projects",
      link: "/user/projects",
    },
  ];

  useEffect(() => {
    const hash = location.hash.replace("#", "");
    switch (hash) {
      case "joined":
        setTabValue(1);
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
        navigate("/user/projects");
        break;
      default:
        break;
    }
  };

  return (
    <>
      <Box sx={{ flex: 1, width: "100%" }}>
        <Box
          sx={{
            position: "sticky",
            top: { sm: -100, md: -110 },
            color: "white",
          }}
        >
          <Box sx={{ px: { xs: 2, md: 6 } }}>
            <UserBreadcrumb breadcrumbs={breadcrumbs} />
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
    </>
  );
};

export default UserProjects;
