import CalendarGrid from "@/components/calendar-grid"
import GenerateJokeButton from "@/components/GenerateJokeButton"

export default function Home() {
  // Helper function to get last Saturday
  function getLastSaturday(): Date {
    const today = new Date()
    const dayOfWeek = today.getDay() // 0 (Sunday) to 6 (Saturday)
    
    // Calculate days to subtract to get to last Saturday
    const daysToSubtract = dayOfWeek === 6 ? 0 : dayOfWeek + 1
    
    // Create new date at start of today
    const lastSaturday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - daysToSubtract)
    return lastSaturday
  }

  // Create start date using explicit year, month (0-based), day to avoid timezone issues
  const startDate = new Date(2022, 9, 23) // Month is 0-based, so 9 = October
  const endDate = getLastSaturday()

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-start p-4 bg-fixed bg-cover bg-center"
      style={{
        backgroundImage: "url('/dadjokes/background.jpg')",
      }}
    >
      <div className="w-full max-w-6xl h-screen overflow-y-auto">
        <h1 className="text-2xl sm:text-3xl md:text-4xl text-white mb-6 sm:mb-8 drop-shadow-lg">
          My Dad Bill&apos;s jokes:
        </h1>
        <CalendarGrid startDate={startDate} endDate={endDate} />
        <GenerateJokeButton />
      </div>
    </main>
  )
}

