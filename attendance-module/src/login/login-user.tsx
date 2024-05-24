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
            <Typography level="title-md">Overview Attendance</Typography>
            <Typography level="body-sm">
              Log in using your nric and password provided by your consultant.
            </Typography>
          </Box>

          <Divider />

          <Stack spacing={2} sx={{ my: 1 }}>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                const formJson = Object.fromEntries((formData as any).entries());
                alert(JSON.stringify(formJson));
              }}
            >
              <Stack spacing={1}>
                <FormLabel>NRIC / FIN</FormLabel>
                <Input placeholder="" required />
                <FormLabel>Password</FormLabel>
                <Input placeholder="" required />
                <Button type="submit">Login</Button>
              </Stack>
            </form>
          </Stack>
            
          <CardOverflow sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
            <CardActions sx={{ pt: 2 }}>
              <Typography level="body-sm">
                <a href="/admin ">
                  Login as Administrator instead.
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
