// ./login/choose-role.tsx
import React from 'react';

const SelectRole: React.FC = () => {
  return (
    <div>
      <h1>Choose Your Role</h1>
      <a href='/admin'>Login as admin</a><br></br>
      <a href='/user'>Login as user</a>
    </div>
  );
};

export default SelectRole;
