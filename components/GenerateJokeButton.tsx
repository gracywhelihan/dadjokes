'use client'

import { useState } from 'react'
import GeneratedJokeModal from './GeneratedJokeModal'

interface GeneratedJoke {
  joke: string
}

interface APIError {
  error: string
  details?: string
  stack?: string
}

export default function GenerateJokeButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [generatedJoke, setGeneratedJoke] = useState<GeneratedJoke | null>(null)
  const [error, setError] = useState<string | null>(null)

  const generateJoke = async () => {
    setIsLoading(true)
    setGeneratedJoke(null)
    setError(null)

    try {
      console.log('Sending request to generate joke...')
      const response = await fetch('/dadjokes/api/generate/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))
      
      // Check content type to handle HTML error pages
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('text/html')) {
        throw new Error('Received HTML instead of JSON. The API endpoint might be incorrect.')
      }

      const data = await response.json()
      console.log('Response data:', data)
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate joke')
      }

      // Extract the joke text from the Claude API response
      const jokeText = data.content[0]?.text
      if (!jokeText) {
        throw new Error('No joke text found in response')
      }

      setGeneratedJoke({
        joke: jokeText
      })
      
      // Only open modal after joke is loaded
      setIsModalOpen(true)
      setError(null)
    } catch (error: any) {
      console.error('Error generating joke:', error)
      setError(error.message || 'Failed to generate joke')
      setGeneratedJoke(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="flex justify-center mt-8 mb-4">
        <button
          className={`
            relative bg-black hover:bg-gray-800 text-white 
            text-base md:text-lg py-1.5 px-4
            border-[2px] border-[#ffffff] border-b-[#808080] border-r-[#808080]
            active:border-b-[#ffffff] active:border-r-[#ffffff] 
            active:border-t-[#808080] active:border-l-[#808080]
            active:translate-y-[1px]
            ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}
          `}
          onClick={generateJoke}
          disabled={isLoading}
        >
          <span className={isLoading ? 'invisible' : ''}>
            Generate a Bill Joke
          </span>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
            </div>
          )}
        </button>
      </div>

      <GeneratedJokeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setError(null);
        }}
        joke={generatedJoke}
        isLoading={false}
        error={error}
      />
    </>
  )
} 