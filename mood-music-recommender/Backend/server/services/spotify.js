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
        keywords:
    }
}