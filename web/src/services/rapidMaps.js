import axios from 'axios';
import api from './api';

let cachedKey = null;

export const getGoogleMapKey = async () => {
    if (cachedKey) return cachedKey;
    
    // First check for direct environment variable (Vercel deployment)
    const envKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (envKey) {
        cachedKey = envKey;
        return cachedKey;
    }
    
    // Fallback: fetch from backend config endpoint
    try {
        const res = await api.get('/config/maps');
        cachedKey = res.data.apiKey;
        return cachedKey;
    } catch (e) {
        console.error('Failed to get maps config', e);
        return null; // fallback
    }
};

export const searchLocation = async (query) => {
    try {
        const key = await getGoogleMapKey();
        const mapApiUrl = 'https://maps.googleapis.com/maps/api';
        const response = await axios.get(
            `${mapApiUrl}/geocode/json`,
            {
                params: {
                    address: query,
                    key: key
                }
            }
        );

        if (response.data.status === 'OK' && response.data.results.length > 0) {
            const results = response.data.results.map(res => ({
                address: res.formatted_address,
                latitude: res.geometry.location.lat,
                longitude: res.geometry.location.lng,
            }));
            return results;
        }
        return [];
    } catch (error) {
        console.error('Google Maps Search Error:', error);
        throw error;
    }
};
