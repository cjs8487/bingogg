import { RoomTokenPayload } from '../../../auth/RoomAuth';
import Room from '../../../core/Room';
import { handleRacetimeAction } from './RacetimeActions';

// Actions are psuedo-endpoints that allow consumers to execute actions on a bingo
// room. These endpoints offer simpler setup for performing actions than doing so over
// websocket, especially when the action requires access to web sessions. While websocket
// connections are allowed access to web sessions, not all consumers are eligible for or
// can maintain a web session. As much as possible, action endpoints try to send a helpful
// status and message, regardless of the outcome. However, given the nature of
// some of these actions (especially integration related actions), it is not
// always possible (or reasonable) for the endpoint to block and/or determine
// if the action was successful (success is also a fairly difficult thing to
// define in some cases). As such, the only guarantee that action endpoints make
// is that if a 4xx or 5xx code is sent, the action did not dispatch or was
// obviously unsuccessful, and that a 2xx status code indicates that the action
// was successfully dispatched for processing. The successful completion of an
// action will always result in an appropriate room update being dispatched. It
// is up to consuming applications to watch for updates via their preferred
// mechanism if they need to react to the success/completion of the action. It
// is generally not recommended to act based on the success of actions, and to
// display and act on the state of the room based on the data the server sends
// out, as that is the source of truth, and relying on manual or predicted triggers
// is very likely to result in a desync.
//
// 4xx status codes typically indicate that the action failed to dispatch to due an
// error that the client should have been able to detect, such as improper configuration
// or invalid web session state to take the action (i.e. not logged in
//
// 5xx status codes typically indicate that an error was detected while dispatching the
// action, and typically indicate an upstream problem, especially when they occur within
// actions that interact with external services.

interface ActionResultBase {
    code: number;
}

interface ActionResultError extends ActionResultBase {
    message: string;
}

interface ActionResultValue<T> extends ActionResultBase {
    value: T;
}

export type ActionResult<T = unknown> =
    | ActionResultValue<T>
    | ActionResultError;

export const handleAction = async (
    room: Room,
    action: string,
    user: string,
    roomToken: RoomTokenPayload,
): Promise<ActionResult<unknown> | ActionResultError> => {
    const [module, remaining] = action.split('/', 2);
    switch (module) {
        case 'racetime':
            return handleRacetimeAction(room, remaining, user, roomToken);
        default:
            return handleCoreAction(room, module);
    }
};

export const unknownAction = (room: Room) => {
    room.logInfo('Unknown action request');
    return {
        code: 400,
        message: 'Unknown action',
    };
};

const handleCoreAction = (room: Room, action: string) => {
    switch (action) {
        default:
            return unknownAction(room);
    }
};
