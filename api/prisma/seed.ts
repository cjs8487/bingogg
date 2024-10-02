import { pbkdf2Sync, randomBytes } from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database');

    console.log('Creating users');
    const salt = randomBytes(16);
    const passwordHash = pbkdf2Sync('password', salt, 10000, 64, 'sha256');
    const staff = await prisma.user.upsert({
        where: { email: 'staff@playbingo.gg' },
        update: {},
        create: {
            email: 'staff@playbingo.gg',
            username: 'staff',
            password: passwordHash,
            salt: salt,
            staff: true,
        },
    });
    const owner = await prisma.user.upsert({
        where: { email: 'owner@playbingo.gg' },
        update: {},
        create: {
            email: 'owner@playbingo.gg',
            username: 'owner',
            password: passwordHash,
            salt: salt,
        },
    });
    const mod = await prisma.user.upsert({
        where: { email: 'mod@playbingo.gg' },
        update: {},
        create: {
            email: 'mod@playbingo.gg',
            username: 'mod',
            password: passwordHash,
            salt: salt,
        },
    });
    const player = await prisma.user.upsert({
        where: { email: 'player@playbingo.gg' },
        update: {},
        create: {
            email: 'player@playbingo.gg',
            username: 'player',
            password: passwordHash,
            salt: salt,
        },
    });
    console.log(staff, owner, mod, player);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
