'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { saveSession } from '@/lib/session'

export default function Home() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(false)
  }, [])

  const handleEnter = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    setSubmitting(true)
    setError('')

    const supabase = createClient()
    const { data: results, error: searchErr } = await supabase
      .from('members').select('id, name').eq('name', trimmed).limit(1)

    if (searchErr) {
      if (searchErr.message.includes('schema cache') || searchErr.message.includes('does not exist')) {
        router.push('/setup'); return
      }
      setError('مشكلة في الاتصال، حاول تاني')
      setSubmitting(false); return
    }

    let user = results?.[0] ?? null
    if (!user) {
      const { data: created, error: err } = await supabase
        .from('members').insert({ name: trimmed }).select().single()
      if (err || !created) { setError('مشكلة، حاول تاني'); setSubmitting(false); return }
      user = created
    }

    saveSession({ id: user.id, name: user.name })
    router.push('/dashboard')
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-5xl" style={{ animation: 'fadeUp 0.5s ease-out' }}>🌙</div>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-xs">

        {/* شعار */}
        <div className="text-center mb-8 fade-up">
          <div className="text-6xl mb-3">💋</div>
          <h1 className="text-3xl font-black" style={{ color: 'var(--gold)' }}>تحدى السكن</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>رمضان ده غير يا اخواتى</p>
        </div>

        {/* فورم */}
        <form onSubmit={handleEnter} className="fade-up d1 space-y-3">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="اكتب اسمك... مثلا عمور القمور"
            maxLength={30}
            autoFocus
            className="w-full px-4 py-3.5 rounded-2xl text-center text-lg font-bold focus:outline-none transition-all"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
            }}
            onFocus={e => (e.target.style.borderColor = 'var(--gold)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border)')}
          />

          {error && <p className="text-sm text-center" style={{ color: 'var(--red)' }}>{error}</p>}

          <button type="submit" disabled={submitting || !name.trim()}
            className="btn-gold w-full py-3.5 text-base">
            {submitting ? 'جاري...' : 'دخول →'}
          </button>
        </form>

        <p className="text-xs text-center mt-4 fade-up d2" style={{ color: 'var(--muted)' }}>
          لو اسمك موجود هيدخل على حسابك تلقائياً
        </p>

        <div className="border-t mt-6 pt-5 text-center fade-up d2" style={{ borderColor: 'var(--border)' }}>
          <a href="/leaderboard" className="text-sm" style={{ color: 'var(--muted)' }}>
            🏆 شوف الترتيب
          </a>
        </div>
      </div>
    </div>
  )
}
