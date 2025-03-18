import { NextResponse } from 'next/server'
import { GoogleSheetsService } from '@/services/googleSheetsService'

export async function POST() {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 500 }
      );
    }

    // Fetch jokes using the existing service
    const service = GoogleSheetsService.getInstance();
    const existingJokes = await service.getAllJokes();
    
    // Create a prompt that includes the existing jokes as reference
    const prompt = `Here are some examples of dad jokes that have been used before:

${existingJokes.slice(0, 50).map((joke, i) => `${i + 1}. ${joke.joke}`).join('\n')}

Using these as inspiration for the style and tone, but WITHOUT repeating any of them, generate a new, original dad joke that would fit well with this collection. Just provide the joke itself, no additional commentary.`;

    const myHeaders = new Headers();
    myHeaders.append("x-api-key", apiKey);
    myHeaders.append("anthropic-version", "2023-06-01");
    myHeaders.append("content-type", "application/json");

    const raw = JSON.stringify({
      "model": "claude-3-7-sonnet-20250219",
      "max_tokens": 1024,
      "messages": [
        {
          "role": "user",
          "content": prompt
        }
      ]
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
    };

    const response = await fetch("https://api.anthropic.com/v1/messages", requestOptions);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`API returned status ${response.status}: ${JSON.stringify(data)}`);
    }

    return NextResponse.json(data);
    
  } catch (error: any) {
    console.error('Error details:', error);
    return NextResponse.json(
      { error: 'Failed to generate joke', details: error.message },
      { status: 500 }
    );
  }
} 