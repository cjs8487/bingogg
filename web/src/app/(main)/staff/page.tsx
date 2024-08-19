'use client';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import {
    Box,
    CircularProgress,
    Container,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import { DateTime } from 'luxon';
import { useState } from 'react';
import { useApi } from '../../../lib/Hooks';
import {
    blue,
    blueGrey,
    grey,
    indigo,
    orange,
    red,
    yellow,
} from '@mui/material/colors';
import { useUserContext } from '../../../context/UserContext';
import { notFound } from 'next/navigation';

interface LogEntry {
    level: string;
    message: string;
    timestamp: string;
    [key: string]: string;
}

const colorMap: { [k: string]: string } = {
    error: red[900],
    warn: orange[900],
    info: blue[900],
    debug: blueGrey[800],
};

export default function StaffDashboard() {
    const { user, loggedIn } = useUserContext();
    const { data: logs, isLoading, error } = useApi<LogEntry[]>('/api/logs');

    const [tab, setTab] = useState('Logs');
    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setTab(newValue);
    };

    if (!loggedIn || !user || !user.staff) {
        notFound();
    }

    const tabs = ['Logs'];

    return (
        <Container sx={{ pt: 2 }}>
            <Typography textAlign="center" variant="h4">
                Staff Dashboard
            </Typography>
            <TabContext value={tab}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <TabList
                        onChange={handleChange}
                        aria-label="lab API tabs example"
                    >
                        {tabs.map((tab) => (
                            <Tab key={tab} label={tab} value={tab} />
                        ))}
                    </TabList>
                </Box>
                <TabPanel value="Logs">
                    {isLoading && <CircularProgress />}
                    {error && (
                        <Typography>Unable to load logs - ${error}</Typography>
                    )}
                    {logs && (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Timestamp</TableCell>
                                        <TableCell>Level</TableCell>
                                        <TableCell>Message</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {logs.map((entry, index) => (
                                        <TableRow
                                            key={index}
                                            sx={{
                                                background:
                                                    colorMap[entry.level],
                                            }}
                                        >
                                            <TableCell sx={{ opacity: 1 }}>
                                                {DateTime.fromISO(
                                                    entry.timestamp,
                                                ).toLocaleString(
                                                    DateTime.DATETIME_MED,
                                                )}
                                            </TableCell>
                                            <TableCell>{entry.level}</TableCell>
                                            <TableCell>
                                                {entry.room &&
                                                    `[${entry.room}] `}
                                                {entry.message}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </TabPanel>
            </TabContext>
        </Container>
    );
}
