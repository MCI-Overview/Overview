import * as React from 'react';
import AspectRatio from '@mui/joy/AspectRatio';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Typography from '@mui/joy/Typography';
import Sheet from '@mui/joy/Sheet';

export default function CandidaeCount() {
    return (
        <Box
            sx={{
                maxWidth: "400px",
                position: 'relative',
                overflow: { xs: 'auto', sm: 'initial' },
            }}
        >
            <Card
                orientation="horizontal"
                sx={{
                    width: '100%',
                }}
            >
                <CardContent>
                    <Typography level="body-sm" fontWeight="lg" textColor="text.tertiary">
                        Candidate count as of 12/34/56
                    </Typography>
                    <Sheet
                        sx={{
                            bgcolor: 'background.level1',
                            borderRadius: 'sm',
                            p: 1.5,
                            my: 1.5,
                            display: 'flex',
                            gap: 2,
                            '& > div': { flex: 1 },
                        }}
                    >
                        <div>
                            <Typography level="body-xs" fontWeight="lg">
                                Active
                            </Typography>
                            <Typography fontWeight="lg">34</Typography>
                        </div>
                        <div>
                            <Typography level="body-xs" fontWeight="lg">
                                Inactive
                            </Typography>
                            <Typography fontWeight="lg">980</Typography>
                        </div>
                        <div>
                            <Typography level="body-xs" fontWeight="lg">
                                Total
                            </Typography>
                            <Typography fontWeight="lg">8.9</Typography>
                        </div>
                    </Sheet>
                    <Box sx={{ display: 'flex', gap: 1.5, '& > button': { flex: 1 } }}>
                        <Button variant="solid" color="primary">
                            View candidates
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}