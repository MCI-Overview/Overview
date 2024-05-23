import React from "react";
import {
  Box,
  Typography,
  Divider,
  Stack,
  CardOverflow,
  CardActions,
  Card
} from "@mui/joy";

const serverLink = "http://localhost:3000";

const AdminLogin: React.FC = () => {
  return (
    <>
      <Stack
        spacing={4}
        sx={{
          display: 'flex',
          maxWidth: '800px',
          mx: 'auto',
          px: { xs: 2, md: 6 },
          py: { xs: 2, md: 3 },
        }}
      >
        <Card>

          <Box sx={{ mb: 1 }}>
            <Typography level="title-md">Administrator Login</Typography>
            <Typography level="body-sm">
              Only administrators will be allowed to login using their MCI Microsoft email.
            </Typography>
          </Box>

          <Divider />

          <Stack spacing={2} sx={{ my: 1 }}>
            <a href={`${serverLink}/admin/login`}>
              <img src="/microsoft-login.svg" alt="Microsoft Login" />
            </a>
          </Stack>

          <CardOverflow sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
            <CardActions sx={{ pt: 2 }}>
              <Typography level="body-sm">
                Not an Administrator?&nbsp;
                <a href="/">
                  Login as user instead.
                </a>
              </Typography>
            </CardActions>
          </CardOverflow>

        </Card>
      </Stack>
    </>
  );
};

export default AdminLogin;