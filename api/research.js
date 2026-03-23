export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ 
      error: 'Backend not configured. Add ANTHROPIC_API_KEY in Vercel Project Settings > Environment Variables, then redeploy.' 
    });
  }

  const { action, bandName, band, query } = req.body;
  const name = bandName || band || '';

  // Build the prompt based on action
  let prompt;
  switch (action) {
    case 'biography':
      prompt = `Write a detailed biography of the hardcore punk band ${name}. Cover their formation, key members, musical evolution, important albums, and lasting influence on the hardcore punk scene. Be specific with dates, venues, and anecdotes. Keep it under 600 words.`;
      break;
    case 'deep_dive':
      prompt = `Do a deep dive analysis of the hardcore punk band ${name}. Cover their musical style, lyrical themes, production choices, key recordings, live show reputation, and how they fit within and influenced the broader hardcore punk movement. Be specific and analytical. Keep it under 600 words.`;
      break;
    case 'scene_context':
      prompt = `Explain the scene context around the hardcore punk band ${name}. What city/region were they from? What was the local scene like? Who were their peers and rivals? What venues, labels, and zines were important? How did they shape or reflect their local hardcore community? Keep it under 600 words.`;
      break;
    case 'stories':
      prompt = `Share the wildest, most interesting true stories and anecdotes about the hardcore punk band ${name}. Include notorious shows, band conflicts, funny incidents, and legendary moments. Be specific with details. Keep it under 600 words.`;
      break;
    case 'ask':
      prompt = name 
        ? `Answer this question about the hardcore punk band ${name}: ${query}. Be specific and knowledgeable about hardcore punk history. Keep it under 500 words.`
        : `Answer this question about hardcore punk history: ${query}. Be specific and knowledgeable. Keep it under 500 words.`;
      break;
    default:
      return res.status(400).json({ error: 'Invalid action' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        system: 'You are an expert on hardcore punk history from 1978-1999. You have encyclopedic knowledge of bands, scenes, labels, venues, subgenres, and the culture. Be accurate, specific, and passionate. Use a tone that respects the DIY ethos of the scene.'
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    const result = data.content?.[0]?.text || 'No response generated.';

    return res.status(200).json({ result });
  } catch (err) {
    console.error('AI Research error:', err);
    return res.status(500).json({ 
      error: err.message || 'Failed to generate research' 
    });
  }
}
