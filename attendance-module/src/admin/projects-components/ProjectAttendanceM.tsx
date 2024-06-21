/* eslint-disable jsx-a11y/anchor-is-valid */
import * as React from 'react';
import { ColorPaletteProp } from '@mui/joy/styles';
import Box from '@mui/joy/Box';
import Chip from '@mui/joy/Chip';
import IconButton from '@mui/joy/IconButton';
import Typography from '@mui/joy/Typography';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListItemContent from '@mui/joy/ListItemContent';
import ListDivider from '@mui/joy/ListDivider';
import Menu from '@mui/joy/Menu';
import MenuButton from '@mui/joy/MenuButton';
import MenuItem from '@mui/joy/MenuItem';
import Dropdown from '@mui/joy/Dropdown';
import dayjs from 'dayjs';

import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import BlockIcon from '@mui/icons-material/Block';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import { CustomAdminAttendance } from '../../types';

function RowMenu() {
    return (
        <Dropdown>
            <MenuButton
                slots={{ root: IconButton }}
                slotProps={{ root: { variant: 'plain', color: 'neutral', size: 'sm' } }}
            >
                <MoreHorizRoundedIcon />
            </MenuButton>
            <Menu size="sm" sx={{ minWidth: 140 }}>
                <MenuItem>Edit?</MenuItem>
            </Menu>
        </Dropdown>
    );
}

type Props = {
    data: CustomAdminAttendance[];
}

const ProjectAttendanceM: React.FC<Props> = ({ data }) => {
    const attendanceData = data;

    return (
        <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
            {attendanceData && attendanceData.map((listItem: CustomAdminAttendance) => (
                <List
                    key={listItem.attendanceCuid}
                    size="sm"
                    sx={{
                        '--ListItem-paddingX': 0,
                    }}
                >
                    <ListItem
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'start',
                        }}
                    >
                        <ListItemContent sx={{ display: 'flex', gap: 2, alignItems: 'start' }}>
                            <div>
                                <Typography fontWeight={600} gutterBottom>
                                    {dayjs(listItem.date).format('DD MMM YYYY')}
                                </Typography>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: 0.5,
                                        mb: 1,
                                    }}
                                >
                                    <Typography level="body-md">{listItem.name}</Typography>
                                    <Typography level="body-md">&bull;</Typography>
                                    <Typography level="body-md">{listItem.nric}</Typography>
                                </Box>
                                <Typography level="body-xs">
                                    Shift
                                </Typography>
                                <Typography level="body-md" gutterBottom>
                                    {dayjs(listItem.shiftStart).format('hh:mm a')} - {dayjs(listItem.shiftEnd).format('hh:mm a')}
                                </Typography>
                                <Typography level="body-xs">
                                    Clock in / out
                                </Typography>
                                <Typography level="body-md" gutterBottom>
                                    {listItem.rawStart ? dayjs(listItem.rawStart).format("hh:mm a") : 'N/A'} - {listItem.rawEnd ? dayjs(listItem.rawEnd).format("hh:mm a") : 'N/A'}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <RowMenu />
                                </Box>
                            </div>
                        </ListItemContent>
                        <Chip
                            variant="soft"
                            size="sm"
                            startDecorator={
                                {
                                    ON_TIME: <CheckRoundedIcon />,
                                    LATE: <WatchLaterIcon />,
                                    NO_SHOW: <BlockIcon />,
                                    MEDICAL: <MedicalServicesIcon />,
                                }[listItem.status || "NO_SHOW"]
                            }
                            color={
                                {
                                    ON_TIME: 'success',
                                    LATE: 'warning',
                                    NO_SHOW: 'danger',
                                    MEDICAL: 'neutral',
                                }[listItem.status || "NO_SHOW"] as ColorPaletteProp
                            }
                        >
                            {listItem.status || "NO_SHOW"}
                        </Chip>
                    </ListItem>
                    <ListDivider />
                </List>
            ))}
        </Box>
    );
}

export default ProjectAttendanceM;