import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

import {
    Box,
    Button,
    Divider,
    Stack,
    Typography,
    Card,
    CardActions,
    CardOverflow
} from "@mui/joy";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const ProjectHeadcount: React.FC = () => {

    const navigate = useNavigate();
    const location = useLocation();

    const data = {
        labels: ['Filled', 'Open'],
        datasets: [
            {
                data: [12, 19],
                backgroundColor: [
                    'rgba(54, 162, 235)',
                    'rgba(255, 99, 132, 0.6)',
                ]
            },
        ],
    };

    const handleViewCandidates = () => {
        navigate(`${location.pathname}#candidates`);
    };

    return (
        <>
            <Card>
                <Box sx={{ mb: 1 }}>
                    <Typography level="title-md">Headcount</Typography>
                    <Typography level="body-sm">
                        Project candidates
                    </Typography>
                </Box>
                <Divider />
                <Stack
                    spacing={2}
                    sx={{
                        my: 1,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Box
                        sx={{
                            width: 200,
                        }}
                    >
                        <Doughnut
                            data={data}
                            options={{
                                rotation: -90,
                                circumference: 180,
                                cutout: "60%",
                                maintainAspectRatio: true,
                                responsive: true,
                                plugins: {
                                    legend: {
                                        display: false
                                    }
                                }
                            }} />
                    </Box>
                </Stack>
                <CardOverflow sx={{ borderTop: "1px solid", borderColor: "divider" }}>
                    <CardActions sx={{ alignSelf: "flex-end", pt: 2 }}>
                        <Button
                            size="sm"
                            variant="solid"
                            onClick={handleViewCandidates}
                        >
                            View candidates
                        </Button>
                    </CardActions>
                </CardOverflow>
            </Card>
        </>
    );
};

export default ProjectHeadcount;
