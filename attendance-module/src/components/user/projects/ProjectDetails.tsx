import axios from "axios";
import { FC, useState, useEffect } from "react";
import { Project } from "../../../types";
import UserProjectDisplay from "./UserProjectDisplay";

import {
    Box,
    Divider,
    Stack,
    Typography,
    Card,
    CardActions,
    CardOverflow,
} from "@mui/joy";

const ProjectDetails: FC = () => {
    const [projectsList, setProjectsList] = useState<Project[] | null>(null);

    useEffect(() => {
        axios.get("/api/user/projects").then((response) => {
            setProjectsList(response.data);
        });
    }, []);

    return (
        <>
            <Card>
                <Box sx={{ mb: 1 }}>
                    <Typography level="title-md">Joined projects</Typography>
                    <Typography level="body-sm">
                        Projects that you are working on.
                    </Typography>
                </Box>
                <Divider />
                <Stack spacing={2} sx={{ my: 1 }}>
                    {!projectsList && <div>Loading...</div>}
                    {projectsList && projectsList.length === 0 && (
                        <Typography level="body-sm" textAlign="center">
                            No projects found. What are you doing here :/
                        </Typography>
                    )}
                    {projectsList &&
                        projectsList.map((project: Project) => (
                            <UserProjectDisplay
                                key={project.cuid}
                                projectName={project.name}
                                companyName={project.Client.name}
                                projectCuid={project.cuid}
                            />
                        ))}
                </Stack>
                <CardOverflow sx={{ borderTop: "1px solid", borderColor: "divider" }}>
                    <CardActions sx={{ alignSelf: "flex-start", pt: 2 }}>
                        <Typography level="body-sm">Select a project to view more actions.</Typography>
                    </CardActions>
                </CardOverflow>
            </Card>

        </>
    );
};

export default ProjectDetails;
