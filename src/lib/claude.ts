const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function generateResponse(messages: Message[], systemPrompt?: string): Promise<string> {
  console.log('[Claude] generateResponse called. API key present:', !!ANTHROPIC_API_KEY);
  console.log('[Claude] API key prefix:', ANTHROPIC_API_KEY ? ANTHROPIC_API_KEY.substring(0, 16) + '...' : 'MISSING');
  console.log('[Claude] Messages count:', messages.length);

  if (!ANTHROPIC_API_KEY) {
    console.error('[Claude] FATAL: No API key found. VITE_ANTHROPIC_API_KEY is not set.');
    return "Authentication failed - API not connected: No API key configured. Add VITE_ANTHROPIC_API_KEY to your .env file and restart the dev server.";
  }

  if (!ANTHROPIC_API_KEY.startsWith('sk-ant-')) {
    console.error('[Claude] FATAL: API key has wrong format. Expected sk-ant-... got:', ANTHROPIC_API_KEY.substring(0, 10));
    return "Authentication failed - API not connected: Invalid API key format. Key must start with 'sk-ant-'.";
  }

  // Filter out system messages (Anthropic handles system via top-level param)
  const filteredMessages = messages.filter(m => m.role !== 'system').map(m => ({
    role: m.role as 'user' | 'assistant',
    content: m.content
  }));

  const requestBody = {
    model: 'claude-3-haiku-20240307',
    max_tokens: 512,
    system: systemPrompt || "You are a professional AI interviewer. Ask concise, challenging questions. Reply to answers and ask a follow-up. Keep responses under 3 sentences.",
    messages: filteredMessages,
  };

  console.log('[Claude] Sending request directly to Anthropic API...');

  try {
    // Call Anthropic API directly — the proxy (/api/anthropic) only works in `npm run dev`
    // and is unreliable. Direct call works in both dev and production.
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('[Claude] Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Claude] API error response body:', errorText);

      let anthropicMessage = `HTTP ${response.status} ${response.statusText}`;
      try {
        const errorData = JSON.parse(errorText);
        // Surface the exact Anthropic error message
        anthropicMessage = errorData.error?.message || errorData.message || anthropicMessage;
        console.error('[Claude] Anthropic error type:', errorData.error?.type);
        console.error('[Claude] Anthropic error message:', anthropicMessage);
      } catch {
        console.error('[Claude] Could not parse error JSON:', errorText);
      }

      if (response.status === 401) {
        return `Authentication failed - API not connected: ${anthropicMessage}. Check your VITE_ANTHROPIC_API_KEY in .env.`;
      }
      if (response.status === 403) {
        return `API access forbidden: ${anthropicMessage}.`;
      }
      if (response.status === 429) {
        return `Rate limit reached: ${anthropicMessage}. Please wait before trying again.`;
      }
      return `Anthropic API error (${response.status}): ${anthropicMessage}`;
    }

    const data = await response.json();
    console.log('[Claude] Success! Response received.');
    return data.content[0].text;

  } catch (error) {
    console.error('[Claude] Network/fetch error:', error);
    const errMsg = error instanceof Error ? error.message : String(error);
    if (errMsg.toLowerCase().includes('cors') || errMsg.toLowerCase().includes('network') || errMsg.toLowerCase().includes('fetch')) {
      return `Authentication failed - API not connected: Network/CORS error — ${errMsg}. Make sure the dev server is running.`;
    }
    return `Authentication failed - API not connected: Unexpected error — ${errMsg}`;
  }
}
