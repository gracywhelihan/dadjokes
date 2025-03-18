import { useState } from 'react';
import { JokeCard } from './JokeCard';

interface Joke {
  id: string;
  text: string;
  category: string;
  dateAdded: string;
  value: number;
}

interface JokeBoardProps {
  jokes: Joke[];
  categories: string[];
  onJokeSelect: (joke: Joke) => void;
}

export const JokeBoard = ({ jokes, categories, onJokeSelect }: JokeBoardProps) => {
  const [viewedJokes, setViewedJokes] = useState<Set<string>>(new Set());
  const values = [200, 400, 600, 800, 1000];

  const handleJokeClick = (joke: Joke) => {
    setViewedJokes(prev => new Set([...prev, joke.id]));
    onJokeSelect(joke);
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[768px]">
        {/* Categories Row */}
        <div className="grid grid-cols-5 gap-4 mb-4">
          {categories.map((category) => (
            <div
              key={category}
              className="bg-blue-800 p-4 text-center text-yellow-400 font-bold uppercase text-sm md:text-base rounded shadow-lg"
            >
              {category}
            </div>
          ))}
        </div>

        {/* Value Cards Grid */}
        {values.map((value) => (
          <div key={value} className="grid grid-cols-5 gap-4 mb-4">
            {categories.map((category) => {
              const joke = jokes.find(
                (j) => j.category === category && j.value === value
              );
              return joke ? (
                <JokeCard
                  key={`${category}-${value}`}
                  joke={joke}
                  isViewed={viewedJokes.has(joke.id)}
                  onClick={() => handleJokeClick(joke)}
                />
              ) : (
                <div
                  key={`${category}-${value}`}
                  className="bg-blue-700/50 p-4 text-center text-gray-400 rounded shadow"
                >
                  -
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}; 