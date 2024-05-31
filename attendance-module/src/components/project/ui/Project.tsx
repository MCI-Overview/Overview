import { Card, Box, Typography, Chip } from "@mui/joy";
import { useNavigate } from "react-router-dom";

export function ProjectDisplay({
  projectName,
  companyName,
  projectCuid,
}: {
  projectName: string;
  companyName: string;
  projectCuid: string;
}) {
  const navigate = useNavigate();

  return (
    <Card
      sx={{ flexGrow: 1, cursor: "pointer" }}
      onClick={() => navigate(`/admin/project/${projectCuid}`)}
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
