import { RawData, WebSocket } from 'ws';
import { racetimeHost } from '../../Environment';
import { disconnectRoomFromRacetime } from '../../database/Rooms';
import Room from '../Room';

interface User {
    id: string;
    full_name: string;
    name: string;
    discriminator: string;
    url: string;
    avatar: string;
    pronouns: string;
    flair: string;
    twitch_name: string;
    twitch_channel: string;
    can_moderate: boolean;
}

type RaceStatus =
    | 'open'
    | 'invitational'
    | 'pending'
    | 'in_progress'
    | 'finished'
    | 'cancelled';

interface RaceData {
    version: number;
    status: {
        value: RaceStatus;
        verbose_value: string;
        help_text: string;
    };
    entrants_count: number;
    entrants_count_finished: number;
    entrants_count_inactive: number;
    entrants: {
        user: User;
        status: {
            value:
                | 'requested'
                | 'invited'
                | 'declined'
                | 'ready'
                | 'not_ready'
                | 'in_progress'
                | 'done'
                | 'dnf'
                | 'dq';
            verbosse_value: string;
            help_text: string;
        };
    }[];
}

interface RaceDataMessage {
    type: 'race.data';
    race: RaceData;
}

type WebSocketMessage = RaceDataMessage;

export default class RacetimeHandler {
    /**The room this handler is connected to */
    room: Room;
    /**If the room has an associated racetime race, regardless of current race status */
    connected: boolean = false;
    /**Race room full url */
    url?: string;
    /**Websocket connected to the race room websocket. This socket may be
     * authorized as any user at any given time */
    socket?: WebSocket;
    /**True if the room is actively connected to the websocket*/
    websocketConnected = false;
    /** Current version of the race rooms data*/
    data?: RaceData;

    constructor(room: Room) {
        this.room = room;
    }

    connect(url: string) {
        this.connected = true;
        this.url = url;
    }

    disconnect() {
        this.connected = false;
        this.websocketConnected = false;
        this.url = undefined;
        if (this.socket) {
            this.socket.close();
        }
        this.socket = undefined;
        disconnectRoomFromRacetime(this.room.slug).then();
    }

    async connectWebsocket() {
        const racetimeRes = await fetch(`${this.url}/data`);
        if (!racetimeRes.ok) {
            this.room.handleRacetimeRoomDisconnected();
            return;
        }
        const data = (await racetimeRes.json()) as RaceData & {
            websocket_oauth_url: string;
        };

        this.socket = new WebSocket(
            `${racetimeHost.replace('http', 'ws')}${data.websocket_oauth_url}`,
        );
        this.socket.on('message', this.handleWebsocketMessage.bind(this));
        this.socket.on('close', () => {
            this.websocketConnected = false;
        });
        this.websocketConnected = true;
    }

    private updateData(data: RaceData) {
        if (!this.data || this.data.version < data.version) {
            this.data = data;
        }

        if (this.data.status.value === 'cancelled') {
            this.disconnect();
        }
    }

    handleWebsocketMessage(data: RawData) {
        const message: WebSocketMessage = JSON.parse(data.toString());
        switch (message.type) {
            case 'race.data':
                this.updateData(message.race);
                break;
        }
    }

    getPlayer(id: string) {
        return this.data?.entrants.find((u) => u.user.id === id);
    }

    joinUser(token: string) {
        if (!this.connected || !this.websocketConnected || !this.socket) {
            return false;
        }
        this.socket.send(
            JSON.stringify({
                action: 'authenticate',
                data: { oauth_token: `${token}` },
            }),
        );
        this.socket.send(JSON.stringify({ action: 'join' }));
        return true;
    }

    async refresh() {
        const racetimeRes = await fetch(`${this.url}/data`);
        if (!racetimeRes.ok) {
            disconnectRoomFromRacetime(this.room.slug).then();
            this.room.handleRacetimeRoomDisconnected();
            return;
        }
        this.data = (await racetimeRes.json()) as RaceData;
        if (this.data.status.value === 'cancelled') {
            disconnectRoomFromRacetime(this.room.slug).then();
            this.disconnect();
            this.room.handleRacetimeRoomDisconnected();
        }
    }
}
