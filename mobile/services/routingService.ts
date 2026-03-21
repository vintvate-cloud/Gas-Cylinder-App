import axios from 'axios';

export interface RouteCoord {
    latitude: number;
    longitude: number;
}

export const routingService = {
    // Geocode address using Nominatim (OpenStreetMap) primarily, with RapidAPI fallback
    geocodeAddress: async (address: string): Promise<RouteCoord | null> => {
        // Try Nominatim (OpenStreetMap) First (Free & reliable)
        try {
            const encodedAddr = encodeURIComponent(address);
            const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddr}&limit=1`, {
                headers: { 'User-Agent': 'GasCylinderApp-Driver' },
                timeout: 5000
            });

            if (response.data && response.data.length > 0) {
                const first = response.data[0];
                return {
                    latitude: parseFloat(first.lat),
                    longitude: parseFloat(first.lon)
                };
            }
        } catch (error: any) {
            console.warn(`Nominatim Geocoding failed (${error.message || 'unknown error'}). Trying fallback...`);
        }

        // Fallback: RapidAPI (Google Maps API Proxy)
        try {
            const RAPID_API_KEY = process.env.EXPO_PUBLIC_RAPID_API_KEY;
            if (!RAPID_API_KEY) {
                throw new Error('EXPO_PUBLIC_RAPID_API_KEY environment variable is required');
            }
            const RAPID_API_HOST = 'google-api31.p.rapidapi.com';

            const response = await axios.post(
                `https://${RAPID_API_HOST}/map2`,
                {
                    text: address,
                    place: '', street: '', city: '', country: '', state: '', postalcode: '',
                    latitude: '', longitude: '', radius: ''
                },
                {
                    headers: {
                        'x-rapidapi-key': RAPID_API_KEY,
                        'x-rapidapi-host': RAPID_API_HOST,
                        'Content-Type': 'application/json'
                    },
                    timeout: 5000
                }
            );

            const results = response.data.result;
            if (results && results.length > 0) {
                const first = results[0];
                if (first.latitude && first.longitude) {
                    return {
                        latitude: parseFloat(first.latitude),
                        longitude: parseFloat(first.longitude)
                    };
                }
            }
        } catch (error: any) {
            console.error('All Geocoding attempts failed. RapidAPI error:', error.message || error);
        }
        return null;
    },

    // Get route polyline from OSRM
    getRoute: async (startPos: RouteCoord, endPos: RouteCoord): Promise<RouteCoord[]> => {
        try {
            const url = `https://router.project-osrm.org/route/v1/driving/${startPos.longitude},${startPos.latitude};${endPos.longitude},${endPos.latitude}?overview=full&geometries=geojson`;
            const response = await axios.get(url);
            if (response.data.routes && response.data.routes.length > 0) {
                const coordinates = response.data.routes[0].geometry.coordinates;
                return coordinates.map((coord: [number, number]) => ({
                    latitude: coord[1],
                    longitude: coord[0]
                }));
            }
        } catch (error) {
            console.error('Routing error:', error);
        }
        return [];
    }
};
