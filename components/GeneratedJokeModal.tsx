'use client'

import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface GeneratedJokeModalProps {
  isOpen: boolean
  onClose: () => void
  joke: {
    joke: string
  } | null
  isLoading: boolean
  error?: string | null
}

export default function GeneratedJokeModal({
  isOpen,
  onClose,
  joke,
  isLoading,
  error
}: GeneratedJokeModalProps) {
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
          <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-out duration-300"
              enterFrom="scale-50 opacity-0"
              enterTo="scale-100 opacity-100"
              leave="transform transition ease-in duration-200"
              leaveFrom="scale-100 opacity-100"
              leaveTo="scale-50 opacity-0"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden bg-white p-4 sm:p-6 text-left align-middle shadow-xl animate-bounce-subtle">
                {/* Title and close button */}
                <div className="flex justify-between items-start mb-4">
                  <Dialog.Title as="h3" className="text-lg sm:text-xl text-black">
                    Dad
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                </div>

                {/* Content */}
                <div className="px-4 sm:px-6">
                  {error ? (
                    <div className="bg-red-50 p-3 sm:p-4 text-center">
                      <p className="text-sm sm:text-base text-red-600">{error}</p>
                    </div>
                  ) : joke ? (
                    <div>
                      {/* Joke bubble */}
                      <div className="flex justify-start">
                        <div className="max-w-[95%] bg-black text-white px-3 sm:px-4 py-2">
                          <p className="text-sm sm:text-base">{joke.joke}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-100 p-3 sm:p-4 text-center">
                      <p className="text-sm sm:text-base text-gray-500">No joke generated yet.</p>
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
} 