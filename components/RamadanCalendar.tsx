'use client'

import { getRamadanDay } from '@/lib/utils'

interface Props {
  // أيام اكتملت فيها كل العادات (أو جزء منها)
  completionsByDate: Record<string, { done: number; total: number }>
}

export default function RamadanCalendar({ completionsByDate }: Props) {
  const ramadanStart = new Date('2025-03-01')
  const today = new Date().toISOString().split('T')[0]
  const ramadanDay = getRamadanDay()

  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(ramadanStart)
    d.setDate(d.getDate() + i)
    const dateStr = d.toISOString().split('T')[0]
    const dayNum = i + 1
    const isToday = dateStr === today
    const isFuture = dayNum > ramadanDay
    const data = completionsByDate[dateStr]
    const allDone = data && data.total > 0 && data.done === data.total
    const partial = data && data.total > 0 && data.done > 0 && data.done < data.total
    const missed = !isFuture && !isToday && data?.total > 0 && data.done === 0
    const noData = !isFuture && !isToday && (!data || data.total === 0)

    return { dayNum, dateStr, isToday, isFuture, allDone, partial, missed, noData }
  })

  // إحصائيات
  const pastDays = days.filter(d => !d.isFuture && !d.isToday)
  const doneDays = pastDays.filter(d => d.allDone).length
  const partialDays = pastDays.filter(d => d.partial).length
  const missedDays = pastDays.filter(d => d.missed).length

  return (
    <div className="card p-4 fade-up d2">
      {/* عنوان */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>سجل رمضان</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>اليوم {ramadanDay} من 30</p>
        </div>
        <div className="text-left">
          <p className="text-2xl font-black" style={{ color: 'var(--gold)' }}>{ramadanDay}</p>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>يوم</p>
        </div>
      </div>

      {/* شبكة الأيام */}
      <div className="grid grid-cols-10 gap-1.5 mb-4">
        {days.map(d => (
          <div key={d.dayNum} className="relative group">
            <div
              className="w-full aspect-square rounded-lg flex items-center justify-center transition-transform hover:scale-110"
              style={{
                background:
                  d.isToday    ? 'var(--gold)'                    :
                  d.allDone    ? 'var(--green)'                   :
                  d.partial    ? 'rgba(61,153,112,0.35)'          :
                  d.missed     ? 'rgba(224,82,82,0.25)'           :
                  d.isFuture   ? 'rgba(255,255,255,0.03)'         :
                                 'rgba(255,255,255,0.05)',
                border:
                  d.isToday  ? '1px solid var(--gold)'           :
                  d.allDone  ? '1px solid var(--green)'          :
                  d.partial  ? '1px solid rgba(61,153,112,0.5)'  :
                  d.missed   ? '1px solid rgba(224,82,82,0.3)'   :
                               '1px solid transparent',
                cursor: 'default',
              }}
            >
              <span style={{
                fontSize: 9,
                fontWeight: 700,
                color:
                  d.isToday  ? '#0c1219'             :
                  d.allDone  ? '#fff'                :
                  d.partial  ? 'rgba(255,255,255,0.8)' :
                  d.missed   ? 'rgba(224,82,82,0.7)' :
                               'rgba(255,255,255,0.2)',
              }}>
                {d.dayNum}
              </span>
            </div>

            {/* tooltip بسيط */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none"
              style={{ background: '#1e2d3a', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 11 }}>
              {d.isToday  ? 'النهارده' :
               d.allDone  ? `يوم ${d.dayNum} ✅` :
               d.partial  ? `يوم ${d.dayNum} — جزئي` :
               d.missed   ? `يوم ${d.dayNum} ❌` :
               d.isFuture ? `يوم ${d.dayNum}` :
                            `يوم ${d.dayNum}`}
            </div>
          </div>
        ))}
      </div>

      {/* مفتاح الألوان والإحصائيات */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--muted)' }}>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded inline-block" style={{ background: 'var(--green)' }} />
            اكتمل ({doneDays})
          </span>
          {partialDays > 0 && (
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded inline-block" style={{ background: 'rgba(61,153,112,0.35)' }} />
              جزئي ({partialDays})
            </span>
          )}
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded inline-block" style={{ background: 'rgba(224,82,82,0.25)' }} />
            فات ({missedDays})
          </span>
        </div>

        {/* نسبة الالتزام */}
        {pastDays.length > 0 && (
          <p className="text-xs font-bold" style={{ color: 'var(--gold)' }}>
            {Math.round((doneDays / pastDays.length) * 100)}% التزام
          </p>
        )}
      </div>
    </div>
  )
}
