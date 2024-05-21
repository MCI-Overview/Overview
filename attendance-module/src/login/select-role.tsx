// ./login/choose-role.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const SelectRole: React.FC = () => {
  return (
    <div className="container-fluid bodyBg-ctn">
      <div className="col col-12 col-sm-9 col-md-7 col-lg-6 col-xl-5 body-ctnAttendance">
        <h1 className="f-bold mt-5 mb-5">Select Your Role</h1>
        <p className="text-center mt-2 mb-5">MCI consultant will log in as admin using<br></br> your Microsoft Authentication</p>
        <Link to='/admin'>
          <button className="btn-AdminLogin">
            <p className="p-otpBtn f-bold">Login as admin (MCI Consultant)
            </p>
          </button>
        </Link>

        <Link to='/user'>
          <button className="btn-UserLogin">
            <p className="p-userBtn f-bold">Login as user
            </p>
          </button>
        </Link><br></br>
      </div>
    </div>
  );
};

export default SelectRole;
