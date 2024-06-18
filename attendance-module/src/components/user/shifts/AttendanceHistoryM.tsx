/* eslint-disable jsx-a11y/anchor-is-valid */
import * as React from 'react';
import { ColorPaletteProp } from '@mui/joy/styles';
import Box from '@mui/joy/Box';
import Chip from '@mui/joy/Chip';
import Divider from '@mui/joy/Divider';
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
import { CustomAttendance } from '../../../types';

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
                <MenuItem>Edit</MenuItem>
                <MenuItem>Rename</MenuItem>
                <MenuItem>Move</MenuItem>
                <Divider />
                <MenuItem color="danger">Delete</MenuItem>
            </Menu>
        </Dropdown>
    );
}

type Props = {
    data: CustomAttendance[];
}

const AttendanceHistoryM: React.FC<Props> = ({ data }) => {
    const attendanceData = data;

    return (
        <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
            {attendanceData && attendanceData.map((listItem: CustomAttendance) => (
                <List
                    key={listItem.cuid}
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
                                    {dayjs(listItem.shiftDate).format('DD MMM YYYY')}
                                </Typography>
                                <Typography level="body-xs" gutterBottom>
                                    {dayjs(listItem.Shift.startTime).format('hh:mm a')} to {dayjs(listItem.Shift.endTime).format('hh:mm a')}
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
                                    <Typography level="body-xs">{listItem.Shift.Project.name}</Typography>
                                    <Typography level="body-xs">&bull;</Typography>
                                    <Typography level="body-xs">{listItem.shiftType}</Typography>
                                </Box>
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
                                    PRESENT: <CheckRoundedIcon />,
                                    NO_SHOW: <BlockIcon />,
                                    MEDICAL: <BlockIcon />,
                                }[listItem.status || "NO_SHOW"]
                            }
                            color={
                                {
                                    PRESENT: 'success',
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

export default AttendanceHistoryM;