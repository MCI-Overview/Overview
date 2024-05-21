// App.tsx
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SelectRole from './login/select-role';
import LoginAdmin from './login/login-admin';
import LoginUser from './login/login-user';
import AdminDashboard from './admin/dashboard';
<<<<<<< HEAD
import Navbar from './components/Navbar';
import Footer from './components/Footer';
=======
import ImportProject from './import/import-project-page';
>>>>>>> 8e30d1b18ef0e3f65701f19be96b9bec8afe15d7
import PrivateRoutes from './utils/private-route'

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* login routes */}
        <Route path="/" element={<SelectRole />} />
        <Route path="/admin" element={<LoginAdmin />} />
        <Route path="/user" element={<LoginUser />} />

        {/* admin routes */}
        <Route element={<PrivateRoutes />}>
          <Route path='/admin/dashboard' element={<AdminDashboard />} />
          <Route path='/admin/import' element={<ImportProject />} />
        </Route>
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
