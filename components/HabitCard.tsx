'use client'

import { useState } from 'react'

interface Habit {
  id: string; name: string; icon: string; color: string
  streak: number; completedToday: boolean
}

interface Props {
  habit: Habit
  isNext?: boolean
  onToggle: (id: string, done: boolean) => void
  onEdit: () => void
  onDelete: (id: string) => void
}

export default function HabitCard({ habit, isNext, onToggle, onEdit, onDelete }: Props) {
  const [menu, setMenu] = useState(false)
  const [leaving, setLeaving] = useState(false)

  const handleCheck = () => {
    if (!habit.completedToday) {
      setLeaving(true)
      setTimeout(() => { setLeaving(false); onToggle(habit.id, false) }, 380)
    } else {
      onToggle(habit.id, true)
    }
  }

  return (
    <div className={`card p-3.5 flex items-center gap-3 ${isNext ? 'slide-in' : ''}`}
      style={{
        opacity: leaving ? 0 : 1,
        transform: leaving ? 'translateX(-16px)' : 'none',
        transition: leaving ? 'opacity 0.35s, transform 0.35s' : 'border-color 0.2s',
        borderColor: habit.completedToday ? 'rgba(61,153,112,0.25)' : 'var(--border)',
        background: isNext ? 'rgba(201,168,76,0.03)' : habit.completedToday ? 'rgba(61,153,112,0.05)' : 'var(--card)',
      }}>

      {/* تشيك بوكس */}
      <input type="checkbox" className="habit-check"
        checked={habit.completedToday} onChange={handleCheck} />

      {/* أيقونة */}
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
        style={{ background: `${habit.color}15`, border: `1px solid ${habit.color}30` }}>
        {habit.icon}
      </div>

      {/* اسم وستريك */}
      <div className="flex-1 min-w-0">
        {isNext && (
          <p className="text-xs mb-0.5" style={{ color: 'var(--gold)' }}>التالي</p>
        )}
        <p className="font-bold text-sm truncate"
          style={{
            color: habit.completedToday ? 'var(--muted)' : 'var(--text)',
            textDecoration: habit.completedToday ? 'line-through' : 'none',
          }}>
          {habit.name}
        </p>
        {habit.streak > 0 && (
          <p className="text-xs mt-0.5" style={{ color: '#e07a30' }}>🔥 {habit.streak} يوم</p>
        )}
      </div>

      {/* منيو */}
      <div className="relative">
        <button onClick={() => setMenu(!menu)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-lg"
          style={{ color: 'var(--muted)', opacity: 0.5 }}>⋮</button>

        {menu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenu(false)} />
            <div className="absolute left-0 top-full mt-1 rounded-xl overflow-hidden z-20 shadow-xl"
              style={{ background: '#1e2d3a', border: '1px solid var(--border)', minWidth: 110 }}>
              <button onClick={() => { onEdit(); setMenu(false) }}
                className="w-full px-3 py-2 text-right text-sm"
                style={{ color: 'var(--text)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                ✏️ تعديل
              </button>
              <button onClick={() => { onDelete(habit.id); setMenu(false) }}
                className="w-full px-3 py-2 text-right text-sm"
                style={{ color: 'var(--red)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(224,82,82,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                🗑️ مسح
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
