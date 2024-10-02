import axios from 'axios';
import readline from 'readline';
import { PrismaClient, GamePlatform, GameGenre } from '@prisma/client';

const prisma = new PrismaClient();
const IGDB_BASE_URL = 'https://api.igdb.com/v4';
const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;

let twitchAccessToken: string | null = null;
let tokenExpiresAt: number = 0;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Function to prompt user for confirmation
const askConfirmation = (message: string): Promise<boolean> => {
  return new Promise((resolve) => {
    rl.question(message, (answer: string) => {
      resolve(answer.trim().toLowerCase() === 'y');
    });
  });
};

// Function to get a new Twitch token
const getTwitchToken = async () => {
  const currentTime = Date.now();

  if (twitchAccessToken && tokenExpiresAt > currentTime) {
    return twitchAccessToken;
  }

  const response = await axios.post(
    'https://id.twitch.tv/oauth2/token',
    new URLSearchParams({
      client_id: TWITCH_CLIENT_ID!,
      client_secret: TWITCH_CLIENT_SECRET!,
      grant_type: 'client_credentials',
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  twitchAccessToken = response.data.access_token;
  tokenExpiresAt = currentTime + response.data.expires_in * 1000;

  return twitchAccessToken;
};

// Function to seed platforms from IGDB
const seedPlatforms = async () => {
  try {
    const token = await getTwitchToken();
    const { data: platformsData } = await axios.post(
      `${IGDB_BASE_URL}/platforms`,
      'fields name; limit 500;',
      {
        headers: {
          'Client-ID': TWITCH_CLIENT_ID!,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'text/plain',
        },
      }
    );

    const platforms: Pick<GamePlatform, 'name'>[] = platformsData.map((platform: any) => ({
      name: platform.name,
    }));

    // Show the first 10 platforms and ask for confirmation
    console.log('First 10 platforms:', platforms.slice(0, 10));
    const confirmed = await askConfirmation('Proceed with seeding platforms? (y/n): ');

    if (!confirmed) {
      console.log('Aborted platform seeding');
      return;
    }

    for (const platform of platforms) {
      await prisma.gamePlatform.upsert({
        where: { name: platform.name },
        update: {},
        create: { name: platform.name },
      });
    }

    console.log('Platforms seeded successfully');
  } catch (error: unknown) {
    console.error('Error seeding platforms:', error);
  }
};

// Function to seed genres from IGDB
const seedGenres = async () => {
  try {
    const token = await getTwitchToken();
    const { data: genresData } = await axios.post(
      `${IGDB_BASE_URL}/genres`,
      'fields name; limit 500;',
      {
        headers: {
          'Client-ID': TWITCH_CLIENT_ID!,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'text/plain',
        },
      }
    );

    const genres: Pick<GameGenre, 'name'>[] = genresData.map((genre: any) => ({
      name: genre.name,
    }));

    // Show the first 10 genres and ask for confirmation
    console.log('First 10 genres:', genres.slice(0, 10));

    const confirmed = await askConfirmation('Proceed with seeding genres? (y/n): ');

    if (!confirmed) {
      console.log('Aborted genre seeding');
      return;
    }

    for (const genre of genres) {
      await prisma.gameGenre.upsert({
        where: { name: genre.name },
        update: {},
        create: { name: genre.name },
      });
    }

    console.log('Genres seeded successfully');
  } catch (error: unknown) {
    console.error('Error seeding genres:', error);
  }
};

// Execute the seeding function
const runSeed = async () => {
  await seedPlatforms();
  await seedGenres();
  rl.close(); // Close the readline interface after all prompts
};

runSeed();
