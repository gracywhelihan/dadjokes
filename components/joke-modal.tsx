import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect } from 'react';
import { Joke } from '../types/jokes';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface JokeModalProps {
  jokes: Joke[];
  date: Date | null;
  isOpen: boolean;
  onClose: () => void;
  onNextDate: (date: Date) => void;
  onPrevDate: (date: Date) => void;
  hasNextDate: boolean;
  hasPrevDate: boolean;
}

export function JokeModal({ 
  jokes, 
  date, 
  isOpen, 
  onClose, 
  onNextDate, 
  onPrevDate,
  hasNextDate,
  hasPrevDate 
}: JokeModalProps) {
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen || !date) return;
      
      if (e.key === 'ArrowLeft' && hasPrevDate) {
        onPrevDate(date);
      } else if (e.key === 'ArrowRight' && hasNextDate) {
        onNextDate(date);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, date, hasNextDate, hasPrevDate, onNextDate, onPrevDate]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-[95vw] sm:max-w-[85vw] md:max-w-lg transform overflow-hidden bg-white p-4 sm:p-6 text-left align-middle shadow-xl transition-all relative">
                {/* Title and close button */}
                <div className="flex justify-between items-start mb-4">
                  <Dialog.Title as="h3" className="text-lg sm:text-xl font-semibold text-black">
                    {date?.toLocaleDateString('en-US', { 
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                </div>

                {/* Content with padding for arrow space */}
                <div className="px-8 sm:px-12">
                  {jokes.length > 0 ? (
                    <div className="space-y-6 sm:space-y-8">
                      {jokes.map((joke, index) => (
                        <div key={joke.id} className="space-y-3 sm:space-y-4">
                          {/* Joke bubble (left side) */}
                          <div className="flex justify-start">
                            <div className="space-y-1">
                              <div className="max-w-[85%] sm:max-w-[80%] bg-black text-white px-3 sm:px-4 py-2">
                                <p className="text-sm sm:text-base">{joke.joke}</p>
                              </div>
                              {/* Rating display under joke */}
                              <div className="flex items-center space-x-1 sm:space-x-2 pl-1 sm:pl-2">
                                <span className="text-xs sm:text-sm text-gray-500">Rating:</span>
                                <div className="flex">
                                  {[...Array(joke.rating)].map((_, i) => (
                                    <span key={i} className="text-xs sm:text-sm text-yellow-400">★</span>
                                  ))}
                                  {[...Array(5 - joke.rating)].map((_, i) => (
                                    <span key={i} className="text-xs sm:text-sm text-gray-300">★</span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Response bubble (right side) - only show if there's a response */}
                          {joke.response && (
                            <div className="flex justify-end">
                              <div className="max-w-[85%] sm:max-w-[80%] bg-gray-200 text-black px-3 sm:px-4 py-2">
                                <p className="text-sm sm:text-base">{joke.response}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-100 p-3 sm:p-4 text-center">
                      <p className="text-sm sm:text-base text-gray-500">No joke available for this date.</p>
                    </div>
                  )}
                </div>

                {/* Navigation arrows - positioned closer to content */}
                <div className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2">
                  <button
                    onClick={() => date && onPrevDate(date)}
                    disabled={!hasPrevDate}
                    className={`p-1 sm:p-2 transition-colors ${
                      hasPrevDate 
                        ? 'text-gray-400 hover:text-black' 
                        : 'text-gray-200 cursor-not-allowed'
                    }`}
                    aria-label="Previous date"
                  >
                    <ChevronLeftIcon className="h-6 w-6 sm:h-8 sm:w-8" />
                  </button>
                </div>
                <div className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2">
                  <button
                    onClick={() => date && onNextDate(date)}
                    disabled={!hasNextDate}
                    className={`p-1 sm:p-2 transition-colors ${
                      hasNextDate 
                        ? 'text-gray-400 hover:text-black' 
                        : 'text-gray-200 cursor-not-allowed'
                    }`}
                    aria-label="Next date"
                  >
                    <ChevronRightIcon className="h-6 w-6 sm:h-8 sm:w-8" />
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 