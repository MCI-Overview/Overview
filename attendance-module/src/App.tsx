// App.tsx
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SelectRole from './login/select-role';
import LoginAdmin from './login/login-admin';
import LoginUser from './login/login-user';
import AdminDashboard from './admin/dashboard';
import ImportProject from './import/import-project-page';

function App() {
  return (
    <Router>
      <Routes>
        {/* login routes */}
        <Route path="/" element={<SelectRole />} />
        <Route path="/admin" element={<LoginAdmin />} />
        <Route path="/user" element={<LoginUser />} />

        {/* admin routes */}
        <Route path='/admin/dashboard' element={<AdminDashboard />} />
        <Route path='/admin/import' element={<ImportProject />} />


      </Routes>
    </Router>
  );
}

export default App;
