import { randomUUID } from 'crypto';
import { prisma } from '../Database';

export const getAllTokens = async () => {
    const tokens = await prisma.apiToken.findMany();
    return tokens.map((token) => ({
        id: token.id,
        name: token.name,
        token: token.token,
        active: token.active && !token.revokedOn,
    }));
};

export const createApiToken = async (name: string) => {
    const token = randomUUID();
    return prisma.apiToken.create({
        data: {
            name,
            token,
        },
    });
};
