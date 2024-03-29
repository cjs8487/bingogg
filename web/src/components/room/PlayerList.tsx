import { useContext } from 'react';
import { RoomContext } from '../../context/RoomContext';

export default function PlayerList() {
    const { players } = useContext(RoomContext);
    return (
        <div className="block max-h-full overflow-y-auto rounded-md border border-border bg-foreground px-3 py-2">
            <div className="pb-1 text-lg font-semibold">Connected Players</div>
            <div className="flex flex-col gap-y-3">
                {players.map((player) => (
                    <div key={player.nickname} className="flex gap-x-2">
                        <div
                            className="rounded-md border px-1"
                            style={{ background: player.color }}
                        >
                            {player.goalCount}
                        </div>
                        <div>{player.nickname}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
