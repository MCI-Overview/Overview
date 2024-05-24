import { Card, Box, Typography, Chip } from "@mui/joy";

export function ProjectDisplay({
  projectName,
  companyName,
}: {
  projectName: string;
  companyName: string;
}) {
  return (
    <Card>
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
