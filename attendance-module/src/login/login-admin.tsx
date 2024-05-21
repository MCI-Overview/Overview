import React from "react";

const serverLink = "http://localhost:3000";

const AdminLogin: React.FC = () => {
  return (
    <div className="container-fluid bodyBg-ctn">
      <div className="col col-12 col-sm-9 col-md-7 col-lg-6 col-xl-5 body-ctnAttendance">
          <h1>Sign in as admin</h1>
          <a href={`${serverLink}/admin/login`}>
            <img src="/microsoft-login.svg" alt="Microsoft Login" />
          </a>
      </div>
    </div>
  );
};

export default AdminLogin;