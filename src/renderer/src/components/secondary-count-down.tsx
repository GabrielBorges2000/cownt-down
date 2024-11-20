import { useState, useEffect } from 'react'

export function SecondaryWindow() {
  const [time, setTime] = useState(0)
  const [isOvertime, setIsOvertime] = useState(false)

  useEffect(() => {
    window.api.onTimeUpdate((newTime, newIsOvertime) => {
      setTime(newTime)
      setIsOvertime(newIsOvertime)
    })
  }, [])

  const formatTime = (seconds: number) => {
    const absSeconds = Math.abs(seconds)
    const mins = Math.floor(absSeconds / 60)
    const secs = absSeconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  return (
    <div className="h-screen w-screen bg-zinc-950 flex items-center justify-center">
      <div className={`text-[48vh] font-mono ${isOvertime ? 'text-red-500' : 'text-white'}`}>
        {isOvertime ? '+' : ''}
        {formatTime(time)}
      </div>
    </div>
  )
}
