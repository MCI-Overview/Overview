import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import LoginAdmin from "./login/login-admin";
import LoginUser from "./login/login-user";
import AdminPrivateRoutes from "./utils/admin-private-route";
import Box from "@mui/joy/Box";
import Sidebar from "./components/Sidebar";
import SidebarUser from "./components/SidebarUser";
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
import { Toaster } from "react-hot-toast";
import UserNew from "./user/UserNew";
import UserHome from "./user/UserHome";
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

function App() {
  const location = useLocation();
  const hideSidebarRoutes = ["/", "/admin", "/user/new"];
  const shouldHideSidebar = hideSidebarRoutes.includes(location.pathname);
  const isUserRoute = location.pathname.startsWith("/user");

  useEffect(() => {
    document.title = "Overview";
  }, []);

  axios.defaults.baseURL = "http://localhost:3000";
  axios.defaults.withCredentials = true;

  return (
    <DndProvider backend={HTML5Backend}>
      <CssVarsProvider disableTransitionOnChange>
        <CssBaseline />
        <Box sx={{ display: "flex", minHeight: "100dvh" }}>
          {!isUserRoute && !shouldHideSidebar && <Sidebar />}
          {!shouldHideSidebar && <Header />}
          {isUserRoute && !shouldHideSidebar && <SidebarUser />}

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
              {/* <Route element={<UserPrivateRoutes />}>
              <Route path="/user" element={<LoginUser />} />
              <Route path="/user/home" element={<MyProfile />} />
            </Route> */}

              <Route path="/" element={<LoginUser />} />
              <Route path="/user/new" element={<UserNew />} />
              <Route path="/user/home" element={<UserHome />} />

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
    </DndProvider >
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
