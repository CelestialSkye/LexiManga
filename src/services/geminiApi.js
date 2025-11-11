import { getAuth } from 'firebase/auth';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

/**
 * Get Firebase ID token for authenticated requests
 */
const getIdToken = async () => {
  try {
    const auth = getAuth();
    if (!auth.currentUser) {
      throw new Error('User not authenticated');
    }
    return await auth.currentUser.getIdToken();
  } catch (error) {
    console.error('Error getting ID token:', error);
    throw error;
  }
};

export const translateWithGemini = async (text, sourceLanguage, targetLanguage, userId) => {
  try {
    // Get Firebase ID token for authentication
    let idToken;
    try {
      idToken = await getIdToken();
    } catch (error) {
      throw new Error('Authentication required. Please log in.');
    }

    const response = await fetch(`${BACKEND_URL}/api/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        text,
        sourceLang: sourceLanguage,
        targetLang: targetLanguage,
        // userId is no longer needed - backend verifies from token
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Handle rate limit from our server (user's translation quota - 20 per hour)
      if (response.status === 429) {
        const minutesLeft = Math.ceil((errorData.resetTime - Date.now()) / 60000);

        if (minutesLeft > 60) {
          throw new Error(
            `⏳ Rate Limited: You've reached your translation limit (20 per hour). Please try again in ${Math.ceil(minutesLeft / 60)} hour(s).`
          );
        } else if (minutesLeft > 1) {
          throw new Error(
            `⏳ Rate Limited: You've reached your translation limit (20 per hour). Please try again in ${minutesLeft} minute(s).`
          );
        } else {
          throw new Error(
            `⏳ Rate Limited: You've reached your translation limit (20 per hour). Please try again in a moment.`
          );
        }
      }

      // Handle service quota exceeded (503)
      if (response.status === 503 && errorData.type === 'QUOTA_EXCEEDED') {
        throw new Error('Translation limit reached. Please try again later.');
      }

      // Handle configuration errors (500 with CONFIG_ERROR)
      if (response.status === 500 && errorData.type === 'CONFIG_ERROR') {
        throw new Error(
          '⚙️ Configuration Error: Translation service is not properly configured. Please contact support.'
        );
      }

      // Handle model errors (500 with MODEL_ERROR)
      if (response.status === 500 && errorData.type === 'MODEL_ERROR') {
        throw new Error(
          '🚫 Service Unavailable: Translation service is temporarily unavailable. Please try again later.'
        );
      }

      // Generic error handling
      const errorMessage = errorData.details || errorData.error || 'Unknown error';
      throw new Error(`❌ Translation failed: ${errorMessage.substring(0, 120)}`);
    }

    const data = await response.json();
    return data.translation;
  } catch (error) {
    // Re-throw to let the component handle it
    throw error;
  }
};

const geminiApi = {
  translateWithGemini,
};

export default geminiApi;
