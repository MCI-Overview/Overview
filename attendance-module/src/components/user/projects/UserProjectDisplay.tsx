import { Card, Box, Typography, Chip } from "@mui/joy"

export function UserProjectDisplay({
    projectName,
    companyName,
}: {
    projectName: string;
    companyName: string;
    projectCuid: string;
}) {
    return (
        <Card
            sx={{ flexGrow: 1 }}
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

export default UserProjectDisplay;
