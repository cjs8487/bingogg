'use client';
import { Form, Formik } from 'formik';
import { useRouter } from 'next/navigation';
import { useContext, useLayoutEffect, useState, useEffect } from 'react';
import * as yup from 'yup';
import { UserContext } from '../../../../context/UserContext';
import { alertError } from '../../../../lib/Utils';
import { Box, Button, Typography, TextField } from '@mui/material';
import FormikTextField from '../../../../components/input/FormikTextField';
import FormikApiSelectAutocomplete from '@/components/input/FormikApiSelectFieldAutocomplete';
import { Autocomplete } from '@mui/material';

const currentYear = new Date().getFullYear();
const maxYear = currentYear + 10;

const newGameValidationSchema = yup.object().shape({
    name: yup.string().required('Game name is required'),
    slug: yup
        .string()
        .required('Game slug is required')
        .min(2, 'Slugs must be at least 5 characters')
        .max(64, 'Slugs cannot be longer than 64 characters'),
    coverImage: yup
        .string()
        .url('Game cover image must be a valid URL pointing to the image'),
    year: yup
        .number()
        .integer('Year must be a valid number')
        .min(1901, `Year must be between 1901 and ${maxYear}`)
        .max(maxYear, `Year must be between 1901 and ${maxYear}`)
        .nullable(),
    genre: yup.array().of(yup.string()).min(1, 'At least one genre is required'),
    platforms: yup.array().of(yup.string()).min(1, 'At least one platform is required'),
});

interface GameDetails {
    name: string;
    slug: string;
    year: number | null;
    genres: string[];
    platforms: string[];
    coverImage: string;
}

const sanitizeAndSetCoverImage = (coverImage: string) => {
    if (coverImage.startsWith('//')) {
        coverImage = `https:${coverImage}`;
    }
    return coverImage;
};

export default function NewGame() {
    const { loggedIn } = useContext(UserContext);
    const router = useRouter();
    const [gameSuggestions, setGameSuggestions] = useState<GameDetails[]>([]);
    const [searchTerm, setSearchTerm] = useState('');  // Controlled search input
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);  // Debounced value

    // Debounce effect to limit API calls
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500); // Debounce delay of 500ms

        return () => {
            clearTimeout(handler); // Clean up timeout on searchTerm change
        };
    }, [searchTerm]);

    // Fetch game suggestions only if the debounced search term has 2 or more characters
    useEffect(() => {
        if (debouncedSearchTerm.length >= 2) {
            fetchGameSuggestions(debouncedSearchTerm);
        } else {
            setGameSuggestions([]);  // Clear suggestions if search term is too short
        }
    }, [debouncedSearchTerm]);

    // Function to fetch game suggestions based on user input
    const fetchGameSuggestions = async (query: string) => {
        const res = await fetch(`/api/games/suggestions?q=${query}`);
        if (res.ok) {
            const data = await res.json();
            setGameSuggestions(data);
        } else {
            alertError('Unable to fetch game suggestions');
        }
    };

    // Function to fetch additional game details based on selected game
    const fetchGameDetails = async (slug: string, setFieldValue: any) => {
        const res = await fetch(`/api/games/details?slug=${slug}`);
        if (res.ok) {
            const gameDetails: GameDetails = await res.json();
            // Populate the form fields
            setFieldValue('name', gameDetails.name);
            setFieldValue('slug', gameDetails.slug);
            setFieldValue('year', gameDetails.year);
            setFieldValue('genre', gameDetails.genres);
            setFieldValue('platforms', gameDetails.platforms);
            setFieldValue('coverImage', sanitizeAndSetCoverImage(gameDetails.coverImage));
        } else {
            alertError('Unable to fetch game details');
        }
    };

    useLayoutEffect(() => {
        if (!loggedIn) {
            router.push('/');
        }
    }, [loggedIn, router]);

    if (!loggedIn) {
        return null;
    }

    return (
        <Box flexGrow={1} px={4} width="100%">
            <Typography variant="h4" align="center" py={2}>
                Create a new game
            </Typography>
            <Formik
                initialValues={{ name: '', slug: '', coverImage: '', year: '', genre: [], platforms: [] }}
                validationSchema={newGameValidationSchema}
                onSubmit={async (values) => {
                    const res = await fetch('/api/games', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(values),
                    });
                    if (!res.ok) {
                        const error = await res.text();
                        alertError(`Unable to create game - ${error}`);
                        return;
                    }
                    router.push('/');
                }}
            >
                {({ values, setFieldValue }) => (
                    <Form>
                        <Box display="flex" flexDirection="column" width="100%" rowGap={1}>
                            {/* Game Name and Search Suggestions */}
                            <Autocomplete
                                id="game-suggestions"
                                options={gameSuggestions.map((game) => game.name)}
                                inputValue={values.name}  // Controlled input, tied to the game name
                                onInputChange={(_, newValue) => {
                                    setSearchTerm(newValue);  // Update search term for debounce
                                    setFieldValue('name', newValue);  // Update form field for game name
                                }}
                                onChange={(_, selectedGame) => {
                                    const game = gameSuggestions.find((g) => g.name === selectedGame);
                                    if (game) {
                                        fetchGameDetails(game.slug, setFieldValue);
                                    }
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Search for a game"
                                        placeholder="Start typing to search..."
                                    />
                                )}
                            />

                            <FormikTextField id="game-slug" name="slug" label="Slug" />
                            <FormikTextField id="game-cover-image" name="coverImage" label="Cover Image" />
                            <FormikTextField id="game-year" name="year" label="Year" type="number" />

                            {/* Genres */}
                            <FormikApiSelectAutocomplete
                                id="game-genres"
                                name="genre"
                                label="Genres"
                                api="/api/games/genres"
                                autocomplete={true}
                                multiple={true}
                            />

                            {/* Platforms */}
                            <FormikApiSelectAutocomplete
                                id="game-platforms"
                                name="platforms"
                                label="Platforms"
                                api="/api/games/platforms"
                                autocomplete={true}
                                multiple={true}
                            />

                            <Box display="flex">
                                <Box flexGrow={1} />
                                <Button type="submit">Submit</Button>
                            </Box>
                        </Box>
                    </Form>
                )}
            </Formik>
        </Box>
    );
}
