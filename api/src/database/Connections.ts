import { ConnectionService } from '@prisma/client';
import { prisma } from './Database';

export const createRacetimeConnection = async (
    user: string,
    accessToken: string,
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
