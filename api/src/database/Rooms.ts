import { RoomActionType, RoomStatus } from '@prisma/client';
import { prisma } from './Database';
import { JsonObject } from '@prisma/client/runtime/library';

export const createRoom = (
    slug: string,
    name: string,
    game: string,
    isPrivate: boolean,
    password: string,
    status: RoomStatus = "OPEN",
) => {
    return prisma.room.create({
        data: {
            slug,
            name,
            private: isPrivate,
            game: { connect: { id: game } },
            password,
            status,
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

export const setRoomOpen = async (room: string) => {
    await prisma.room.update({ where: { id: room }, data: { status: "OPEN" } });
}

export const setRoomClosed = async (room: string) => {
    await prisma.room.update({ where: { id: room }, data: { status: "CLOSED" } });
}

export const setRoomRunning = async (room: string) => {
    await prisma.room.update({ where: { id: room }, data: { status: "RUNNING" } });
}

export const setRoomFinished = async (room: string) => {
    await prisma.room.update({ where: { id: room }, data: { status: "FINISHED" } });
}

export const setRoomArchived = async (room: string) => {
    await prisma.room.update({ where: { id: room }, data: { status: "ARCHIVED" } });
}

export const getFullRoomList = () => {
    // exclude archived rooms, they are not relevant for the client
    return prisma.room.findMany({ include: { game: true }, where: { status: { not: "ARCHIVED" } } }); 
};

export const getAllRooms = () => {
    // exclude archived rooms, they are not relevant for the client
    return prisma.room.findMany({ include: { history: true }, where: { status: { not: "ARCHIVED" } } });
};

export const getRoomFromSlug = (slug: string) => {
    return prisma.room.findUnique({
        where: { slug },
        include: { history: true, game: true },
    });
};
