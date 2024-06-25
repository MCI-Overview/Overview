import { Card, Box, Typography, Chip, Avatar, Stack } from "@mui/joy";
import { Project } from "../../../types";
import dayjs from "dayjs";

export function UserProjectDisplay({ project }: { project: Project }) {
  const manage = project.Manage[0];
  return (
    <Card
      sx={{
        flexGrow: 1,
        "&:hover": {
          boxShadow: "md",
          borderColor: "neutral.outlinedHoverBorder",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
        }}
        justifyContent="space-between"
      >
        <Stack>
          <Typography level="title-md">{project.name}</Typography>
          <Typography level="body-sm">{`${dayjs(project.startDate).format(
            "DD MMM YY",
          )} - ${dayjs(project.endDate).format("DD MMM YY")}`}</Typography>
        </Stack>
        <Chip sx={{ height: "1rem" }}>{project.Client.name}</Chip>
      </Box>
      <Stack direction="row" gap={2}>
        <Avatar>{manage.Consultant.name.substring(0, 1)}</Avatar>
        <Stack>
          <Typography level="title-sm">{manage.Consultant.name}</Typography>
          <Stack direction="row" gap={1}>
            <Typography level="body-sm">{manage.Consultant.email}</Typography>
            <Typography level="body-sm">{manage.Consultant.contact}</Typography>
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
}

export default UserProjectDisplay;
