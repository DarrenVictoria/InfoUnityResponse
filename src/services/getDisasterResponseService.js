import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase';

export const getDisasterResponse = async (prompt, language = 'english') => {
    const disasterResponseFunction = httpsCallable(functions, 'getDisasterResponse');

    try {
        console.log('Sending request with:', { prompt, language });
        const result = await disasterResponseFunction({ prompt, language });
        console.log('Received response:', result);
        return result.data;
    } catch (error) {
        console.error('Error in getDisasterResponse:', error);
        throw error;
    }
};