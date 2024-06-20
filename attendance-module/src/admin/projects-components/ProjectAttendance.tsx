/* eslint-disable jsx-a11y/anchor-is-valid */
import * as React from 'react';
import { ColorPaletteProp } from '@mui/joy/styles';
import Box from '@mui/joy/Box';
import Chip from '@mui/joy/Chip';
import Table from '@mui/joy/Table';
import Sheet from '@mui/joy/Sheet';
import IconButton from '@mui/joy/IconButton';
import Typography from '@mui/joy/Typography';
import Menu from '@mui/joy/Menu';
import MenuButton from '@mui/joy/MenuButton';
import MenuItem from '@mui/joy/MenuItem';
import Dropdown from '@mui/joy/Dropdown';
import dayjs from 'dayjs';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import BlockIcon from '@mui/icons-material/Block';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import { CustomAdminAttendance } from '../../types';

type Props = {
    data: CustomAdminAttendance[];
}

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

const ProjectAttendance: React.FC<Props> = ({ data }) => {
    const attendanceData = data;
    console.log(data);

    return (
        <React.Fragment>
            <Sheet
                className="OrderTableContainer"
                variant="outlined"
                sx={{
                    display: { xs: 'none', sm: 'initial' },
                    width: '100%',
                    borderRadius: 'sm',
                    flexShrink: 1,
                    overflow: 'auto',
                    minHeight: 0,
                }}
            >
                <Table
                    aria-labelledby="tableTitle"
                    stickyHeader
                    hoverRow
                    sx={{
                        '--TableCell-headBackground': 'var(--joy-palette-background-level1)',
                        '--Table-headerUnderlineThickness': '1px',
                        '--TableRow-hoverBackground': 'var(--joy-palette-background-level1)',
                        '--TableCell-paddingY': '4px',
                        '--TableCell-paddingX': '8px',
                    }}
                >
                    <thead>
                        <tr>
                            <th style={{ width: 120, padding: '12px 6px' }}>Date</th>
                            <th style={{ width: 100, padding: '12px 6px' }}>Nric</th>
                            <th style={{ width: 140, padding: '12px 6px' }}>Name</th>
                            <th style={{ width: 140, padding: '12px 6px' }}>Status</th>
                            <th style={{ width: 100, padding: '12px 6px' }}>Shift Start</th>
                            <th style={{ width: 100, padding: '12px 6px' }}>Shift End</th>
                            <th style={{ width: 100, padding: '12px 6px' }}>Clock In</th>
                            <th style={{ width: 100, padding: '12px 6px' }}>Clock Out</th>
                            <th style={{ width: 140, padding: '12px 6px' }}> </th>
                        </tr>
                    </thead>
                    <tbody>
                        {attendanceData && attendanceData.map((row: CustomAdminAttendance) => (
                            <tr key={row.attendanceCuid}>
                                <td>
                                    <Typography level="body-xs">{dayjs(row.date).format("DD MMM YYYY")}</Typography>
                                </td>
                                <td>
                                    <Typography level="body-xs">{row.nric}</Typography>
                                </td>
                                <td>
                                    <Typography level="body-xs">{row.name}</Typography>
                                </td>
                                <td>
                                    <Chip
                                        variant="soft"
                                        size="sm"
                                        startDecorator={
                                            {
                                                ON_TIME: <CheckRoundedIcon />,
                                                LATE: <WatchLaterIcon />,
                                                NO_SHOW: <BlockIcon />,
                                                MEDICAL: <MedicalServicesIcon />,
                                            }[row.status || "NO_SHOW"]
                                        }
                                        color={
                                            {
                                                ON_TIME: 'success',
                                                LATE: 'warning',
                                                NO_SHOW: 'danger',
                                                MEDICAL: 'neutral',
                                            }[row.status || "NO_SHOW"] as ColorPaletteProp
                                        }
                                    >
                                        {row.status || "NO_SHOW"}
                                    </Chip>
                                </td>
                                <td>
                                    <Typography level="body-xs">{row.shiftStart ? dayjs(row.shiftStart).format("hh:mm a") : '-'}</Typography>
                                </td>
                                <td>
                                    <Typography level="body-xs">{row.shiftEnd ? dayjs(row.shiftEnd).format("hh:mm a") : '-'}</Typography>
                                </td>
                                <td>
                                    <Typography level="body-xs">{row.rawStart ? dayjs(row.rawStart).format("hh:mm a") : '-'}</Typography>
                                </td>
                                <td>
                                    <Typography level="body-xs">{row.rawEnd ? dayjs(row.rawEnd).format("hh:mm a") : '-'}</Typography>
                                </td>
                                <td>
                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                        {/* <Link level="body-xs" component="button">
                                            View
                                        </Link> */}
                                        <RowMenu />
                                    </Box>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Sheet>
        </React.Fragment>
    );
}

export default ProjectAttendance;