// ./login/choose-role.tsx
import React from 'react';

const AdminDashboard: React.FC = () => {
  return (
    <>
        <div>
            Admin Dashboard
        </div>
        <div>
            Add a new project
        </div>

        <select>
            <option>Select project</option>
        </select>
        <button>Import project from ELOA</button><br></br>

        <button>Create new project</button>

        <div>
            Select existing projects
        </div>
    </>
  );
};

export default AdminDashboard;
