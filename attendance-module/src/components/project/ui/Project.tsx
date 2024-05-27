import { Card, Box, Typography, Chip } from "@mui/joy";
import { useNavigate } from "react-router-dom";

export function ProjectDisplay({
  projectName,
  companyName,
  projectId,
}: {
  projectName: string;
  companyName: string;
  projectId: string;
}) {
  const navigate = useNavigate();

  return (
    <Card
      sx={{ flexGrow: 1, cursor: "pointer" }}
      onClick={() => navigate(`/admin/project/${projectId}`)}
    >
      <Box
        sx={{
          display: "flex",
        }}
        justifyContent="space-between"
      >
        <Typography level="title-md">{projectName}</Typography>
        <Chip>{companyName}</Chip>
      </Box>
    </Card>
  );
}

export default ProjectDisplay;
