const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export const translateWithGemini = async (text, sourceLanguage, targetLanguage, userId) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        sourceLang: sourceLanguage,
        targetLang: targetLanguage,
        userId: userId || 'anonymous',
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        const errorData = await response.json();
        const minutesLeft = Math.ceil((errorData.resetTime - Date.now()) / 60000);

        if (minutesLeft > 60) {
          throw new Error(
            `You've reached your translation limit for this hour. Please try again in ${Math.ceil(minutesLeft / 60)} hours.`
          );
        } else if (minutesLeft > 1) {
          throw new Error(
            `You've reached your translation limit for this hour. Please try again in ${minutesLeft} minutes.`
          );
        } else {
          throw new Error(
            `You've reached your translation limit for this hour. Please try again in a few minutes.`
          );
        }
      }
      throw new Error(`Translation failed: ${response.status}`);
    }

    const data = await response.json();
    return data.translation;
  } catch (error) {
    console.error('Translation error:', error);
    return `[Translation: ${text} (${sourceLanguage} → ${targetLanguage})]`;
  }
};

const geminiApi = {
  translateWithGemini,
};

export default geminiApi;
