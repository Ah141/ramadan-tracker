'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getSession } from '@/lib/session'

interface Entry { id: string; name: string; total_completions: number; active_days: number }

export default function Leaderboard() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [myId, setMyId] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const s = getSession()
    if (s) setMyId(s.id)
    createClient().from('leaderboard').select('*').limit(50)
      .then(({ data }) => { setEntries(data || []); setLoading(false) })
  }, [])

  const medals = ['🥇', '🥈', '🥉']
  const myRank = entries.findIndex(e => e.id === myId)
  const me = entries[myRank]
  const ahead = myRank > 0 ? entries[myRank - 1] : null

  return (
    <div className="max-w-md mx-auto px-4 py-5">

      <h1 className="text-xl font-black mb-1" style={{ color: 'var(--text)' }}>🏆 الترتيب</h1>
      <p className="text-sm mb-5" style={{ color: 'var(--muted)' }}>أكتر الناس التزاماً في رمضان</p>

      {/* بطاقة مركزي */}
      {me && (
        <div className="card p-4 mb-5 fade-up" style={{ borderColor: 'rgba(201,168,76,0.3)' }}>
          <div className="flex items-center gap-3">
            <span className="font-black text-2xl" style={{ color: 'var(--gold)' }}>#{myRank + 1}</span>
            <div className="flex-1">
              <p className="font-bold" style={{ color: 'var(--text)' }}>انت</p>
              {ahead && (
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                  فاصلك عن {ahead.name}: {ahead.total_completions - me.total_completions} نقطة
                </p>
              )}
            </div>
            <div className="text-left">
              <p className="font-black text-xl" style={{ color: 'var(--gold)' }}>{me.total_completions}</p>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>نقطة</p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10" style={{ color: 'var(--muted)' }}>جاري التحميل...</div>
      ) : (
        <div className="space-y-2">
          {entries.map((e, i) => {
            const isMe = e.id === myId
            return (
              <div key={e.id} className="card p-3.5 flex items-center gap-3"
                style={{
                  animation: `fadeUp 0.3s ease-out ${Math.min(i, 8) * 0.04}s both`,
                  borderColor: isMe ? 'rgba(201,168,76,0.25)' : 'var(--border)',
                  background: isMe ? 'rgba(201,168,76,0.04)' : 'var(--card)',
                }}>
                <span className="w-8 text-center flex-shrink-0">
                  {i < 3 ? medals[i] : <span className="text-sm font-bold" style={{ color: 'var(--muted)' }}>{i+1}</span>}
                </span>
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-black flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--muted)' }}>
                  {e.name[0]}
                </div>
                <p className="flex-1 font-bold text-sm truncate"
                  style={{ color: isMe ? 'var(--gold)' : 'var(--text)' }}>
                  {e.name} {isMe && <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(انت)</span>}
                </p>
                <p className="font-black" style={{ color: i === 0 ? 'var(--gold)' : 'var(--muted)' }}>
                  {e.total_completions}
                </p>
              </div>
            )
          })}

          {entries.length === 0 && (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">🌙</p>
              <p className="mb-4" style={{ color: 'var(--muted)' }}>مفيش حد سجل لسه</p>
              <Link href="/" className="btn-gold px-5 py-2 text-sm inline-block">ابدأ دلوقتي</Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
