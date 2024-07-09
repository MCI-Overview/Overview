import { useState, FormEvent } from "react";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";

import { useUserContext } from "../providers/userContextProvider";

import {
  FormLabel,
  Input,
  Button,
  Box,
  IconButton,
  Typography,
  Stack,
  useColorScheme,
} from "@mui/joy";
import { Microsoft as MicrosoftIcon } from "@mui/icons-material";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const fields: {
  USER: {
    title: string;
    subtitle: string;
    switchUserModeText: string;
    switchUserModeTo: "ADMIN";
  };
  ADMIN: {
    title: string;
    subtitle: string;
    switchUserModeText: string;
    switchUserModeTo: "USER";
  };
} = {
  USER: {
    title: "Sign in",
    subtitle: "Enter the credentials provided by your consultant.",
    switchUserModeText: "Login as administrator instead.",
    switchUserModeTo: "ADMIN",
  },
  ADMIN: {
    title: "Sign in as Administrator",
    subtitle: "Sign in using your MCI Microsoft credentials.",
    switchUserModeText: "Login as user instead.",
    switchUserModeTo: "USER",
  },
};

const Login = () => {
  const [userMode, setUserMode] = useState<"USER" | "ADMIN">("USER");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { updateUser } = useUserContext();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    axios
      .post("/user/login", {
        username,
        password,
      })
      .then(() => {
        updateUser();
        toast.success("Successfully logged in.");
      })
      .catch((error: AxiosError) => {
        if (error.response?.status === 400) {
          toast.error("Invalid username/password.");
          return;
        }

        toast.error("An unexpected error occurred. Please try again later.");
      });
  };

  const handleMSLogin = () => {
    window.location.href = `${SERVER_URL}/admin/login`;
  };

  const ColorSchemeToggle = () => {
    const { mode, setMode } = useColorScheme();
    return (
      <IconButton
        aria-label="toggle light/dark mode"
        size="sm"
        variant="outlined"
        onClick={() => {
          setMode(mode === "light" ? "dark" : "light");
        }}
      >
        {mode === "light" ? <DarkModeRoundedIcon /> : <LightModeRoundedIcon />}
      </IconButton>
    );
  };

  return (
    <>
      <Box
        sx={(theme) => ({
          px: 2,
          position: "relative",
          display: "flex",
          justifyContent: "flex-end",
          flexDirection: "column",
          minHeight: "90vh",
          width: { xs: "100%", md: "50vw" },
          alignItems: "space-between",
          transition: "width var(--Transition-duration)",
          backgroundColor: "rgba(255 255 255 / 0.2)",
          [theme.getColorSchemeSelector("dark")]: {
            backgroundColor: "rgba(19 19 24 / 0)",
          },
        })}
      >
        <Box
          component="header"
          sx={{
            py: {
              xs: 3,
              md: 0,
            },
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ gap: 1, display: "flex", alignItems: "center" }}>
            <IconButton
              variant="soft"
              size="sm"
              disabled
              sx={{ borderRadius: 100 }}
            >
              <img src="/public/Images/ovlogo1.svg" alt="Logo" />
            </IconButton>
            <Typography level="title-lg">Overview</Typography>
          </Box>

          <ColorSchemeToggle />
        </Box>

        <Box
          component="main"
          sx={{
            mt: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            width: 400,
            maxWidth: "100%",
            mx: "auto",
            borderRadius: "sm",
            [`& .MuiFormLabel-asterisk`]: {
              visibility: "hidden",
            },
          }}
        >
          <Stack gap={0.5}>
            <Typography level="h3">{fields[userMode].title}</Typography>
            <Typography level="body-sm">{fields[userMode].subtitle}</Typography>
          </Stack>

          {userMode === "USER" ? (
            <form onSubmit={handleSubmit}>
              <Stack gap={0.5}>
                <Box>
                  <FormLabel>NRIC / FIN</FormLabel>
                  <Input
                    placeholder=""
                    required
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </Box>

                <Box>
                  <FormLabel>Password</FormLabel>
                  <Input
                    type="password"
                    placeholder=""
                    required
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Box>

                <Button type="submit" sx={{ mt: 1 }}>
                  Login
                </Button>
              </Stack>
            </form>
          ) : (
            <Button startDecorator={<MicrosoftIcon />} onClick={handleMSLogin}>
              Sign in with Microsoft
            </Button>
          )}

          <Typography
            level="body-xs"
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              textDecoration: "underline",
              cursor: "pointer",
            }}
            onClick={() => {
              setUserMode(fields[userMode].switchUserModeTo);
            }}
          >
            {fields[userMode].switchUserModeText}
          </Typography>
        </Box>

        {/* Box with 25% viewport height, keeps button position stable */}
        <Box sx={{ height: "25vh" }} />

        <Typography level="body-xs" textAlign="center">
          © Overview Pte. Ltd. {new Date().getFullYear()}
        </Typography>
      </Box>

      <Box
        sx={{
          height: "100%",
          position: "fixed",
          right: 0,
          top: 0,
          bottom: 0,
          display: { xs: "none", md: "flex" },
          left: { xs: 0, md: "50vw" },
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <img src="/public/Images/login_bg.png" alt="Background" height="100%" />
      </Box>
    </>
  );
};
export default Login;
