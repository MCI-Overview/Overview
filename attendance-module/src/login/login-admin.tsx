import React from "react";

const serverLink = "http://localhost:3000";

const AdminLogin: React.FC = () => {
  return (
    <div>
      <h1>Sign in as admin</h1>
      <a href={`${serverLink}/admin/login`}>
        <img src="/microsoft-login.svg" alt="Microsoft Login" />
      </a>
    </div>
  );
};

export default AdminLogin;