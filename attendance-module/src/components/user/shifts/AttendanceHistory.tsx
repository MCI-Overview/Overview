/* eslint-disable jsx-a11y/anchor-is-valid */
import * as React from 'react';
import { ColorPaletteProp } from '@mui/joy/styles';
import Box from '@mui/joy/Box';
import Chip from '@mui/joy/Chip';
import Link from '@mui/joy/Link';
import Table from '@mui/joy/Table';
import Sheet from '@mui/joy/Sheet';
import IconButton from '@mui/joy/IconButton';
import Typography from '@mui/joy/Typography';
import Menu from '@mui/joy/Menu';
import MenuButton from '@mui/joy/MenuButton';
import MenuItem from '@mui/joy/MenuItem';
import Dropdown from '@mui/joy/Dropdown';
import dayjs from 'dayjs';

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import BlockIcon from '@mui/icons-material/Block';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import { CustomAttendance } from '../../../types';

type Order = 'asc' | 'desc';

type Props = {
    data: CustomAttendance[];
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
                <MenuItem>Leave / MC</MenuItem>
                <MenuItem>Claims</MenuItem>
            </Menu>
        </Dropdown>
    );
}

const AttendanceHistory: React.FC<Props> = ({ data }) => {
    const attendanceData = data;
    const [order, setOrder] = React.useState<Order>('desc');

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
                            <th style={{ width: 120, padding: '12px 6px' }}>
                                <Link
                                    underline="none"
                                    color="primary"
                                    component="button"
                                    onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
                                    fontWeight="lg"
                                    endDecorator={<ArrowDropDownIcon />}
                                    sx={{
                                        '& svg': {
                                            transition: '0.2s',
                                            transform:
                                                order === 'desc' ? 'rotate(0deg)' : 'rotate(180deg)',
                                        },
                                    }}
                                >
                                    Date
                                </Link>
                            </th>
                            <th style={{ width: 140, padding: '12px 6px' }}>Project</th>
                            <th style={{ width: 140, padding: '12px 6px' }}>Status</th>
                            <th style={{ width: 100, padding: '12px 6px' }}>Type</th>
                            <th style={{ width: 100, padding: '12px 6px' }}>Start</th>
                            <th style={{ width: 100, padding: '12px 6px' }}>End</th>
                            <th style={{ width: 140, padding: '12px 6px' }}> </th>
                        </tr>
                    </thead>
                    <tbody>
                        {attendanceData && attendanceData.map((row: CustomAttendance) => (
                            <tr key={row.cuid}>
                                <td>
                                    <Typography level="body-xs">{dayjs(row.shiftDate).format("DD MMM YYYY")}</Typography>
                                </td>
                                <td>
                                    <Typography level="body-xs">{row.Shift.Project.name}</Typography>
                                </td>
                                <td>
                                    <Chip
                                        variant="soft"
                                        size="sm"
                                        startDecorator={
                                            {
                                                PRESENT: <CheckRoundedIcon />,
                                                NO_SHOW: <BlockIcon />,
                                                MEDICAL: <BlockIcon />,
                                            }[row.status || "NO_SHOW"]
                                        }
                                        color={
                                            {
                                                PRESENT: 'success',
                                                NO_SHOW: 'danger',
                                                MEDICAL: 'neutral',
                                            }[row.status || "NO_SHOW"] as ColorPaletteProp
                                        }
                                    >
                                        {row.status || "NO_SHOW"}
                                    </Chip>
                                </td>
                                <td>
                                    <Typography level="body-xs">{row.shiftType}</Typography>
                                </td>
                                <td>
                                    <Typography level="body-xs">{dayjs(row.Shift?.startTime).format("hh:mm a") || 'N/A'}</Typography>
                                </td>
                                <td>
                                    <Typography level="body-xs">{dayjs(row.Shift?.endTime).format("hh:mm a") || 'N/A'}</Typography>
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

export default AttendanceHistory;