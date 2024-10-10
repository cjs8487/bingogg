import { Prisma } from '@prisma/client';
import { logError } from '../../Logger';
import { prisma } from '../Database';

export const allGames = async (user?: string) => {
    const games = await prisma.game.findMany();
    if (user) {
        const favorites = (
            await prisma.user.findUnique({
                select: { favoritedGames: { select: { id: true } } },
                where: { id: user },
            })
        )?.favoritedGames.map((game) => game.id);
        return games.map((game) => ({
            ...game,
            favorited: favorites?.includes(game.id),
        }));
    }
    return games.map((game) => ({ ...game, favorite: false }));
};

export const gameForSlug = (slug: string) => {
    return prisma.game.findUnique({
        where: { slug },
        include: {
            owners: {
                select: { id: true, username: true },
            },
            moderators: {
                select: { id: true, username: true },
            },
        },
    });
};

export const createGame = async (
    name: string,
    slug: string,
    coverImage?: string,
    owners?: string[],
    moderators?: string[],
) => {
    try {
        return prisma.game.create({
            data: {
                name,
                slug,
                coverImage,
                owners: {
                    connect: owners?.map((o) => ({ id: o })),
                },
                moderators: {
                    connect: moderators?.map((m) => ({ id: m })),
                },
            },
        });
    } catch (error: unknown) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return {
                    statusCode: 400,
                    message: 'Game with this slug already exists',
                };
            }
            logError(`Database Known Client error - ${error.message}`);
            return { statusCode: 500, message: 'Database error' };
        }
        logError(`Database Unknown error - ${error}`);
    }
};

export const deleteGame = (slug: string) => {
    return prisma.game.delete({ where: { slug } });
};

export const goalCount = async (slug: string) => {
    const game = await gameForSlug(slug);
    if (!game) {
        return -1;
    }
    return prisma.goal.count({
        where: { gameId: game.id },
    });
};

export const updateGameName = (slug: string, name: string) => {
    return prisma.game.update({ where: { slug }, data: { name } });
};

export const updateGameCover = (slug: string, coverImage: string) => {
    return prisma.game.update({ where: { slug }, data: { coverImage } });
};

export const updateSRLv5Enabled = (slug: string, enableSRLv5: boolean) => {
    return prisma.game.update({ where: { slug }, data: { enableSRLv5 } });
};

export const updateRacetimeCategory = (
    slug: string,
    racetimeCategory: string,
) => {
    return prisma.game.update({ where: { slug }, data: { racetimeCategory } });
};

export const updateRacetimeGoal = (slug: string, racetimeGoal: string) => {
    return prisma.game.update({ where: { slug }, data: { racetimeGoal } });
};

export const getRacetimeConfiguration = (slug: string) => {
    return prisma.game.findUnique({
        select: { racetimeCategory: true, racetimeGoal: true },
        where: { slug },
    });
};

export const addOwners = (slug: string, users: string[]) => {
    return prisma.game.update({
        where: { slug },
        data: { owners: { connect: users.map((user) => ({ id: user })) } },
    });
};

export const addModerators = (slug: string, users: string[]) => {
    return prisma.game.update({
        where: { slug },
        data: { moderators: { connect: users.map((user) => ({ id: user })) } },
    });
};

export const removeOwner = (slug: string, user: string) => {
    return prisma.game.update({
        where: { slug },
        data: { owners: { disconnect: { id: user } } },
    });
};

export const removeModerator = (slug: string, user: string) => {
    return prisma.game.update({
        where: { slug },
        data: { moderators: { disconnect: { id: user } } },
    });
};

export const isOwner = async (slug: string, user: string) => {
    return (
        (await prisma.game.count({
            where: { slug, owners: { some: { id: user } } },
        })) > 0
    );
};

/**
 * Checks if the user is at least a moderator of the game
 * @param slug the game's slug for which to check user permissions
 * @param user the user's id to check permissions for'
 * @returns true if the user is a moderator or owner of the game, false otherwise
 */
export const isModerator = async (slug: string, user: string) => {
    return (
        (await prisma.game.count({
            where: {
                AND: [
                    { slug },
                    {
                        OR: [
                            { owners: { some: { id: user } } },
                            { moderators: { some: { id: user } } },
                        ],
                    },
                ],
            },
        })) > 0
    );
};

export const favoriteGame = async (slug: string, user: string) => {
    return prisma.user.update({
        where: { id: user },
        data: { favoritedGames: { connect: { slug } } },
    });
};

export const unfavoriteGame = async (slug: string, user: string) => {
    return prisma.user.update({
        where: { id: user },
        data: { favoritedGames: { disconnect: { slug } } },
    });
};
