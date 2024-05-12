import { RoomActionType } from '@prisma/client';
import { prisma } from './Database';
import { JsonObject } from '@prisma/client/runtime/library';

export const createRoom = (
    slug: string,
    name: string,
    game: string,
    isPrivate: boolean,
    password: string,
) => {
    return prisma.room.create({
        data: {
            slug,
            name,
            private: isPrivate,
            game: { connect: { id: game } },
            password,
        },
    });
};

const addRoomAction = (
    room: string,
    action: RoomActionType,
    payload: JsonObject,
) => {
    return prisma.roomAction.create({
        data: {
            room: { connect: { id: room } },
            action,
            payload,
        },
    });
};

export const addJoinAction = (room: string, nickname: string, color: string) =>
    addRoomAction(room, RoomActionType.JOIN, { nickname, color });

export const addLeaveAction = (room: string, nickname: string, color: string) =>
    addRoomAction(room, RoomActionType.LEAVE, { nickname, color });

export const addMarkAction = (
    room: string,
    nickname: string,
    color: string,
    row: number,
    col: number,
) => addRoomAction(room, RoomActionType.MARK, { nickname, color, row, col });

export const addUnmarkAction = (
    room: string,
    nickname: string,
    color: string,
    row: number,
    col: number,
) => addRoomAction(room, RoomActionType.UNMARK, { nickname, color, row, col });

export const addChatAction = (
    room: string,
    nickname: string,
    color: string,
    message: string,
) => addRoomAction(room, RoomActionType.CHAT, { nickname, color, message });

export const addChangeColorAction = (
    room: string,
    nickname: string,
    oldColor: string,
    newColor: string,
) =>
    addRoomAction(room, RoomActionType.CHANGECOLOR, {
        nickname,
        oldColor,
        newColor,
    });

export const setRoomBoard = async (room: string, board: string[]) => {
    await prisma.room.update({ where: { id: room }, data: { board } });
};

export const getFullRoomList = () => {
    return prisma.room.findMany({ include: { game: true } });
};

export const getAllRooms = () => {
    return prisma.room.findMany({ include: { history: true } });
};

export const getRoomFromSlug = (slug: string) => {
    return prisma.room.findUnique({
        where: { slug },
        include: { history: true, game: true },
    });
};

export const connectRoomToRacetime = (slug: string, racetimeRoom: string) => {
    return prisma.room.update({ where: { slug }, data: { racetimeRoom } });
};

export const disconnectRoomFromRacetime = (slug: string) => {
    return prisma.room.update({
        where: { slug },
        data: { racetimeRoom: null },
    });
};
