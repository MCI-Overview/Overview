import {
  HashRouter as Router,
  Route,
  Routes,
  useLocation,
  Navigate,
} from "react-router-dom";
import { CircularProgress, CssBaseline, Box, CssVarsProvider } from "@mui/joy";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import axios from "axios";
import axiosRetry from "axios-retry";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import isoWeek from "dayjs/plugin/isoWeek";
import isBetween from "dayjs/plugin/isBetween";
import customParseFormat from "dayjs/plugin/customParseFormat";

import { PrivateAdminRoutes, PrivateUserRoutes } from "./utils/private-route";
import { ProjectContextProvider } from "./providers/projectContextProvider";
import { UserContextProvider } from "./providers/userContextProvider";
import { RemoveTrailingSlash } from "./utils/remove-trailing-slash";
import AdminCandidates from "./admin/Candidates";
import UserRequests from "./user/UserRequests";
import CandidateProfile from "./user/Profile";
import LoadUser from "./components/LoadUser";
import UserProjects from "./user/UserProjects";
import AdminHome from "./admin/Home";
import Sidebar from "./components/Sidebar";
import UserShifts from "./user/UserShifts";
import Header from "./components/Header";
import UserHome from "./user/UserHome";
import Project from "./admin/Project";
import OnboardingPage from "./user/onboarding/OnboardingPage";
import NotFound from "./components/NotFound";
import GatewayTimeout from "./components/GatewayTimeout";
import Login from "./login/Login";

dayjs.extend(isBetween);
dayjs.extend(isoWeek);
dayjs.extend(utc);
dayjs.extend(customParseFormat);

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

function App() {
  const location = useLocation();
  const hideSidebarRoutes = ["/", "/admin", "/user/new", "/404", "/504"];
  const shouldHideSidebar = hideSidebarRoutes.includes(location.pathname);

  useEffect(() => {
    document.title = "Overview";
  }, []);

  axios.defaults.baseURL = SERVER_URL;
  axios.defaults.withCredentials = true;
  axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

  const [loading, setLoading] = useState(true);

  const startTime = Date.now();

  function setLoadingFalse() {
    const elapsedTime = Date.now() - startTime;
    const remainingTime = Math.max(0, 1000 - elapsedTime);

    setTimeout(() => {
      setLoading(false);
    }, remainingTime);
  }

  return (
    <CssVarsProvider disableTransitionOnChange>
      <UserContextProvider>
        {loading && (
          <Box
            sx={{ display: "flex", width: "100dvw", height: "100dvh" }}
            justifyContent="center"
            alignItems="center"
          >
            <LoadUser setLoadingFalse={setLoadingFalse} />
            <CircularProgress />
          </Box>
        )}
        {!loading && (
          <>
            <CssBaseline />
            <Box sx={{ display: "flex", minHeight: "100dvh" }}>
              {!shouldHideSidebar && <Sidebar />}
              {!shouldHideSidebar && <Header />}

              <Box
                component="main"
                className="MainContent"
                sx={{
                  pt: { xs: "calc(12px + var(--Header-height))", md: 3 },
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  minWidth: 0,
                  height: "100dvh",
                  gap: 1,
                  overflow: "auto",
                }}
              >
                <RemoveTrailingSlash />
                <ProjectContextProvider>
                  <Routes>
                    <Route element={<PrivateUserRoutes />}>
                      <Route path="/" element={<Login />} />
                      <Route path="/user/new" element={<OnboardingPage />} />
                      <Route path="/user/home" element={<UserHome />} />
                      <Route path="/user/requests" element={<UserRequests />} />
                      <Route
                        path="/user/profile"
                        element={<CandidateProfile />}
                      />
                      <Route path="/user/shifts" element={<UserShifts />} />
                      <Route path="/user/projects" element={<UserProjects />} />
                    </Route>

                    {/* Admin routes */}

                    <Route element={<PrivateAdminRoutes />}>
                      <Route path="/admin/home" element={<AdminHome />} />
                      <Route
                        path="/admin/project/:projectCuid?"
                        element={<Project />}
                      />
                      <Route
                        path="/admin/candidates"
                        element={<AdminCandidates />}
                      />
                      <Route
                        path="/admin/candidate/:candidateCuid"
                        element={<CandidateProfile />}
                      />
                    </Route>

                    <Route path="*" element={<Navigate to="/404" />} />
                    <Route path="/404" element={<NotFound />} />
                    <Route path="/504" element={<GatewayTimeout />} />
                  </Routes>
                </ProjectContextProvider>
              </Box>
            </Box>
          </>
        )}
      </UserContextProvider>
    </CssVarsProvider>
  );
}

function AppWithRouter() {
  return (
    <Router>
      <Toaster />
      <App />
    </Router>
  );
}

export default AppWithRouter;
