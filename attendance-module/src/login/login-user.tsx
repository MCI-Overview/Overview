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
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Lottie from 'react-lottie';
import animationData from "../../public/coolstuff.json";

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice"
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <Lottie
        options={defaultOptions}
        height={'100%'}
        width={'100%'}
        style={{ position: 'absolute', top: 0, left: 0 }}
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
          <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
            <img
              src="./public/images/ovlogo1.svg"
              alt="Overview Logo"
              style={{ marginRight: '1rem', width: '40px' }}
            />
            <Box>
              <Typography level="title-md">Overview Attendance</Typography>
              <Typography level="body-sm">
                Log in using your NRIC and password provided by your consultant.
              </Typography>
            </Box>
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
                <Button type="submit">Login</Button>
              </Stack>
            </form>
          </Stack>

          <CardOverflow sx={{ borderTop: "1px solid", borderColor: "divider" }}>
            <CardActions sx={{ pt: 2 }}>
              <Typography level="body-sm">
                <Link to="/admin">Login as Administrator instead.</Link>
              </Typography>
            </CardActions>
          </CardOverflow>
        </Card>
      </Stack>
    </div>
  );
};

export default AdminLogin;
