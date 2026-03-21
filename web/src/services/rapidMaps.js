import axios from 'axios';

const RAPID_API_KEY = import.meta.env.VITE_RAPID_API_KEY;
if (!RAPID_API_KEY) {
    throw new Error('VITE_RAPID_API_KEY environment variable is required');
}
const RAPID_API_HOST = 'google-api31.p.rapidapi.com';

export const searchLocation = async (query) => {
    try {
        const response = await axios.post(
            `https://${RAPID_API_HOST}/map2`,
            {
                text: query,
                place: '',
                street: '',
                city: '',
                country: '',
                state: '',
                postalcode: '',
                latitude: '',
                longitude: '',
                radius: ''
            },
            {
                headers: {
                    'x-rapidapi-key': RAPID_API_KEY,
                    'x-rapidapi-host': RAPID_API_HOST,
                    'Content-Type': 'application/json'
                }
            }
        );

        // From our test, results are in response.data.result
        return response.data.result;
    } catch (error) {
        console.error('RapidAPI Map Search Error:', error);
        throw error;
    }
};
