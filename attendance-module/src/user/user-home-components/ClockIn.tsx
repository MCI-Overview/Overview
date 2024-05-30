import * as React from 'react';
import CircularProgress from '@mui/joy/CircularProgress';
import { useCountUp } from 'use-count-up';
import {
    Box,
    Button,
    Divider,
    Stack,
    Typography,
    Card,
    CardActions,
    CardOverflow,
} from "@mui/joy";

export default function ClockIn() {

    return (
        <>
            <Stack
                spacing={4}
                sx={{
                    display: "flex",
                    maxWidth: "800px",
                    mx: "auto",
                    px: { xs: 2, md: 6 },
                    py: { xs: 2, md: 3 },
                    alignItems: 'center', // Center content horizontally
                }}
            >
                <Card>
                    <Box sx={{ mb: 1 }}>
                        <Typography level="title-md">Clock</Typography>
                        <Typography level="body-sm">
                            Clock your attendance
                        </Typography>
                    </Box>
                    <Divider />
                    <Stack spacing={2} sx={{ my: 1, alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                            <Typography sx={{ fontWeight: 'bold', fontSize: 48 }}>12:34:56</Typography>
                            <Typography>Monday, May 28, 2024</Typography>
                        </Box>

                        <Button sx={{ mr: 1 }}>Clock In</Button>
                        <Button>Clock Out</Button>
                    </Stack>
                    <CardOverflow sx={{ borderTop: "1px solid", borderColor: "divider", textAlign: 'center' }}>
                        <CardActions sx={{ justifyContent: 'center', pt: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                <Typography>Clock In: 09:00 AM</Typography>
                                <Typography>Clock Out: 06:00 PM</Typography>
                                <Typography>Duration: 9 hours</Typography>
                            </Box>
                        </CardActions>
                    </CardOverflow>
                </Card>
            </Stack>
        </>
    );
}
