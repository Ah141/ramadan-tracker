'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getSession, clearSession, saveSession } from '@/lib/session'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<{ id: string; name: string } | null>(null)
  const [newName, setNewName] = useState('')
  const [stats, setStats] = useState({ points: 0, rank: 0, days: 0, habits: 0 })
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const s = getSession()
    if (!s) { router.push('/'); return }
    setUser(s); setNewName(s.name)
    loadStats(s.id)
  }, [])

  const loadStats = async (id: string) => {
    const [{ data: lb }, { data: habits }] = await Promise.all([
      supabase.from('leaderboard').select('*').limit(100),
      supabase.from('habits').select('id').eq('user_id', id),
    ])
    const me = (lb || []).find(e => e.id === id)
    const rank = (lb || []).findIndex(e => e.id === id) + 1
    setStats({ points: me?.total_completions ?? 0, rank, days: me?.active_days ?? 0, habits: habits?.length ?? 0 })
  }

  const saveName = async () => {
    if (!user || !newName.trim() || newName.trim() === user.name) { setEditing(false); return }
    setSaving(true)
    const { data: ex } = await supabase.from('members').select('id').eq('name', newName.trim()).limit(1)
    if (ex?.length) { setMsg('الاسم ده موجود!'); setSaving(false); return }
    await supabase.from('members').update({ name: newName.trim() }).eq('id', user.id)
    const u = { ...user, name: newName.trim() }
    saveSession(u); setUser(u); setEditing(false); setSaving(false)
    setMsg('✅ اتغير الاسم'); setTimeout(() => setMsg(''), 2000)
  }

  if (!user) return null

  return (
    <div className="max-w-md mx-auto px-4 py-8 space-y-6">

      {/* الاسم */}
      <div className="text-center fade-up">
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-3"
          style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.25)', color: 'var(--gold)' }}>
          {user.name[0]}
        </div>

        {editing ? (
          <div className="flex items-center gap-2 max-w-xs mx-auto">
            <input value={newName} onChange={e => setNewName(e.target.value)} autoFocus maxLength={30}
              className="flex-1 px-3 py-2 rounded-xl text-center font-bold focus:outline-none"
              style={{ background: 'var(--card)', border: '1px solid var(--gold)', color: 'var(--text)' }}
              onKeyDown={e => e.key === 'Enter' && saveName()} />
            <button onClick={saveName} disabled={saving} className="btn-gold px-3 py-2 text-sm">
              {saving ? '...' : 'حفظ'}
            </button>
            <button onClick={() => { setEditing(false); setNewName(user.name) }} className="btn-ghost px-3 py-2 text-sm">✕</button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl font-black" style={{ color: 'var(--text)' }}>{user.name}</h1>
            <button onClick={() => setEditing(true)} style={{ color: 'var(--muted)', fontSize: 16 }}>✏️</button>
          </div>
        )}

        {msg && <p className="text-sm mt-2" style={{ color: msg.includes('✅') ? 'var(--green)' : 'var(--red)' }}>{msg}</p>}
      </div>

      {/* إحصائيات */}
      <div className="grid grid-cols-2 gap-3 fade-up d1">
        {[
          { label: 'نقاطك',      value: stats.points,               color: 'var(--gold)' },
          { label: 'مركزك',      value: stats.rank ? `#${stats.rank}` : '—', color: 'var(--green)' },
          { label: 'أيام نشطة', value: stats.days,                 color: 'var(--text)' },
          { label: 'عاداتك',     value: stats.habits,               color: 'var(--text)' },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <p className="text-2xl font-black mb-0.5" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* خروج */}
      <button onClick={() => { clearSession(); router.push('/') }}
        className="w-full py-3 rounded-2xl text-sm font-bold fade-up d2"
        style={{ border: '1px solid rgba(224,82,82,0.2)', color: 'var(--red)', background: 'transparent' }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(224,82,82,0.06)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
        تسجيل خروج
      </button>
    </div>
  )
}
