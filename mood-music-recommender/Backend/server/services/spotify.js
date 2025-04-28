const axios = require('axios');
require('dotenv').config();

let accessToken = '';

const getAccessToken = async () => {
    const response = await axios.post(
        'https://accounts.spotify.com/api/token',
        'grant_type=client_credentials',
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
            }
        }
    );
    accessToken = response.data.access_token;
    return accessToken;
};

const moodConfigurations = {
    anger: {
        keywords: "intense aggressive bollywood",
        fallbackGenres: ["bollywood rock", "punjabi protest", "indie metal"],
        filters: {market: "IN"}
    },
    fear: {
        keywords: "dark ominous bollywood",
        fallbackGenres: ["bollywood horror", "dark indian classical", "tamil suspense"],
        filters: {market: "IN"}
    },
    happiness: {
        keywords: "upbeat cheerful bollywood",
        fallbackGenres: ["bollywood dance", "punjabi pop", "indie hindi happy"],
        filters: {market: "IN"}
    },
    sadness: {
        keywords: "melancholic emotional bollywood",
        fallbackGenres: ["bollywood sad", "urdu ghazal", "indie hindi emotional"],
        filters: {market: "IN"}
    },
    surprise: {
        keywords: "unexpected eclectic bollywood",
        fallbackGenres: ["experimental indian", "fusion bollywood", "indie bengali"],
        filters: {market: "IN"}
    },
    joy: {
        keywords: "euphoric celebratory bollywood",
        fallbackGenres: ["bollywood wedding", "bhangra", "gujarati garba"],
        filters: {market: "IN"}
    },
    irritation: {
        keywords: "grinding repetitive bollywood",
        fallbackGenres: ["bollywood remix", "desi electronic", "hardcore punjabi"],
        filters: {market: "IN"}
    },
    anxiety: {
        keywords: "uneasy chaotic bollywood",
        fallbackGenres: ["dark bollywood", "indian experimental", "tamil ambient"],
        filters: {market: "IN"}
    },
    worry: {
        keywords: "contemplative pensive bollywood",
        fallbackGenres: ["bollywood slow", "indian classical", "malayalam thoughtful"],
        filters: {market: "IN"}
    },
    frustration: {
        keywords: "heavy distorted bollywood",
        fallbackGenres: ["bollywood metal", "indie hindi angry", "tamil rock"],
        filters: {market: "IN"}
    },
    stressed: {
        keywords: "tense unsettling bollywood",
        fallbackGenres: ["bollywood tension", "indian drone", "kannada atmospheric"],
        filters: {market: "IN"}
    },
    shocked: {
        keywords: "abrupt jarring bollywood",
        fallbackGenres: ["bollywood dramatic", "indian punk", "marathi experimental"],
        filters: {market: "IN"}
    },
    loneliness: {
        keywords: "sparse hollow bollywood",
        fallbackGenres: ["bollywood lonely", "indie hindi sparse", "bengali folk"],
        filters: {market: "IN"}
    },
    crying: {
        keywords: "heartbreaking tender bollywood",
        fallbackGenres: ["bollywood sad", "indie hindi emotional", "urdu ghazal"],
        filters: {market: "IN"}
    },
    disgust: {
        keywords: "harsh abrasive bollywood",
        fallbackGenres: ["bollywood dark", "indian noise", "experimental tamil"],
        filters: {market: "IN"}
    },
    love: {
        keywords: "romantic sensual bollywood",
        fallbackGenres: ["bollywood romantic", "indie hindi love", "urdu ghazal"],
        filters: {market: "IN"}
    }
};

const searchTracks = async (mood, genre) => {
    if (!accessToken) await getAccessToken();

    const config = moodConfigurations[mood] || moodConfigurations.happiness;
    const query = `${config.keywords} ${genre || config.fallbackGenres[0]}`.trim();

    try {
        const response = await axios.get(
            `https://api.spotify.com/v1/search`,
            {
                headers: { 'Authorization': 'Bearer ${accessToken}'},
                params: {
                    q: query,
                    type: "track",
                    market:config.filters?.market || "IN",
                    limit: 12
                }
            }
        );

        return response.data.tracks.items.map(track => ({
            id: track.id,
            title: track.name,
            artist: track.artists.map(a => a.name).join(','),
            previewUrl: track.preview_url,
            imageUrl: track.album.images[0]?.url,
            spotifyUrl: track.external_urls.spotify,
            isIndian: true
        }));

    } catch (error) {
        console.error("Spotify API Error:", error.response?.data || error.message);
        throw new Error("Failed to fetch tracks");
    }
};

const getRecommendations = async (seedTrackIds, mood) => {
    if (!accessToken) await getAccessToken();

    const config = moodConfigurations[mood] || moodConfigurations.happiness;

    return axios.get(`https://api.spotify.com/v1/recommendations`, {
        headers: {'Authorization': `Bearer ${accessToken}`},
        params: {
            seed_tracks: seedTrackIds.join(','),
            market: "IN",
            target_valence: mood === 'sadness' ? 0.2 : 0.8,
            limit: 8
        }
    });
};

module.exports = {
    searchTracks,
    getRecommendations,
    moodConfigurations
};