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
import ProfilePage from "../components/profile/details/ProfilePage";
import { useUserContext } from "../providers/userContextProvider";

const CandidateProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  let { candidateCuid } = useParams();
  const { user } = useUserContext();

  const [tabValue, setTabValue] = useState<number>(0);

  useEffect(() => {
    const hash = location.hash.replace("#", "");
    switch (hash) {
      case "requests":
        setTabValue(1);
        break;
      default:
        setTabValue(0);
        break;
    }
  }, [location.hash]);

  if (!user) return <Navigate to="/" />;

  const isAdmin = user.userType === "Admin";
  const path = isAdmin ? `/admin/candidate/${candidateCuid}` : "/user/profile";

  if (!isAdmin) {
    // candidate can only access their own profile
    candidateCuid = user.cuid;
  } else if (!candidateCuid) {
    // consultantCuid needs to specify candidateCuid
    return <Navigate to="/admin/candidates" />;
  }

  const breadcrumbs: BreadcrumbPart[] = [
    {
      label: "Profile",
      link: path,
    },
  ];

  const tabs: Tab[] = [
    {
      label: "Details",
      content: <ProfilePage />,
    },
    {
      label: "Requests",
      content: <div>Requests</div>,
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
        navigate(path);
        break;
      case 1:
        navigate(`${path}#requests`);
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
            {isAdmin ? "Candidate Profile" : "Your Profile"}
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
