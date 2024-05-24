import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import LoginAdmin from './login/login-admin';
import LoginUser from './login/login-user';
import PrivateRoutes from './utils/private-route';
import MyProfile from './components/MyProfile';
import Box from '@mui/joy/Box';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import { useEffect } from 'react';
import AdminProjects from './admin/Projects';
import AdminHome from './admin/Home';
import AdminCandidates from './admin/Candidates';

function App() {
  const location = useLocation();
  const hideSidebarRoutes = ['/', '/admin', '/user'];

  const shouldHideSidebar = hideSidebarRoutes.includes(location.pathname);

  useEffect(() => {
    document.title = "Your App Title"; // Set a title for your app
  }, []);

  return (
    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100dvh' }}>
        {!shouldHideSidebar && <Sidebar />}
        {!shouldHideSidebar && <Header />}

        <Box
          component="main"
          className="MainContent"
          sx={{
            pt: { xs: 'calc(12px + var(--Header-height))', md: 3 },
            pb: { xs: 2, sm: 2, md: 3 },
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            height: '100dvh',
            gap: 1,
            overflow: 'auto',
          }}
        >
          <Routes>
            {/* login routes */}
            <Route path="/" element={<LoginUser />} />
            <Route path="/admin" element={<LoginAdmin />} />
            <Route path="/test" element={<MyProfile />} />

            {/* admin routes */}
            <Route element={<PrivateRoutes />}>
              <Route path='/admin/home' element={<AdminHome />} />
              <Route path='/admin/projects' element={<AdminProjects />} />
              <Route path='/admin/candidates' element={<AdminCandidates />} />
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
