/* eslint-disable react/display-name */
'use client';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import {
    Box,
    CircularProgress,
    Container,
    Paper,
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
import { forwardRef, useState } from 'react';
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
import { TableVirtuoso } from 'react-virtuoso';
import AutoSizer from 'react-virtualized-auto-sizer';

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
        <Container
            sx={{
                pt: 2,
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <Typography textAlign="center" variant="h4">
                Staff Dashboard
            </Typography>
            <TabContext value={tab}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <TabList onChange={handleChange}>
                        {tabs.map((tab) => (
                            <Tab key={tab} label={tab} value={tab} />
                        ))}
                    </TabList>
                </Box>
                <TabPanel value="Logs" sx={{ flexGrow: 1 }}>
                    {isLoading && <CircularProgress />}
                    {error && (
                        <Typography>Unable to load logs - ${error}</Typography>
                    )}
                    {logs && (
                        <Box width="100%" height="100%">
                            <AutoSizer>
                                {({ width, height }) => {
                                    console.log(height);
                                    return (
                                        <TableVirtuoso
                                            width={width}
                                            height={height}
                                            style={{ height, width }}
                                            data={logs}
                                            components={{
                                                Scroller:
                                                    forwardRef<HTMLDivElement>(
                                                        (props, ref) => (
                                                            <TableContainer
                                                                component={
                                                                    Paper
                                                                }
                                                                {...props}
                                                                ref={ref}
                                                            />
                                                        ),
                                                    ),
                                                Table: (props) => (
                                                    <Table
                                                        {...props}
                                                        sx={{
                                                            borderCollapse:
                                                                'separate',
                                                            tableLayout:
                                                                'fixed',
                                                        }}
                                                    />
                                                ),
                                                TableHead:
                                                    forwardRef<HTMLTableSectionElement>(
                                                        (props, ref) => (
                                                            <TableHead
                                                                {...props}
                                                                ref={ref}
                                                            />
                                                        ),
                                                    ),
                                                TableRow,
                                                TableBody:
                                                    forwardRef<HTMLTableSectionElement>(
                                                        (props, ref) => (
                                                            <TableBody
                                                                {...props}
                                                                ref={ref}
                                                            />
                                                        ),
                                                    ),
                                            }}
                                            fixedHeaderContent={() => (
                                                <TableRow
                                                    sx={{
                                                        backgroundColor:
                                                            'background.paper',
                                                    }}
                                                >
                                                    <TableCell>
                                                        Timestamp
                                                    </TableCell>
                                                    <TableCell>Level</TableCell>
                                                    <TableCell>
                                                        Message
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                            itemContent={(index, entry) => (
                                                <>
                                                    <TableCell
                                                        sx={{ opacity: 1 }}
                                                    >
                                                        {DateTime.fromISO(
                                                            entry.timestamp,
                                                        ).toLocaleString(
                                                            DateTime.DATETIME_MED,
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {entry.level}
                                                    </TableCell>
                                                    <TableCell>
                                                        {entry.room &&
                                                            `[${entry.room}] `}
                                                        {entry.message}
                                                    </TableCell>
                                                </>
                                            )}
                                        />
                                    );
                                }}
                            </AutoSizer>
                        </Box>
                    )}
                </TabPanel>
            </TabContext>
        </Container>
    );
}
