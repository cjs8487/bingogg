import { Prisma } from '@prisma/client';
import { logDebug, logError } from '../../Logger';
import { prisma } from '../Database';

export const allGames = () => {
    return prisma.game.findMany({
        include: {
            owners: {
                select: { id: true, username: true },
            },
            moderators: {
                select: { id: true, username: true },
            },
            metadata: {
                select: {
                    coverImage: true,
                    year: true,
                    genre: {
                        select: { 
                            gameGenre: { 
                                select: { name: true },
                            },
                        },
                    },
                    platforms: {
                        select: {
                            gamePlatform: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });
};

export const allGamePlatforms = () => {
    return prisma.gamePlatform.findMany({
        select: { name: true },
    });
}

export const allGameGenres = () => {
    return prisma.gameGenre.findMany({
        select: { name: true },
    });
}


export const gameForSlug = async (slug: string) => {
    const game = await prisma.game.findUnique({
        where: { slug },
        include: {
            owners: {
                select: { id: true, username: true },
            },
            moderators: {
                select: { id: true, username: true },
            },
            metadata: {
                select: {
                    coverImage: true,
                    year: true,
                    genre: {
                        select: {
                            gameGenre: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                    },
                    platforms: {
                        select: {
                            gamePlatform: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    if (!game || !game.name) {
        throw new Error("Game not found or game name is missing");
    }

    // Safely extract platforms, ensuring it is an array of platform names
    const platforms = game.metadata?.platforms?.map(
        (platform) => platform.gamePlatform.name
    ) || [];

    const genre = game.metadata?.genre?.map(
        (genre) => genre.gameGenre.name
    ) || [];

    // Return the game data with flattened genres and platforms for easier use
    return {
        ...game,
        owners: game.owners ?? [],  // Fallback to empty array if owners is undefined
        moderators: game.moderators ?? [],  // Fallback to empty array if moderators is undefined
        metadata: {
            ...game.metadata,
            platforms, // Return flattened platform names
            coverImage: game.metadata?.coverImage ?? '', // Fallback to empty string for coverImage
            year: game.metadata?.year ?? null, // Explicitly handle null or missing year
            genre
        },
    };
};




export const createGame = async (
    name: string,
    slug: string,
    coverImage?: string,
    owners?: string[], // User IDs for owners
    moderators?: string[], // User IDs for moderators
    platforms?: string[], // Platforms as strings
    year?: number, // Year of release
    genre?: string[] // Genres as strings
) => {
    try {
        
        return prisma.game.create({
            data: {
                name,
                slug,
                owners: {
                    connect: owners?.map((o) => ({ id: o })),
                },
                moderators: {
                    connect: moderators?.map((m) => ({ id: m })),
                },
                metadata: {
                    create: {
                        coverImage,
                        year,
                        genre: {
                            create: genre?.map((genreName) => ({
                                gameGenre: {
                                    connectOrCreate: {
                                        where: { name: genreName }, // Connect if genre exists
                                        create: { name: genreName }, // Create if genre doesn't exist
                                    },
                                },
                            })),
                        },
                        platforms: {
                            create: platforms?.map((platformName) => ({
                                gamePlatform: {
                                    connectOrCreate: {
                                        where: { name: platformName }, // Connect if platform exists
                                        create: { name: platformName }, // Create if platform doesn't exist
                                    },
                                },
                            })),
                        },
                    },
                },
            },
        });
    } catch (error: unknown) {
        
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return { statusCode: 400, message: "Game with this slug already exists" };
            }
            logError(`Database Known Client error - ${error.message}`);
            
            return { statusCode: 500, message: "Database error" };
        }
        logError(`Database Unknown error - ${error}`);
        
        return { statusCode: 500, message: "Unknown error" };
    }
};



export const deleteGame = (slug: string) => {
    return prisma.game.delete({ where: { slug } });
};

export const goalCount = async (slug: string) => {
    const game = await gameForSlug(slug)
    if (!game) {
        return -1;
    }
    return prisma.goal.count({
        where: {gameId: game.id}
    });
}

export const updateGameName = (slug: string, name: string) => {
    return prisma.game.update({ where: { slug }, data: { name } });
};

export const updateGameCover = (slug: string, coverImage: string) => {
    return prisma.game.update({
        where: { slug },
        data: {
            metadata: {
                update: {
                    coverImage, // Update the coverImage in the metadata
                },
            },
        },
    });
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

export const updateGameSettings = async (
    slug: string,
    name?: string,
    coverImage?: string,
    enableSRLv5?: boolean,
    racetimeCategory?: string,
    racetimeGoal?: string,
    platforms?: string[],
    year?: number,
    genre?: string[]
) => {
    try {
        const updateData: Prisma.GameUpdateInput = {
            name,
            enableSRLv5,
            racetimeCategory,
            racetimeGoal,
            metadata: {
                update: {
                    coverImage,
                    year,
                    genre: {
                        deleteMany: {}, // Clear previous genres
                        create: genre?.map((genreName) => ({
                            gameGenre: {
                                connectOrCreate: {
                                    where: { name: genreName },
                                    create: { name: genreName },
                                },
                            },
                        })),
                    },
                    platforms: {
                        deleteMany: {}, // Clear previous platforms
                        create: platforms?.map((platformName) => ({
                            gamePlatform: {
                                connectOrCreate: {
                                    where: { name: platformName },
                                    create: { name: platformName },
                                },
                            },
                        })),
                    },
                },
            },
        };

        // Remove undefined fields from updateData
        Object.keys(updateData).forEach((key) => {
            if (updateData[key as keyof Prisma.GameUpdateInput] === undefined) {
                delete updateData[key as keyof Prisma.GameUpdateInput];
            }
        });

        console.log(updateData.metadata);

        return await prisma.game.update({
            where: { slug },
            data: updateData,
        });
    } catch (error) {
        logError(`Failed to update game settings for slug ${slug}: ${error}`);
        throw error;
    }
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
