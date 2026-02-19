export interface AppUser {
  id: string
  name: string
  created_at: string
}

export interface Habit {
  id: string
  user_id: string
  name: string
  icon: string
  color: string
  created_at: string
}

export interface HabitCompletion {
  id: string
  habit_id: string
  user_id: string
  completed_date: string
  created_at: string
}

export interface HabitWithStatus extends Habit {
  completedToday: boolean
  streak: number
  completions: HabitCompletion[]
}

export interface LeaderboardEntry {
  id: string
  name: string
  total_completions: number
  active_days: number
}
