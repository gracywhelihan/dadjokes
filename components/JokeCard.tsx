import { motion } from 'framer-motion';

interface Joke {
  id: string;
  text: string;
  category: string;
  dateAdded: string;
  value: number;
}

interface JokeCardProps {
  joke: Joke;
  isViewed: boolean;
  onClick: () => void;
}

export const JokeCard = ({ joke, isViewed, onClick }: JokeCardProps) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`w-full aspect-square flex items-center justify-center text-2xl md:text-3xl font-bold rounded shadow-lg cursor-pointer transition-colors
        ${isViewed 
          ? 'bg-blue-900/50 text-blue-200/50' 
          : 'bg-blue-700 text-yellow-400 hover:bg-blue-600'}`}
      onClick={onClick}
    >
      ${joke.value}
    </motion.button>
  );
}; 