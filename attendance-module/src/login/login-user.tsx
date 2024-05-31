import React from "react";
import {
  Box,
  Typography,
  Divider,
  Stack,
  CardOverflow,
  CardActions,
  Input,
  Button,
  Card,
  FormLabel,
} from "@mui/joy";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  const handleSubmit = () => {
    axios
      .post("/user/login", {
        username,
        password,
      })
      .then((res) => {
        if (res.status === 200) {
          navigate("/user/home");
        } else {
          toast.error("Invalid username or password");
        }
      });
  };

  return (
    <>
      <Stack
        spacing={4}
        sx={{
          display: "flex",
          maxWidth: "800px",
          mx: "auto",
          px: { xs: 2, md: 6 },
          py: { xs: 2, md: 3 },
        }}
      >
        <Card>
          <Box sx={{ mb: 1 }}>
            <Typography level="title-md">Overview Attendance</Typography>
            <Typography level="body-sm">
              Log in using your nric and password provided by your consultant.
            </Typography>
          </Box>

          <Divider />

          <Stack spacing={2} sx={{ my: 1 }}>
            <form onSubmit={handleSubmit}>
              <Stack spacing={1}>
                <FormLabel>NRIC / FIN</FormLabel>
                <Input
                  placeholder=""
                  required
                  onChange={(e) => setUsername(e.target.value)}
                />
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  placeholder=""
                  required
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button>Login</Button>
              </Stack>
            </form>
          </Stack>

          <CardOverflow sx={{ borderTop: "1px solid", borderColor: "divider" }}>
            <CardActions sx={{ pt: 2 }}>
              <Typography level="body-sm">
                <a href="/admin ">Login as Administrator instead.</a>
              </Typography>
            </CardActions>
          </CardOverflow>
        </Card>
      </Stack>
    </>
  );
};

export default AdminLogin;
