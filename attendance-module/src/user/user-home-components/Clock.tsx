import { useEffect, useState } from "react";

import { Box, Stack, Typography } from "@mui/joy";

const Clock = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <Stack spacing={2} sx={{ alignItems: "center" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
        <Typography level="h1">{currentTime.toLocaleTimeString()}</Typography>
        <Typography level="h4">
          {currentTime.toLocaleDateString("en-SG", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Typography>
      </Box>
    </Stack>
  );
};

export default Clock;
