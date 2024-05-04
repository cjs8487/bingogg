import { ConnectionService } from '@prisma/client';
import { prisma } from './Database';

export const createRacetimeConnection = async (
    user: string,
    racetimeId: string,
    refreshToken: string,
) => {
    return prisma.connection.create({
        data: {
            user: { connect: { id: user } },
            service: ConnectionService.RACETIME,
            serviceId: racetimeId,
            refreshToken: refreshToken,
        },
    });
};

export const updateRefreshToken = async (
    user: string,
    service: ConnectionService,
    newToken: string,
) => {
    const connection = await getConnectionForUser(user, service);
    if (!connection) {
        return;
    }
    return prisma.connection.update({
        where: { id: connection.id },
        data: { refreshToken: newToken },
    });
};

export const getConnectionForUser = (
    user: string,
    service: ConnectionService,
) => {
    return prisma.connection.findFirst({
        where: { user: { id: user }, service },
    });
};

export const deleteConnection = async (
    user: string,
    service: ConnectionService,
) => {
    const connection = await getConnectionForUser(user, service);
    if (!connection) {
        return;
    }
    return prisma.connection.delete({ where: { id: connection.id } });
};
