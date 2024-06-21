import React, { useEffect } from 'react';
import axios from 'axios';
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import Box from '@mui/joy/Box';
import { CustomAdminAttendance } from '../../types';
import {
    FormControl,
    FormLabel,
    Input,
    Select,
    Option,
} from '@mui/joy';
import SearchIcon from '@mui/icons-material/Search';
import ProjectAttendance from './ProjectAttendance';
import ProjectAttendanceM from './ProjectAttendanceM';
import dayjs from 'dayjs';
import { useProjectContext } from '../../providers/projectContextProvider';

const Attendance = () => {
    const [data, setData] = React.useState<CustomAdminAttendance[]>([]);
    const [startDate, setStartDate] = React.useState<string>(dayjs().format('YYYY-MM-DD'));
    const [endDate, setEndDate] = React.useState<string>(dayjs().format('YYYY-MM-DD'));
    const [searchTerm, setSearchTerm] = React.useState<string>('');
    const [statusFilter, setStatusFilter] = React.useState<string | null>('');

    const context = useProjectContext();
    const projectCuid = context.project?.cuid;

    const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setStartDate(event.target.value);
    };

    const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEndDate(event.target.value);
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value.toLowerCase());
    };

    const handleStatusChange = (_event: any, value: string | null) => {
        setStatusFilter(value === "" ? null : value);
    };

    useEffect(() => {
        fetchUpcomingShifts(startDate, endDate);
    }, [startDate, endDate]);

    const fetchUpcomingShifts = async (startDate: string, endDate: string) => {
        try {
            const formattedStartDate = dayjs(startDate).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
            const formattedEndDate = dayjs(endDate).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
            const url = `/api/admin/project/${projectCuid}/history?startDate=${formattedStartDate}&endDate=${formattedEndDate}`;
            const response = await axios.get(url);
            const fetchedData = response.data;
            setData(fetchedData);
        } catch (error) {
            console.error("Error fetching upcoming shifts: ", error);
        }
    };

    const filteredData = data.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm) || item.nric.toLowerCase().includes(searchTerm);
        const matchesStatus = statusFilter ? item.status === statusFilter : true;
        return matchesSearch && matchesStatus;
    });

    return (
        <CssVarsProvider disableTransitionOnChange>
            <CssBaseline />
            <Box sx={{ display: 'flex' }}>
                <Box
                    component="main"
                    className="MainContent"
                    sx={{
                        px: { xs: 2, md: 6 },
                        pb: { xs: 2, sm: 2, md: 3 },
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        minWidth: 0,
                        gap: 1,
                    }}
                >
                    <Box
                        className="SearchAndFilters-tabletUp"
                        sx={{
                            borderRadius: 'sm',
                            py: 2,
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 1.5,
                            '& > *': {
                                minWidth: { xs: '120px', md: '160px' },
                            },
                        }}
                    >
                        <FormControl sx={{ flex: 1 }} size="sm">
                            <FormLabel>Search candidate</FormLabel>
                            <Input size="sm" placeholder="Search" startDecorator={<SearchIcon />} onChange={handleSearchChange} />
                        </FormControl>
                        <FormControl size="sm">
                            <FormLabel>Search from</FormLabel>
                            <Input type="date" size="sm" value={startDate} onChange={handleStartDateChange} />
                        </FormControl>
                        <FormControl size="sm">
                            <FormLabel>To</FormLabel>
                            <Input type="date" size="sm" value={endDate} onChange={handleEndDateChange} />
                        </FormControl>
                        <FormControl size="sm">
                            <FormLabel>Status</FormLabel>
                            <Select
                                size="sm"
                                placeholder="Filter by status"
                                onChange={handleStatusChange}
                                slotProps={{ button: { sx: { whiteSpace: 'nowrap' } } }}
                            >
                                <Option value="">All</Option>
                                <Option value="ON_TIME">On Time</Option>
                                <Option value="LATE">Late</Option>
                                <Option value="NO_SHOW">No Show</Option>
                                <Option value="MEDICAL">Medical</Option>
                            </Select>
                        </FormControl>
                    </Box>
                    <ProjectAttendance data={filteredData} />
                    <ProjectAttendanceM data={filteredData} />
                </Box>
            </Box>
        </CssVarsProvider >
    );
}

export default Attendance;