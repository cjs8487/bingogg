import { Bounce, toast } from 'react-toastify';
import { User } from '../types/User';
import { Game } from '../types/Game';

export function alertError(message: string) {
    toast.error(message, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'colored',
        transition: Bounce,
    });
}

export function notifyMessage(message: string) {
    toast(message, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'colored',
        transition: Bounce,
    });
}

export function isUserModerator(user: User, game: Game) {
    return (
        (!!game.owners &&
            game.owners.filter((o) => o.id === user.id).length > 0) ||
        (!!game.moderators &&
            game.moderators.filter((m) => m.id === user.id).length > 0)
    );
}
