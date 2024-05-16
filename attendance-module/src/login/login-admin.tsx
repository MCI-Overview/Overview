import React from 'react';

const serverLink = "http://localhost:3000";

const AdminLogin: React.FC = () => {
  return (
    <div>
      <h1>Sign in as admin</h1>
      <button onClick={() => {
        const popup = window.open(
          `${serverLink}/auth/microsoft`,
          "targetWindow",
          `toolbar=no,
          location=no,
          status=no,
          menubar=no,
          scrollbars=yes,
          resizable=yes,
          width=620,
          height=700`
        );

        const messageListener = (event: MessageEvent) => {
          if (event.origin === serverLink) {
            if (event.data) {
              sessionStorage.setItem("user", JSON.stringify(event.data));
              popup?.close();
              window.removeEventListener("message", messageListener);
            }
          }
        };

        window.addEventListener("message", messageListener);
      }}>
        <img src="/microsoft-login.svg" alt="Microsoft Login" />
      </button>
    </div>
  );
};

export default AdminLogin;