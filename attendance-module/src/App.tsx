import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import LoginAdmin from "./login/login-admin";
import LoginUser from "./login/login-user";
import UserPrivateRoutes from "./utils/user-private-route";
import AdminPrivateRoutes from "./utils/admin-private-route";
import MyProfile from "./components/MyProfile";
import Box from "@mui/joy/Box";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { CssVarsProvider } from "@mui/joy/styles";
import CssBaseline from "@mui/joy/CssBaseline";
import { useEffect } from "react";
import AdminProjects from "./admin/Projects";
import AdminHome from "./admin/Home";
import AdminCandidates from "./admin/Candidates";
import axios from "axios";
import { RemoveTrailingSlash } from "./utils/remove-trailing-slash";
import Project from "./admin/Project";

function App() {
  const location = useLocation();
  const hideSidebarRoutes = ["/", "/admin", "/user"];
  const shouldHideSidebar = hideSidebarRoutes.includes(location.pathname);

  useEffect(() => {
    document.title = "Overview";
  }, []);

  axios.defaults.baseURL = "http://localhost:3000";
  axios.defaults.withCredentials = true;

  return (
    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />
      <Box sx={{ display: "flex", minHeight: "100dvh" }}>
        {!shouldHideSidebar && <Sidebar />}
        {!shouldHideSidebar && <Header />}

        <Box
          component="main"
          className="MainContent"
          sx={{
            pt: { xs: "calc(12px + var(--Header-height))", md: 3 },
            pb: { xs: 2, sm: 2, md: 3 },
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
          <Routes>
            {/* User routes */}
            <Route element={<UserPrivateRoutes />}>
              <Route path="/user" element={<LoginUser />} />
              <Route path="/user/home" element={<MyProfile />} />
            </Route>

            {/* Admin routes */}
            <Route element={<AdminPrivateRoutes />}>
              <Route path="/admin" element={<LoginAdmin />} />
              <Route path="/admin/home" element={<AdminHome />} />
              <Route path="/admin/project/:projectId?" element={<Project />} />
              <Route path="/admin/projects" element={<AdminProjects />} />
              <Route path="/admin/candidates" element={<AdminCandidates />} />
            </Route>
          </Routes>
        </Box>
      </Box>
    </CssVarsProvider>
  );
}

function AppWithRouter() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWithRouter;
