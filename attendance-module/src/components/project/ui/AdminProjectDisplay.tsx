import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

import { BasicProject } from "../../../types";
import ConsultantDisplay from "./ConsultantDisplay";
import { useUserContext } from "../../../providers/userContextProvider";

import { Card, Box, Typography, Chip, Stack, Tooltip } from "@mui/joy";

interface ProjectDisplayProps {
  project: BasicProject;
  viewOnly?: boolean;
}

export function AdminProjectDisplay({
  project,
  viewOnly = false,
}: ProjectDisplayProps) {
  const navigate = useNavigate();
  const { user } = useUserContext();

  const cuids = project.consultants
    .filter((c) => c.role === "CLIENT_HOLDER" && c.cuid !== user?.cuid)
    .map((c) => c.cuid);

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
          display: {
            sm: "flex",
          },
        }}
        justifyContent="space-between"
      >
        <Stack>
          <Typography level="title-md">{project.name}</Typography>
          <Typography level="body-sm">{`${dayjs(project.startDate).format(
            "DD MMM YY"
          )} - ${dayjs(project.endDate).format("DD MMM YY")}`}</Typography>
        </Stack>
        <Tooltip title={`UEN: ${project.clientUEN}`}>
          <Chip sx={{ marginY: "auto" }}>{project.clientName}</Chip>
        </Tooltip>
      </Box>
      <Stack gap={2}>
        {cuids.map((cuid) => (
          <ConsultantDisplay key={cuid} cuid={cuid} />
        ))}
      </Stack>
    </Card>
  );
}

export default AdminProjectDisplay;
