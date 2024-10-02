import { Router } from 'express';
import {
    addModerators,
    addOwners,
    allGames,
    allGamePlatforms,
    createGame,
    gameForSlug,
    isModerator,
    isOwner,
    removeModerator,
    removeOwner,
    updateGameCover,
    updateGameName,
    updateRacetimeCategory,
    updateRacetimeGoal,
    updateSRLv5Enabled,
    updateGameSettings,
    allGameGenres,
} from '../../database/games/Games';
import { createGoal, goalsForGame } from '../../database/games/Goals';
import { getUser, getUsersEligibleToModerateGame } from '../../database/Users';
import axios from 'axios';
import { logError } from '../../Logger';

const games = Router();

games.get('/', async (req, res) => {
    const result = await allGames();
    res.status(200).json(result);
});

// Get platforms for games
games.get('/platforms', async (req, res) => {
    try {
        const platforms = await allGamePlatforms();
        res.status(200).json(platforms);
    } catch (error) {
        res.sendStatus(500);
    }
});

// Get genres for games
games.get('/genres', async (req, res) => {
    try {
        const genres = await allGameGenres();
        res.status(200).json(genres);
    } catch (error) {
        res.sendStatus(500);
    }
});

// Cache for the access token and expiration
let twitchAccessToken: string | null = null;
let tokenExpiresAt: number = 0;

