"use client"

interface GridSquaresProps {
  rows: number
  columns: number
}

export default function GridSquares({ rows, columns }: GridSquaresProps) {
  // Handle click on a square
  const handleSquareClick = (rowIndex: number, colIndex: number) => {
    console.log(`Clicked square at row ${rowIndex}, column ${colIndex}`)
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div
        className="grid gap-0"
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
        }}
      >
        {Array(rows)
          .fill(null)
          .map((_, rowIndex) =>
            Array(columns)
              .fill(null)
              .map((_, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className="aspect-square bg-transparent border-2 border-white cursor-pointer hover:bg-white/20 transition-colors duration-200"
                  onClick={() => handleSquareClick(rowIndex, colIndex)}
                  aria-label={`Grid square at row ${rowIndex + 1}, column ${colIndex + 1}`}
                />
              )),
          )}
      </div>
    </div>
  )
}

