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
import CandidateDetails from "../components/profile/details/Page";
import { useUserContext } from "../providers/userContextProvider";

const CandidateProfile: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  let { candidateCuid } = useParams();
  const { user } = useUserContext();

  const [tabValue, setTabValue] = useState<number>(0);

  if (!user) return <Navigate to="/login" />;

  if (user.userType === "User") {
    // candidate can only access their own profile
    candidateCuid = user.cuid;
  } else if (!candidateCuid) {
    // consultantCuid needs to specify candidateCuid
    return <Navigate to="/admin/candidates" />;
  }

  const breadcrumbs: BreadcrumbPart[] = [
    {
      label: "profile",
      link: `/admin/candidate/${candidateCuid}`,
    },
  ];

  useEffect(() => {
    const hash = location.hash.replace("#", "");
    switch (hash) {
      case "create":
        setTabValue(1);
        break;
      default:
        setTabValue(0);
        break;
    }
  }, [location.hash]);

  if (user.userType !== "Admin") return null;

  const tabs: Tab[] = [
    {
      label: "Details",
      content: <CandidateDetails />,
    },
    {
      label: "Requests",
      content: <div>Requests</div>,
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
        navigate(`/admin/candidate/${candidateCuid}`);
        break;
      case 1:
        navigate(`/admin/candidate/${candidateCuid}#requests`);
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
            Candidate Profile
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

export default CandidateProfile;
