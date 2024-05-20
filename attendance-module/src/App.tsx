// App.tsx
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SelectRole from './login/select-role';
import LoginAdmin from './login/login-admin';
import LoginUser from './login/login-user';
import AdminDashboard from './admin/dashboard';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

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
        <Route path='/admin/dashboard' element={<AdminDashboard />} />
        <Footer />

      </Routes>
    </Router>
  );
}

export default App;
