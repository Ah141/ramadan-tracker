'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getSession } from '@/lib/session'
import { calculateStreak, getRamadanDay } from '@/lib/utils'
import HabitCard from '@/components/HabitCard'
import HabitModal from '@/components/HabitModal'
import RamadanCalendar from '@/components/RamadanCalendar'

interface Habit {
  id: string; name: string; icon: string; color: string
  streak: number; completedToday: boolean
}

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<{ id: string; name: string } | null>(null)
  const [habits, setHabits] = useState<Habit[]>([])
  const [completionsByDate, setCompletionsByDate] = useState<Record<string, { done: number; total: number }>>({})
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Habit | null>(null)
  const [allDone, setAllDone] = useState(false)

  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]
  const ramadanDay = getRamadanDay()
  const doneCount = habits.filter(h => h.completedToday).length
  const total = habits.length
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0

  useEffect(() => {
    const u = getSession()
    if (!u) { router.push('/'); return }
    setUser(u)
    load(u.id)
  }, [])

  const load = async (uid: string) => {
    const ramadanStart = '2025-03-01'
    const [{ data: hData }, { data: cData }] = await Promise.all([
      supabase.from('habits').select('*').eq('user_id', uid).order('created_at'),
      supabase.from('habit_completions').select('*').eq('user_id', uid).gte('completed_date', ramadanStart),
    ])

    const habits = hData || []
    const completions = cData || []

    // حساب الحالة لكل عادة
    const list: Habit[] = habits.map(h => {
      const hc = completions.filter(c => c.habit_id === h.id)
      return { id: h.id, name: h.name, icon: h.icon, color: h.color, streak: calculateStreak(hc), completedToday: hc.some(c => c.completed_date === today) }
    })
    setHabits(list)

    // حساب completionsByDate — كل يوم: كم عادة اتعملت من الكل
    const byDate: Record<string, { done: number; total: number }> = {}
    const allDates = new Set(completions.map(c => c.completed_date))

    // كل يوم من رمضان اللي عنده بيانات
    allDates.forEach(date => {
      const doneOnDay = new Set(completions.filter(c => c.completed_date === date).map(c => c.habit_id))
      byDate[date] = { done: doneOnDay.size, total: habits.length }
    })

    // الأيام اللي مش فيها completions خالص — نحطها صفر
    const start = new Date('2025-03-01')
    const todayD = new Date(today)
    for (let d = new Date(start); d <= todayD; d.setDate(d.getDate() + 1)) {
      const ds = d.toISOString().split('T')[0]
      if (!byDate[ds]) byDate[ds] = { done: 0, total: habits.length }
    }

    setCompletionsByDate(byDate)
    setLoading(false)
  }

  const handleToggle = async (id: string, done: boolean) => {
    const updated = habits.map(h => h.id === id ? { ...h, completedToday: !done } : h)
    setHabits(updated)
    const nowAllDone = updated.every(h => h.completedToday) && updated.length > 0
    if (nowAllDone && !allDone) setAllDone(true)
    if (!nowAllDone) setAllDone(false)

    // تحديث completionsByDate للنهارده
    setCompletionsByDate(prev => {
      const todayData = prev[today] ?? { done: 0, total }
      return {
        ...prev,
        [today]: { ...todayData, done: done ? todayData.done - 1 : todayData.done + 1 }
      }
    })

    if (done) {
      await supabase.from('habit_completions').delete().eq('habit_id', id).eq('completed_date', today)
    } else {
      await supabase.from('habit_completions').insert({ habit_id: id, user_id: user!.id, completed_date: today })
    }
  }

  const handleSave = async (data: { name: string; icon: string; color: string }) => {
    if (!user) return
    if (editing) {
      const { data: upd } = await supabase.from('habits').update(data).eq('id', editing.id).select().single()
      if (upd) setHabits(prev => prev.map(h => h.id === editing.id ? { ...h, ...upd } : h))
    } else {
      const { data: created } = await supabase.from('habits').insert({ ...data, user_id: user.id }).select().single()
      if (created) setHabits(prev => [...prev, { ...created, streak: 0, completedToday: false }])
    }
    setShowModal(false); setEditing(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('تمسح العادة دي؟')) return
    await supabase.from('habits').delete().eq('id', id)
    setHabits(prev => prev.filter(h => h.id !== id))
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-5xl">🌙</div>
    </div>
  )

  const pending = habits.filter(h => !h.completedToday)
  const done    = habits.filter(h =>  h.completedToday)

  return (
    <div className="max-w-md mx-auto px-4 py-5 space-y-5">

      {/* رأس الصفحة */}
      <div className="fade-up flex items-center justify-between">
        <div>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>اليوم {ramadanDay} من رمضان</p>
          <h1 className="text-xl font-black" style={{ color: 'var(--text)' }}>أهلاً {user?.name} 👋</h1>
        </div>
        <button onClick={() => { setEditing(null); setShowModal(true) }}
          className="btn-green px-4 py-2 text-sm">
          + عادة
        </button>
      </div>

      {/* سجل رمضان */}
      {habits.length > 0 && (
        <RamadanCalendar completionsByDate={completionsByDate} />
      )}

      {/* شريط التقدم */}
      {total > 0 && (
        <div className="fade-up d1">
          <div className="flex justify-between text-xs mb-1.5" style={{ color: 'var(--muted)' }}>
            <span>النهارده: {doneCount} من {total}</span>
            <span>{pct}%</span>
          </div>
          <div className="progress-bar">
            <div className={`progress-fill ${pct === 100 ? 'gold' : ''}`} style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      {/* لو خلصوا كلهم */}
      {allDone && total > 0 && (
        <div className="card p-4 text-center pop fade-up" style={{ borderColor: 'rgba(61,153,112,0.3)', background: 'rgba(61,153,112,0.08)' }}>
          <p className="text-2xl mb-1">🎉</p>
          <p className="font-black" style={{ color: 'var(--green)' }}>أكملت كل عاداتك النهارده!</p>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>ربنا يتقبل منك</p>
        </div>
      )}

      {/* العادات الجاية */}
      {pending.length > 0 && (
        <div className="space-y-2 fade-up d2">
          {pending.map((h, i) => (
            <HabitCard key={h.id} habit={h} isNext={i === 1}
              onToggle={handleToggle}
              onEdit={() => { setEditing(h); setShowModal(true) }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* العادات المكتملة */}
      {done.length > 0 && (
        <details open={pending.length === 0} className="fade-up d3">
          <summary className="flex items-center gap-3 cursor-pointer select-none py-1 list-none"
            style={{ color: 'var(--muted)', fontSize: 13 }}>
            <span className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            ✅ اتكملوا ({done.length})
            <span className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          </summary>
          <div className="space-y-2 mt-2">
            {done.map(h => (
              <HabitCard key={h.id} habit={h}
                onToggle={handleToggle}
                onEdit={() => { setEditing(h); setShowModal(true) }}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </details>
      )}

      {/* لو مفيش عادات */}
      {habits.length === 0 && (
        <div className="card p-10 text-center fade-up d2" style={{ borderStyle: 'dashed' }}>
          <p className="text-4xl mb-3">🌙</p>
          <p className="font-bold mb-1" style={{ color: 'var(--text)' }}>محتشيش عادات لسه</p>
          <p className="text-sm mb-5" style={{ color: 'var(--muted)' }}>ضيف عادة وهتتكرر كل يوم تلقائياً</p>
          <button onClick={() => { setEditing(null); setShowModal(true) }} className="btn-gold px-6 py-2.5 text-sm">
            ضيف أول عادة
          </button>
        </div>
      )}

      {showModal && (
        <HabitModal habit={editing}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditing(null) }}
        />
      )}
    </div>
  )
}
