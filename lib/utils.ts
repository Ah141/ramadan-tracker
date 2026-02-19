import { HabitCompletion } from './types'
import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function calculateStreak(completions: HabitCompletion[]): number {
  if (completions.length === 0) return 0
  const dates = completions
    .map(c => c.completed_date)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  if (dates[0] !== today && dates[0] !== yesterday) return 0
  let streak = 1
  for (let i = 1; i < dates.length; i++) {
    const curr = new Date(dates[i - 1])
    const prev = new Date(dates[i])
    if ((curr.getTime() - prev.getTime()) / 86400000 === 1) streak++
    else break
  }
  return streak
}

export function getWeekDates(): string[] {
  const dates = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000)
    dates.push(d.toISOString().split('T')[0])
  }
  return dates
}

export function getRamadanDay(): number {
  const ramadanStart = new Date('2025-03-01')
  const today = new Date()
  const diff = Math.floor((today.getTime() - ramadanStart.getTime()) / 86400000) + 1
  return Math.min(Math.max(diff, 1), 30)
}
