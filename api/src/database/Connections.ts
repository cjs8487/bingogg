import { ConnectionService } from '@prisma/client';
import { prisma } from './Database';

export const createRacetimeConnection = async (
    user: string,
    refreshToken: string,
) => {
    return prisma.connection.create({
        data: {
            user: { connect: { id: user } },
            service: ConnectionService.RACETIME,
            serviceId: '',
            refreshToken: refreshToken,
        },
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
