import { useNavigate, useLocation } from "react-router-dom";

import {
  Box,
  Button,
  Divider,
  Stack,
  Typography,
  Card,
  CardActions,
  CardOverflow,
  Table,
  Input,
} from "@mui/joy";

const DailyAttendanceSection = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleViewFullAttendance = () => {
    navigate(`${location.pathname}#attendance`);
  };

  function createData(
    name: string,
    nric: number,
    clockin: string,
    clockout: string,
    postalcode: number
  ) {
    return { name, nric, clockin, clockout, postalcode };
  }

  const rows = [
    createData("Frozen yoghurt", 159, "08:00", "12:00", 123456),
    createData("Ice cream sandwich", 237, "08:00", "12:00", 654321),
    createData("Eclair", 262, "08:00", "12:00", 132456),
    createData("Cupcake", 305, "08:00", "12:00", 612345),
    createData("Gingerbread", 356, "08:00", "12:00", 165432),
  ];

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
          <Box
            sx={{
              mb: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography level="title-md">Daily attendance</Typography>
              <Typography level="body-sm">Attendance report</Typography>
            </Box>
            <Input type="date" />
          </Box>
          <Divider />
          <Stack
            spacing={2}
            sx={{
              my: 1,
            }}
          >
            <Table sx={{ "& thead th:nth-child(1)": { width: "40%" } }}>
              <thead>
                <tr>
                  <th>Candidate name</th>
                  <th>Nric</th>
                  <th>Clock in</th>
                  <th>Clock out</th>
                  <th>Postal code</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.name}>
                    <td>{row.name}</td>
                    <td>{row.nric}</td>
                    <td>{row.clockin}</td>
                    <td>{row.clockout}</td>
                    <td>{row.postalcode}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Stack>
          <CardOverflow sx={{ borderTop: "1px solid", borderColor: "divider" }}>
            <CardActions sx={{ alignSelf: "flex-end", pt: 2 }}>
              <Button
                size="sm"
                variant="solid"
                onClick={handleViewFullAttendance}
              >
                View full atendance
              </Button>
            </CardActions>
          </CardOverflow>
        </Card>
      </Stack>
    </>
  );
};

export default DailyAttendanceSection;
