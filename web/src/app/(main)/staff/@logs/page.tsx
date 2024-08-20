'use client';
import {
    Box,
    CircularProgress,
    Collapse,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import { blue, blueGrey, orange, red } from '@mui/material/colors';
import { DateTime } from 'luxon';
import { forwardRef, useState } from 'react';
import { useList } from 'react-use';
import AutoSizer from 'react-virtualized-auto-sizer';
import { TableComponents, TableProps, TableVirtuoso } from 'react-virtuoso';
import { useApi } from '../../../../lib/Hooks';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

type BasicLogEntry = {
    level: string;
    message: string;
    timestamp: string;
};

type RequestLogEntry = BasicLogEntry & {
    method: string;
    path: string;
    statusCode: number;
    sessionId: string;
    userAgent: string;
    ip: string;
    durationMs: number;
};

type RoomLogEntry = (BasicLogEntry | RequestLogEntry) & {
    room: string;
};

type LogEntry = BasicLogEntry | RequestLogEntry | RoomLogEntry;

const colorMap: { [k: string]: string } = {
    error: red[900],
    warn: orange[900],
    info: blue[900],
    debug: blueGrey[800],
};

const Scroller = forwardRef<HTMLDivElement>(
    function VirtuosoScroller(props, ref) {
        return <TableContainer {...props} ref={ref} />;
    },
);

const VirtuosoTable = (props: TableProps) => (
    <Table
        {...props}
        sx={{
            borderCollapse: 'separate',
            tableLayout: 'fixed',
        }}
    />
);

const VirtuosoTableBody = forwardRef<HTMLTableSectionElement>(
    function VirtuosoTableBody(props, ref) {
        return <TableBody {...props} ref={ref} />;
    },
);

const VirtuosoTableHead = forwardRef<HTMLTableSectionElement>(
    function VirtuosoTableHead(props, ref) {
        return <TableHead {...props} ref={ref} />;
    },
);

const VirtuosoTableRow: TableComponents<LogEntry, TableContext>['TableRow'] = ({
    context,
    item: entry,
    ...props
}) => {
    if (!context) {
        return null;
    }

    const { isExpanded, setExpanded } = context;
    const open = isExpanded(props['data-index']);

    return (
        <>
            <TableRow
                sx={{
                    '& > *': {
                        borderBottom: 'unset',
                        background: colorMap[entry.level],
                    },
                }}
                {...props}
            >
                {'method' in entry && (
                    <TableCell>
                        <IconButton
                            aria-label="expand row"
                            size="small"
                            onClick={() => setExpanded(props['data-index'])}
                        >
                            {open ? (
                                <KeyboardArrowUpIcon />
                            ) : (
                                <KeyboardArrowDownIcon />
                            )}
                        </IconButton>
                    </TableCell>
                )}
                <TableCell colSpan={'method' in entry ? 1 : 2} align="right">
                    {DateTime.fromISO(entry.timestamp).toLocaleString(
                        DateTime.DATETIME_MED,
                    )}
                </TableCell>
                <TableCell align="center">{entry.level}</TableCell>
                <TableCell>
                    {'room' in entry && `[${entry.room}] `}
                    {entry.message}
                </TableCell>
            </TableRow>
            {'method' in entry && (
                <TableRow>
                    <TableCell
                        style={{ paddingBottom: 0, paddingTop: 0 }}
                        colSpan={4}
                    >
                        <Collapse in={open} timeout="auto" unmountOnExit>
                            <Box sx={{ margin: 1 }}>
                                <Typography
                                    variant="h6"
                                    gutterBottom
                                    component="div"
                                >
                                    Additional Request Information
                                </Typography>
                                <Typography>
                                    User Agent: {entry.userAgent}
                                </Typography>
                                <Typography>IP Address: {entry.ip}</Typography>
                                <Typography>
                                    Session Id: {entry.sessionId}
                                </Typography>
                                <Typography>
                                    Request completed in {entry.durationMs} ms
                                </Typography>
                            </Box>
                        </Collapse>
                    </TableCell>
                </TableRow>
            )}
        </>
    );
};

const FixedHeaderContent = () => (
    <TableRow
        sx={{
            backgroundColor: 'background.paper',
        }}
    >
        <TableCell />
        <TableCell align="right">Timestamp</TableCell>
        <TableCell align="center">Level</TableCell>
        <TableCell>Message</TableCell>
    </TableRow>
);

interface TableContext {
    isExpanded: (index: number) => boolean;
    setExpanded: (index: number) => void;
}

export default function Logs() {
    const { data: logs, isLoading, error } = useApi<LogEntry[]>('/api/logs');

    const [expansionStatus, { updateAt }] = useList<boolean>();

    const isExpanded = (index: number) => !!expansionStatus[index];

    const setExpanded = (index: number) => {
        updateAt(index, !expansionStatus[index]);
    };

    if (isLoading) {
        return <CircularProgress />;
    }

    if (error || !logs) {
        return <Typography>Unable to load logs - ${error}</Typography>;
    }

    return (
        <Box width="100%" height="100%">
            <AutoSizer>
                {({ width, height }) => (
                    <TableVirtuoso<LogEntry, TableContext>
                        width={width}
                        height={height}
                        style={{ height, width }}
                        data={logs}
                        components={{
                            Scroller,
                            Table: VirtuosoTable,
                            TableHead: VirtuosoTableHead,
                            TableRow: VirtuosoTableRow,
                            TableBody: VirtuosoTableBody,
                        }}
                        fixedHeaderContent={FixedHeaderContent}
                        initialTopMostItemIndex={logs.length}
                        context={{ isExpanded, setExpanded }}
                    />
                )}
            </AutoSizer>
        </Box>
    );
}
