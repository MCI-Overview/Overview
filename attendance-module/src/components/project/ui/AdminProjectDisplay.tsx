import { Card, Box, Typography, Chip, Avatar, Stack } from "@mui/joy";
import { useNavigate } from "react-router-dom";
import { Project } from "../../../types";
import dayjs from "dayjs";
import { useUserContext } from "../../../providers/userContextProvider";

interface ProjectDisplayProps {
  project: Project;
  viewOnly?: boolean;
}

export function AdminProjectDisplay({
  project,
  viewOnly = false,
}: ProjectDisplayProps) {
  const navigate = useNavigate();
  const { user } = useUserContext();

  const manage = project.Manage[0];

  const isClientHolder =
    project.Manage.filter((manage) => manage.consultantCuid === user?.cuid)
      .length > 0;

  const handleClick = () => {
    if (!viewOnly) {
      navigate(`/admin/project/${project.cuid}`);
    }
  };

  return (
    <Card
      sx={{
        flexGrow: 1,
        cursor: viewOnly ? "default" : "pointer",
        "&:hover": {
          boxShadow: "md",
          borderColor: "neutral.outlinedHoverBorder",
        },
      }}
      onClick={handleClick}
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
        <Chip sx={{ marginY: "auto" }}>{project.Client.name}</Chip>
      </Box>
      {isClientHolder && (
        <Typography level="body-sm">You are the client holder!</Typography>
      )}
      {!isClientHolder && (
        <Stack direction="row" gap={2}>
          <Avatar>{manage.Consultant.name.substring(0, 1)}</Avatar>
          <Stack>
            <Typography level="title-sm">{manage.Consultant.name}</Typography>
            <Stack direction="row" gap={1}>
              <Typography level="body-sm">{manage.Consultant.email}</Typography>
              <Typography level="body-sm">
                {manage.Consultant.contact}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      )}
    </Card>
  );
}

export default AdminProjectDisplay;
