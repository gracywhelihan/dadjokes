import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleSheetsService } from '../../../services/googleSheetsService';
import { Joke } from '../../../types/jokes';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ jokes: Joke[]; error: string | null }>
) {
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  try {
    const service = GoogleSheetsService.getInstance();
    const jokes = await service.getAllJokes();
    
    console.log('API: Fetched all jokes:', {
      count: jokes.length,
      dateRange: jokes.length > 0 ? {
        first: jokes[0].date,
        last: jokes[jokes.length - 1].date
      } : null
    });
    
    return res.status(200).json({ jokes, error: null });
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      jokes: [],
      error: 'Internal server error: ' + error.message
    });
  }
} 