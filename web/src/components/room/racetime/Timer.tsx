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
        racetimeConnection: { startDelay, started },
    } = roomData;

    if (!startDelay) {
        return null;
    }

    let startDt: DateTime | undefined;
    if (started) {
        startDt = DateTime.fromISO(started);
    }
    const offset = Duration.fromISO(startDelay);

    return <TimerDisplay start={startDt} offset={offset} />;
}

function TimerDisplay({
    start,
    offset,
}: {
    start?: DateTime;
    offset: Duration;
}) {
    const [updateTimer, setUpdateTimer] = useState(true);
    const [dur, setDur] = useState<Duration>(offset);

    useInterval(
        () => {
            if (!start) {
                return;
            }
            setDur(DateTime.now().diff(start).normalize());
        },
        updateTimer ? (start ? 10 : 1000) : null,
    );

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
        <Typography>
            {dur.toFormat('h:mm:ss')}.{dur.milliseconds % 10}
        </Typography>
    );
}
