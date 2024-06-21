import { Card, Box, Typography, Chip } from "@mui/joy";
import { useNavigate } from "react-router-dom";

interface ProjectDisplayProps {
  projectName: string;
  companyName: string;
  projectCuid: string;
  clientHolders?: string[];
  viewOnly?: boolean;
}

export function ProjectDisplay({
  projectName,
  companyName,
  projectCuid,
  clientHolders = [],
  viewOnly = false,
}: ProjectDisplayProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (!viewOnly) {
      navigate(`/admin/project/${projectCuid}`);
    }
  };

  return (
    <Card
      sx={{ flexGrow: 1, cursor: viewOnly ? "default" : "pointer" }}
      onClick={handleClick}
    >
      <Box
        sx={{
          display: "flex",
        }}
        justifyContent="space-between"
      >
        <Box>
          <Typography level="title-md">{projectName}</Typography>
          <Typography level="body-sm">{clientHolders.join(", ")}</Typography>
        </Box>
        <Chip sx={{ marginY: "auto" }}>{companyName}</Chip>
      </Box>
    </Card>
  );
}

export default ProjectDisplay;
