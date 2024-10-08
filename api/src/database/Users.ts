import { randomBytes } from 'crypto';
import { prisma } from './Database';
import { ConnectionService } from '@prisma/client';

export const userByEmail = (email: string) => {
    return prisma.user.findUnique({ select: { id: true }, where: { email } });
};

export const userByUsername = (username: string) => {
    return prisma.user.findUnique({
        select: { id: true },
        where: { username },
    });
};

export const emailUsed = async (email: string) => {
    const user = await userByEmail(email);
    if (user) {
        return true;
    }
    return false;
};

export const usernameUsed = async (username: string) => {
    const user = await userByUsername(username);
    if (user) {
        return true;
    }
    return false;
};

export const registerUser = async (
    email: string,
    username: string,
    password: Buffer,
    salt: Buffer,
) => {
    try {
        const user = await prisma.user.create({
            data: { email, username, password, salt },
        });
        return user.id;
    } catch {
        return false;
    }
};

export const getSiteAuth = async (username: string) => {
    const user = await prisma.user.findUnique({
        select: { id: true, password: true, salt: true },
        where: { username },
    });
    if (!user) {
        return undefined;
    }
    return user;
};

export const getUser = async (id: string, includeEmail?: boolean) => {
    const user = await prisma.user.findUnique({
        select: {
            id: true,
            username: true,
            staff: true,
            connections: {
                select: { service: true },
            },
            email: !!includeEmail,
        },
        where: { id },
    });
    if (!user) return null;
    return {
        id: user.id,
        username: user.username,
        staff: user.staff,
        racetimeConnected: user.connections.find(
            (c) => c.service === ConnectionService.RACETIME,
        )
            ? true
            : false,
        email: user.email,
    };
};

export const getUserByEmail = (email: string) => {
    return prisma.user.findUnique({ where: { email } });
};

export const getAllUsers = async () => {
    return prisma.user.findMany({ select: { id: true, username: true } });
};

export const getUsersEligibleToModerateGame = (game: string) => {
    return prisma.user.findMany({
        select: { id: true, username: true },
        where: {
            moderatedGames: { none: { slug: game } },
            ownedGames: { none: { slug: game } },
        },
    });
};

export const initiatePasswordReset = (user: string) => {
    const today = new Date();
    const expires = new Date();
    expires.setHours(today.getHours() + 1);
    return prisma.passwordReset.upsert({
        where: { userId: user },
        create: {
            user: { connect: { id: user } },
            token: randomBytes(16).toString('base64url'),
            expires,
        },
        update: { token: randomBytes(16).toString('base64url'), expires },
    });
};

export const validatePasswordReset = async (token: string) => {
    const resetToken = await prisma.passwordReset.findUnique({
        where: { token },
    });
    if (resetToken) {
        if (Date.now() < resetToken.expires.getTime()) {
            return resetToken;
        }
    }
    return false;
};

export const completePasswordReset = (token: string) => {
    return prisma.passwordReset.delete({ where: { token } });
};

export const changePassword = (
    user: string,
    password: Buffer,
    salt: Buffer,
) => {
    return prisma.user.update({
        where: { id: user },
        data: { password, salt },
    });
};
