import { Typography } from '@mui/material';
import { DateTime, Duration } from 'luxon';
import { useContext, useEffect, useRef, useState } from 'react';
import { useInterval } from 'react-use';
import { RoomContext } from '../../../context/RoomContext';

export default function Timer() {
    const { roomData } = useContext(RoomContext);

    if (!roomData || !roomData.racetimeConnection) {
        return null;
    }

    const {
        racetimeConnection: { startDelay, started, ended },
    } = roomData;

    if (!startDelay) {
        return null;
    }

    let startDt: DateTime | undefined;
    if (started) {
        startDt = DateTime.fromISO(started);
    }
    let endDt: DateTime | undefined;
    if (ended) {
        endDt = DateTime.fromISO(ended);
    }
    const offset = Duration.fromISO(startDelay);

    return <TimerDisplay start={startDt} end={endDt} offset={offset} />;
}

function TimerDisplay({
    start,
    offset,
    end,
}: {
    start?: DateTime;
    end?: DateTime;
    offset: Duration;
}) {
    const [updateTimer, setUpdateTimer] = useState(true);
    const [dur, setDur] = useState<Duration>(
        start && end ? end.diff(start) : offset,
    );

    let interval;
    if (updateTimer) {
        if (end) {
            interval = null;
        } else if (start) {
            interval = 10;
        } else {
            interval = 1000;
        }
    } else {
        interval = null;
    }

    useInterval(() => {
        if (end && start) {
            setDur(end.diff(start));
        } else if (start) {
            setDur(DateTime.now().diff(start).normalize());
        }
    }, interval);

    useEffect(() => {
        const callback = () => {
            if (document.hidden) {
                setUpdateTimer(false);
            } else {
                setUpdateTimer(true);
            }
        };
        document.addEventListener('visibilitychange', callback);
        return () => document.removeEventListener('visibilitychange', callback);
    }, []);

    return (
        <Typography variant="h6">
            {dur.toFormat('h:mm:ss')}.{dur.milliseconds % 10}
        </Typography>
    );
}
