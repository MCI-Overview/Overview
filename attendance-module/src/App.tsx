// App.tsx
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SelectRole from './login/select-role';
import LoginAdmin from './login/login-admin';
import LoginUser from './login/login-user';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SelectRole />} />
        <Route path="/admin" element={<LoginAdmin />} />
        <Route path="/user" element={<LoginUser />} />
      </Routes>
    </Router>
  );
}

export default App;
