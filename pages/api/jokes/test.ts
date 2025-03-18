import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleSheetsService } from '../../../services/googleSheetsService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Log environment variables (without exposing sensitive data)
    console.log('Environment check:', {
      hasSheetId: !!process.env.GOOGLE_SHEETS_ID,
      hasClientEmail: !!process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      hasPrivateKey: !!process.env.GOOGLE_SHEETS_PRIVATE_KEY,
    });

    const service = GoogleSheetsService.getInstance();
    const jokes = await service.getAllJokes();

    return res.status(200).json({
      success: true,
      jokeCount: jokes.length,
      sampleJoke: jokes[0],
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
} 