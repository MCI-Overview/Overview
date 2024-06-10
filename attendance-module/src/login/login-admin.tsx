import React from "react";
import {
  Box,
  Typography,
  Divider,
  Stack,
  CardOverflow,
  CardActions,
  Card,
} from "@mui/joy";
import { useNavigate } from "react-router-dom";
import Lottie from "react-lottie";
import animationData from "../../public/coolstuff.json";

const SERVER_URL =
  import.meta.env.NODE_ENV === "production"
    ? import.meta.env.VITE_SERVER_URL
    : "http://localhost:3000";

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const handleUserLogin = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    event.preventDefault();
    navigate("/");
  };
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <Lottie
        options={defaultOptions}
        height={"100%"}
        width={"100%"}
        style={{ position: "absolute", top: 0, left: 0 }}
      />
      <Stack
        spacing={4}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          px: { xs: 2, md: 6 },
        }}
      >
        <Card>
          <Box sx={{ mb: 1, display: "flex", alignItems: "center" }}>
            <img
              src="/Images/ovlogo1.svg"
              alt="Overview Logo"
              style={{ marginRight: "1rem", width: "40px" }}
            />
            <Box>
              <Typography level="title-md">Administrator Login</Typography>
              <Typography level="body-sm">
                Only administrators will be allowed to login using Microsoft.
              </Typography>
            </Box>
          </Box>

          <Divider />

          <Stack spacing={2} sx={{ my: 1 }}>
            <a href={`${SERVER_URL}/admin/login`}>
              <img src="/microsoft-login.svg" alt="Microsoft Login" />
            </a>
          </Stack>

          <CardOverflow sx={{ borderTop: "1px solid", borderColor: "divider" }}>
            <CardActions sx={{ pt: 2 }}>
              <Typography level="body-sm">
                Not an Administrator?&nbsp;
                <a href="/" onClick={handleUserLogin}>
                  Login as user instead.
                </a>
              </Typography>
            </CardActions>
          </CardOverflow>
        </Card>
      </Stack>
    </div>
  );
};

export default AdminLogin;
