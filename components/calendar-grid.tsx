"use client"

import { useState, useEffect } from "react"
import { useJokes } from "@/hooks/useJokes"
import { JokeModal } from "./joke-modal"
import { Joke } from "@/types/jokes"

interface CalendarGridProps {
  startDate: Date
  endDate: Date
}

export default function CalendarGrid({ startDate, endDate }: CalendarGridProps) {
  const [weeks, setWeeks] = useState<Date[][]>([])
  const { jokes, loading } = useJokes(startDate, endDate)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    // Calculate the number of weeks between start and end dates
    const calculateWeeks = () => {
      const result: Date[][] = []
      const currentDate = new Date(startDate)

      // Generate weeks starting from the exact start date
      while (currentDate <= endDate) {
        const week: Date[] = []
        const remainingDays = 7

        // Add days for the week
        for (let i = 0; i < remainingDays; i++) {
          if (currentDate <= endDate) {
            week.push(new Date(currentDate))
            currentDate.setDate(currentDate.getDate() + 1)
          }
        }

        if (week.length > 0) {
          result.push(week)
        }
      }

      return result
    }

    setWeeks(calculateWeeks())
  }, [startDate, endDate])

  // Handle click on a calendar cell
  const handleCellClick = (date: Date) => {
    if (!isInRange(date) || !hasJoke(date)) return
    setSelectedDate(date)
    setIsModalOpen(true)
  }

  // Check if a date is within our range
  const isInRange = (date: Date) => {
    return date >= startDate && date <= endDate
  }

  // Check if a date has a joke
  const hasJoke = (date: Date) => {
    const dateString = date.toISOString().split('T')[0]
    return dateString in jokes && jokes[dateString].length > 0
  }

  // Get jokes for a date
  const getJokes = (date: Date): Joke[] => {
    const dateString = date.toISOString().split('T')[0]
    const dateJokes = jokes[dateString] || [];
    console.log('Getting jokes for date:', {
      date: dateString,
      count: dateJokes.length,
      jokes: dateJokes.map(joke => ({
        ...joke,
        joke: joke.joke.substring(0, 50) + '...',
        response: joke.response.substring(0, 50) + '...'
      }))
    });
    return dateJokes;
  }

  // Get the next date with a joke
  const getNextDateWithJoke = (currentDate: Date) => {
    const currentDateStr = currentDate.toISOString().split('T')[0];
    const allDates = Object.keys(jokes).sort();
    const currentIndex = allDates.indexOf(currentDateStr);
    if (currentIndex < allDates.length - 1) {
      return new Date(allDates[currentIndex + 1]);
    }
    return null;
  };

  // Get the previous date with a joke
  const getPrevDateWithJoke = (currentDate: Date) => {
    const currentDateStr = currentDate.toISOString().split('T')[0];
    const allDates = Object.keys(jokes).sort();
    const currentIndex = allDates.indexOf(currentDateStr);
    if (currentIndex > 0) {
      return new Date(allDates[currentIndex - 1]);
    }
    return null;
  };

  // Handle date navigation
  const handleDateChange = (newDate: Date) => {
    setSelectedDate(newDate);
  };

  // Format date with hyphens
  const formatDate = (date: Date, includeDay: boolean = true) => {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return includeDay ? `${month}-${day}-${year}` : `${month}-${year}`;
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-7 gap-0">
        {/* Calendar cells */}
        {weeks.map((week, weekIndex) =>
          week.map((date, dayIndex) => (
            <div
              key={`${weekIndex}-${dayIndex}`}
              className={`
                aspect-square bg-transparent border border-white
                transition-all duration-200 relative
                ${isInRange(date) ? 'opacity-100' : 'opacity-50'}
                ${hasJoke(date) ? 'backdrop-blur-xl bg-white/30 cursor-pointer hover:bg-white/40' : 'cursor-default'}
              `}
              onClick={() => handleCellClick(date)}
              aria-label={`Calendar cell for ${date.toLocaleDateString()}`}
            >
              <div className="absolute inset-2 flex flex-col items-center justify-center">
                {/* Removed date display */}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-blue-900/50 backdrop-blur-sm flex items-center justify-center">
          <div className="text-white text-lg">Loading jokes...</div>
        </div>
      )}

      {/* Joke modal */}
      <JokeModal
        jokes={selectedDate ? getJokes(selectedDate) : []}
        date={selectedDate}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onNextDate={(date) => {
          const nextDate = getNextDateWithJoke(date);
          if (nextDate) handleDateChange(nextDate);
        }}
        onPrevDate={(date) => {
          const prevDate = getPrevDateWithJoke(date);
          if (prevDate) handleDateChange(prevDate);
        }}
        hasNextDate={selectedDate ? !!getNextDateWithJoke(selectedDate) : false}
        hasPrevDate={selectedDate ? !!getPrevDateWithJoke(selectedDate) : false}
      />
    </div>
  )
}