async function getTwitchToken() {
    const currentTime = Date.now();

    // If the token is valid and not expired, return it
    if (twitchAccessToken && tokenExpiresAt > currentTime) {
        return twitchAccessToken;
    }

    try {
        // Fetch a new token if expired or not set
        const response = await axios.post(
            'https://id.twitch.tv/oauth2/token',
            new URLSearchParams({
                client_id: process.env.TWITCH_CLIENT_ID!, // Store client_id in .env
                client_secret: process.env.TWITCH_CLIENT_SECRET!, // Store client_secret in .env
                grant_type: 'client_credentials',
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        const data = response.data;
        twitchAccessToken = data.access_token;

        // Calculate the token expiration time (current time + expires_in)
        tokenExpiresAt = currentTime + data.expires_in * 1000; // expires_in is in seconds

        return twitchAccessToken;
    } catch (error) {
        logError('Failed to fetch Twitch token');
        throw new Error('Failed to fetch Twitch token');
    } 
}

// Route to get game suggestions from IGDB
games.get('/suggestions', async (req, res) => {
    const { q } = req.query; // The search query from the user input

    if (!q) {
        res.status(400).send('Missing query parameter');
        return;
    }

    // Check if the Client ID is set in the environment variables
    if (!process.env.TWITCH_CLIENT_ID || !process.env.TWITCH_CLIENT_SECRET) {
        console.error('Twitch Client ID or Secret is missing');
        res.status(500).send('Missing Twitch credentials');
        return;
    }
    

    try {
        // Get the Twitch access token (from cache or new)
        const token = await getTwitchToken();

        // Call IGDB API for game suggestions based on the query
        const igdbResponse = await axios.post(
            'https://api.igdb.com/v4/games',
            `fields name, slug, first_release_date; search "${q}"; limit 10;`, // Adjust fields as needed
            {
                headers: {
                    'Client-ID': process.env.TWITCH_CLIENT_ID, // Use your client ID from Twitch
                    Authorization: `Bearer ${token}`, // Use the Bearer token from Twitch
                    'Content-Type': 'text/plain',
                },
            }
        );

        const games = igdbResponse.data;


        // Extract necessary fields like name, slug, year, etc.
        const suggestions = games.map((game: any) => ({
            name: game.name,
            slug: game.slug,
            year: game.first_release_date ? new Date(game.first_release_date * 1000).getFullYear() : null,
        }));

        res.status(200).json(suggestions);
    } catch (error) {
        logError('Failed to fetch game suggestions');
        res.status(500).send('Failed to fetch game suggestions');
    }
});

// In your games route handler file
games.get('/details', async (req, res) => {
    const { slug } = req.query; // Get the game slug from the query string

    if (!slug) {
        res.status(400).send('Missing slug parameter');
        return;
    }

    try {
        // Get the Twitch access token (from cache or new)
        const token = await getTwitchToken();

        // Call IGDB API for detailed game info using the slug
        const igdbResponse = await axios.post(
            'https://api.igdb.com/v4/games',
            `fields name, slug, first_release_date, genres.name, platforms.name, cover.url; where slug = "${slug}";`,
            {
                headers: {
                    'Client-ID': process.env.TWITCH_CLIENT_ID,
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'text/plain',
                },
            }
        );

        const gameDetails = igdbResponse.data[0]; // Assuming the response contains a single game
        
        // Format the data
        const result = {
            name: gameDetails.name,
            slug: gameDetails.slug,
            year: gameDetails.first_release_date ? new Date(gameDetails.first_release_date * 1000).getFullYear() : null,
            genres: gameDetails.genres ? gameDetails.genres.map((genre: any) => genre.name) : [],
            platforms: gameDetails.platforms ? gameDetails.platforms.map((platform: any) => platform.name) : [],
            coverImage: gameDetails.cover?.url || '', // If cover is present
        };

        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching game details:', error);
        res.status(500).send('Failed to fetch game details');
    }
});


games.get('/:slug', async (req, res) => {
    const { slug } = req.params;
    const result = await gameForSlug(slug);
    if (result) {
        res.status(200).json(result);
    } else {
        res.sendStatus(404);
    }
});

games.post('/', async (req, res) => {
    if (!req.session.user) {
        res.sendStatus(401);
        return;
    }
    
    const { name, slug, coverImage, platforms, year, genre } = req.body;

    if (!name) {
        res.status(400).send('Missing game name');
        return;
    }
    if (!slug) {
        res.status(400).send('Missing game slug');
        return;
    }

    try {
        const result = await createGame(
            name, 
            slug, 
            coverImage, 
            [req.session.user], // owners (current user)
            undefined, // moderators (none for now)
            platforms, // platforms received from request
            year, // year from request
            genre // genre from request
        );

        if (!result) {
            res.status(500).send('Failed to create game');
            return;
        }

        if ('statusCode' in result) {
            res.status(result.statusCode).send(result.message);
            return;
        }

        res.status(200).json(result);
    } catch (error) {
        res.status(500).send('Server error occurred while creating game');
    }
});


games.post('/:slug', async (req, res) => {
    const { slug } = req.params;
    const { name, metadata, enableSRLv5, racetimeCategory, racetimeGoal } = req.body;
    const { coverImage, year, genre, platforms } = metadata || {};

    console.log(` platforms: ${platforms}`);

    try {
        const result = await updateGameSettings(
            slug,
            name,
            coverImage,
            enableSRLv5,
            racetimeCategory,
            racetimeGoal,
            platforms,
            year,
            genre
        );

        res.status(200).json(result);
    } catch (error) {
        console.error('Failed to update game settings:', error);
        res.status(500).send('Failed to update game settings');
    }
});

games.get('/:slug/goals', async (req, res) => {

    const { slug } = req.params;
    const goals = await goalsForGame(slug);
    res.status(200).json(goals);
});

games.post('/:slug/goals', async (req, res) => {
    const { slug } = req.params;
    const { goal, description, categories, difficulty } = req.body;
    let difficultyNum: number | undefined = undefined;
    if (difficulty) {
        difficultyNum = Number(difficulty);
        if (Number.isNaN(difficultyNum)) {
            res.status(400).send('Invalid difficulty value');
            return;
        }
    }
    if (!goal) {
        res.status(400).send('Missing goal text');
        return;
    }
    const newGoal = await createGoal(
        slug,
        goal,
        description,
        categories,
        difficultyNum,
    );
    res.status(200).json(newGoal);
});

games.get('/:slug/eligibleMods', async (req, res) => {
    const { slug } = req.params;
    const userList = await getUsersEligibleToModerateGame(slug);
    res.status(200).json(userList);
});

games.post('/:slug/owners', async (req, res) => {
    const { slug } = req.params;
    const { users } = req.body;

    if (!req.session.user) {
        res.sendStatus(401);
        return;
    }
    if (!isOwner(slug, req.session.user)) {
        res.sendStatus(403);
        return;
    }

    if (!users) {
        res.status(400).send('Missing users');
        return;
    }
    if (!Array.isArray(users)) {
        res.status(400).send('Users parameter is not an array');
        return;
    }
    const allUsersExist = (
        await Promise.all(
            users.map(async (user) => {
                if (!getUser(user)) {
                    return false;
                }
                return true;
            }),
        )
    ).every((b) => b);

    if (!allUsersExist) {
        res.sendStatus(400);
        return;
    }

    await addOwners(slug, users);
    res.sendStatus(200);
});

games.delete('/:slug/owners', async (req, res) => {
    const { slug } = req.params;
    const { user } = req.body;

    if (!req.session.user) {
        res.sendStatus(401);
        return;
    }
    if (!isOwner(slug, req.session.user)) {
        res.sendStatus(403);
        return;
    }

    if (!user) {
        res.status(400).send('Missing user');
        return;
    }
    if (!getUser(user)) {
        res.sendStatus(404);
        return;
    }
    const game = await gameForSlug(slug);
    if (!game) {
        res.sendStatus(404);
        return;
    }
    if (game.owners.length <= 1) {
        res.status(400).send('Cannot remove the last owner of a game.');
    }

    await removeOwner(slug, user);
    res.sendStatus(200);
});

games.post('/:slug/moderators', async (req, res) => {
    const { slug } = req.params;
    const { users } = req.body;

    if (!req.session.user) {
        res.sendStatus(401);
        return;
    }
    if (!isOwner(slug, req.session.user)) {
        res.sendStatus(403);
        return;
    }

    if (!users) {
        res.status(400).send('Missing users');
        return;
    }
    if (!Array.isArray(users)) {
        res.status(400).send('Users parameter is not an array');
        return;
    }
    const allUsersExist = (
        await Promise.all(
            users.map(async (user) => {
                if (!getUser(user)) {
                    return false;
                }
                return true;
            }),
        )
    ).every((b) => b);

    if (!allUsersExist) {
        res.sendStatus(400);
        return;
    }

    await addModerators(slug, users);
    res.sendStatus(200);
});

games.delete('/:slug/moderators', async (req, res) => {
    const { slug } = req.params;
    const { user } = req.body;

    if (!req.session.user) {
        res.sendStatus(401);
        return;
    }
    if (!isOwner(slug, req.session.user)) {
        res.sendStatus(403);
        return;
    }

    if (!user) {
        res.status(400).send('Missing user');
        return;
    }
    if (!getUser(user)) {
        res.sendStatus(404);
        return;
    }

    await removeModerator(slug, user);
    res.sendStatus(200);
});

games.get('/:slug/permissions', async (req, res) => {
    const { slug } = req.params;

    if (!req.session.user) {
        res.sendStatus(401);
        return;
    }

    res.status(200).json({
        isOwner: await isOwner(slug, req.session.user),
        canModerate: await isModerator(slug, req.session.user),
    });
});



export default games;
