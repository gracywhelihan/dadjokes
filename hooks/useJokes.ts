import { useState, useEffect } from 'react';
import { Joke } from '../types/jokes';

interface JokesByDate {
  [date: string]: Joke[];
}

// Helper function to format date to YYYY-MM-DD without timezone conversion
function formatLocalDate(date: Date): string {
  // Get UTC components to avoid timezone shifts
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper function to normalize date string
function normalizeDate(dateStr: string): string {
  // Since the date string is already in YYYY-MM-DD format, just return it
  return dateStr;
}

export function useJokes(startDate: Date, endDate: Date) {
  const [jokes, setJokes] = useState<JokesByDate>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allJokes, setAllJokes] = useState<Joke[]>([]);

  // Fetch all jokes once when the hook is first used
  useEffect(() => {
    const fetchAllJokes = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/dadjokes/api/jokes/all');
        if (!response.ok) {
          throw new Error(`Failed to fetch jokes: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }

        console.log('Fetched all jokes:', {
          count: data.jokes.length,
          dateRange: data.jokes.length > 0 ? {
            first: data.jokes[0].date,
            last: data.jokes[data.jokes.length - 1].date
          } : null,
          sampleJoke: data.jokes[0]
        });

        setAllJokes(data.jokes);
      } catch (err) {
        console.error('Error fetching all jokes:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch jokes');
      } finally {
        setLoading(false);
      }
    };

    fetchAllJokes();
  }, []); // Only fetch once when mounted

  // Filter jokes based on date range whenever the range or allJokes changes
  useEffect(() => {
    if (allJokes.length === 0) return;

    const startStr = formatLocalDate(startDate);
    const endStr = formatLocalDate(endDate);
    
    console.log('Filtering jokes for date range:', {
      startStr,
      endStr,
      totalJokes: allJokes.length
    });

    const filteredJokes = allJokes.reduce<JokesByDate>((acc, joke) => {
      // Normalize both the joke date and the comparison dates to ensure consistent comparison
      const normalizedJokeDate = normalizeDate(joke.date);
      
      if (normalizedJokeDate >= startStr && normalizedJokeDate <= endStr) {
        // Initialize array for this date if it doesn't exist
        if (!acc[joke.date]) {
          acc[joke.date] = [];
        }
        // Add joke to the array for this date
        acc[joke.date].push(joke);
      }
      return acc;
    }, {});

    console.log('Filtered jokes:', {
      dateRange: { startStr, endStr },
      matchingDates: Object.keys(filteredJokes).length,
      totalJokes: Object.values(filteredJokes).reduce((sum, jokes) => sum + jokes.length, 0),
      sampleDates: Object.keys(filteredJokes).slice(0, 3)
    });

    setJokes(filteredJokes);
  }, [startDate, endDate, allJokes]);

  return { jokes, loading, error };
} 