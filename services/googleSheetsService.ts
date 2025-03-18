import { google } from 'googleapis';
import { Joke } from '../types/jokes';

export class GoogleSheetsService {
  private static instance: GoogleSheetsService;
  private sheets: any;

  private constructor() {
    // Simple auth with API key
    this.sheets = google.sheets({ 
      version: 'v4', 
      auth: process.env.GOOGLE_SHEETS_API_KEY 
    });
  }

  static getInstance(): GoogleSheetsService {
    if (!GoogleSheetsService.instance) {
      GoogleSheetsService.instance = new GoogleSheetsService();
    }
    return GoogleSheetsService.instance;
  }

  async getAllJokes(): Promise<Joke[]> {
    try {
      console.log('getAllJokes: Starting...');
      
      const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
      if (!spreadsheetId) {
        throw new Error('GOOGLE_SHEETS_ID is not set in environment variables');
      }

      console.log('Fetching from spreadsheet:', {
        spreadsheetId: spreadsheetId.substring(0, 5) + '...',
        hasApiKey: !!process.env.GOOGLE_SHEETS_API_KEY
      });

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Jokes!A2:D',
        key: process.env.GOOGLE_SHEETS_API_KEY
      }).catch((error: any) => {
        console.error('Google Sheets API Error:', {
          message: error.message,
          code: error.code,
          status: error.status
        });
        throw new Error(`Failed to fetch jokes: ${error.message}`);
      });

      if (!response || !response.data) {
        console.error('Invalid response from Google Sheets:', response);
        throw new Error('Invalid response from Google Sheets API');
      }

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        console.log('No jokes found in spreadsheet');
        return [];
      }

      const jokes = rows.map((row: any[], index: number) => {
        // Parse the date from the spreadsheet (MM/DD/YYYY format)
        let jokeDate = row[0] || '';
        try {
          // Split the date string into components
          const [month, day, year] = jokeDate.split('/');
          if (month && day && year) {
            // Directly format the date string without creating a Date object
            jokeDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            
            console.log('Date parsing:', {
              original: row[0],
              formatted: jokeDate,
              components: { month, day, year }
            });
          } else {
            console.warn(`Unexpected date format for joke ${index + 1}:`, jokeDate);
          }
        } catch (err) {
          console.warn(`Error parsing date for joke ${index + 1}:`, jokeDate, err);
        }

        const joke = {
          id: `joke-${index + 1}`,
          date: jokeDate,
          joke: row[1] || '',
          response: row[2] || '',
          rating: (row[3] || '').split('').filter((char: string) => char === '★').length || 0,
        };
        console.log(`Parsed joke for date ${joke.date}:`, {
          ...joke,
          rawRating: row[3],
          starCount: (row[3] || '').split('').filter((char: string) => char === '★').length,
          joke: joke.joke.substring(0, 50) + '...',
          response: joke.response.substring(0, 50) + '...'
        });
        return joke;
      });

      return jokes;
    } catch (error) {
      console.error('Error in getAllJokes:', error);
      throw error;
    }
  }

  async getJokesByRating(minRating: number): Promise<Joke[]> {
    console.log(`getJokesByRating: Finding jokes with rating >= ${minRating}`);
    const jokes = await this.getAllJokes();
    const filteredJokes = jokes.filter(joke => joke.rating >= minRating);
    console.log(`getJokesByRating: Found ${filteredJokes.length} jokes`);
    return filteredJokes;
  }

  async getRandomJoke(minRating?: number): Promise<Joke> {
    console.log('getRandomJoke: Starting...');
    const jokes = minRating 
      ? await this.getJokesByRating(minRating)
      : await this.getAllJokes();
    
    if (jokes.length === 0) {
      throw new Error('No jokes found matching the criteria');
    }
    
    const randomIndex = Math.floor(Math.random() * jokes.length);
    console.log(`getRandomJoke: Selected joke ${randomIndex + 1} of ${jokes.length}`);
    return jokes[randomIndex];
  }

  async getJokesByDateRange(startDate: Date, endDate: Date): Promise<Joke[]> {
    try {
      console.log(`getJokesByDateRange: Finding jokes between ${startDate.toISOString()} and ${endDate.toISOString()}`);
      const jokes = await this.getAllJokes();
      
      // Format the search dates consistently
      const searchStartStr = startDate.toISOString().split('T')[0];
      const searchEndStr = endDate.toISOString().split('T')[0];
      
      console.log('Date comparison:', {
        searchStartStr,
        searchEndStr,
        availableDates: jokes.map(joke => joke.date)
      });
      
      const filteredJokes = jokes.filter(joke => {
        // Compare dates as strings in YYYY-MM-DD format
        return joke.date >= searchStartStr && joke.date <= searchEndStr;
      });
      
      console.log(`getJokesByDateRange: Found ${filteredJokes.length} jokes:`, 
        filteredJokes.map(joke => ({ date: joke.date, joke: joke.joke.substring(0, 50) }))
      );
      
      return filteredJokes;
    } catch (error) {
      console.error('Error in getJokesByDateRange:', error);
      throw error;
    }
  }
} 