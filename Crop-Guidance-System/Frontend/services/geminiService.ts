const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyCxZalOTzBVCttRfxI1p0NBGztWmXYeqKg';

export const getFarmingTip = async (location: string, season: string): Promise<string> => {
  try {
    const prompt = `Generate a brief (1-2 sentences) farming tip for ${location} during ${season}. Focus on practical, actionable advice for local farmers.`;
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch farming tip');
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Check back later for farming tips!';
  } catch (error) {
    console.error('Error fetching farming tip:', error);
    return 'Unable to fetch farming tip at the moment. Please try again later.';
  }
};
