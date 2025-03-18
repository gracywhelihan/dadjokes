import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { motion } from 'framer-motion';
import { ShareIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Joke {
  id: string;
  text: string;
  category: string;
  dateAdded: string;
  value: number;
}

interface JokeModalProps {
  joke: Joke | null;
  isOpen: boolean;
  onClose: () => void;
}

export const JokeModal = ({ joke, isOpen, onClose }: JokeModalProps) => {
  const shareJoke = async () => {
    if (!joke) return;
    
    try {
      await navigator.share({
        title: 'Dad Jokes Jeopardy',
        text: joke.text,
        url: window.location.href,
      });
    } catch (error) {
      console.error('Error sharing joke:', error);
    }
  };

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
          <div className="fixed inset-0 bg-black/75" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-blue-800 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-start mb-4">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium text-yellow-400"
                  >
                    {joke?.category} - ${joke?.value}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2"
                >
                  <p className="text-xl text-white">{joke?.text}</p>
                </motion.div>

                <div className="mt-6 flex justify-between items-center">
                  <span className="text-sm text-gray-400">
                    Added: {new Date(joke?.dateAdded || '').toLocaleDateString()}
                  </span>
                  <button
                    onClick={shareJoke}
                    className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-500"
                  >
                    <ShareIcon className="h-5 w-5 mr-2" />
                    Share
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}; 