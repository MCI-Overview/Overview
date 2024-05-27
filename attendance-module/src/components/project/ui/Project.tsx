import { Card, Box, Typography, Chip, Link } from "@mui/joy";

export function ProjectDisplay({
  projectName,
  companyName,
  projectId,
}: {
  projectName: string;
  companyName: string;
  projectId: string;
}) {
  return (
    <Link href={`/admin/project/${projectId}`} underline="none">
      <Card sx={{ flexGrow: 1 }}>
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
    </Link>
  );
}

export default ProjectDisplay;
