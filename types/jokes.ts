export interface Joke {
  id: string;
  date: string;
  joke: string;
  response: string;
  rating: number;
}

export interface JokeResponse {
  jokes: Joke[];
  categories: string[];
}

export interface GoogleSheetsRow {
  'Date': string;
  'Joke': string;
  'Response': string;
  'rating': string;
}

export type JokeFilter = {
  rating?: number;
  dateRange?: {
    start: Date;
    end: Date;
  };
}; 