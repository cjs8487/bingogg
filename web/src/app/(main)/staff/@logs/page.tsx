'use client';
import {
    Box,
    CircularProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import { DateTime } from 'luxon';
import { forwardRef, useRef } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { TableProps, TableVirtuoso, TableVirtuosoHandle } from 'react-virtuoso';
import { useApi } from '../../../../lib/Hooks';
import { blue, blueGrey, orange, red } from '@mui/material/colors';

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

const FixedHeaderContent = () => (
    <TableRow
        sx={{
            backgroundColor: 'background.paper',
        }}
    >
        <TableCell>Timestamp</TableCell>
        <TableCell>Level</TableCell>
        <TableCell>Message</TableCell>
    </TableRow>
);

const ItemContent = (_index: number, entry: LogEntry) => (
    <>
        <TableCell sx={{ background: colorMap[entry.level] }}>
            {DateTime.fromISO(entry.timestamp).toLocaleString(
                DateTime.DATETIME_MED,
            )}
        </TableCell>
        <TableCell sx={{ background: colorMap[entry.level] }}>
            {entry.level}
        </TableCell>
        <TableCell sx={{ background: colorMap[entry.level] }}>
            {entry.room && `[${entry.room}] `}
            {entry.message}
        </TableCell>
    </>
);

export default function Logs() {
    const { data: logs, isLoading, error } = useApi<LogEntry[]>('/api/logs');

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
                    <TableVirtuoso
                        width={width}
                        height={height}
                        style={{ height, width }}
                        data={logs}
                        components={{
                            Scroller,
                            Table: VirtuosoTable,
                            TableHead: VirtuosoTableHead,
                            TableRow,
                            TableBody: VirtuosoTableBody,
                        }}
                        fixedHeaderContent={FixedHeaderContent}
                        itemContent={ItemContent}
                        initialTopMostItemIndex={logs.length}
                    />
                )}
            </AutoSizer>
        </Box>
    );
}
