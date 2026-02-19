'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const DAY_AR = ['أح', 'إث', 'ثل', 'أر', 'خم', 'جم', 'سب']

interface Props {
  data: { date: string; completed: number; total: number; pct: number; isToday: boolean }[]
}

export default function ProgressChart({ data }: Props) {
  const chartData = data.map(d => ({
    ...d,
    day: DAY_AR[new Date(d.date + 'T12:00:00').getDay()],
  }))

  return (
    <div className="card p-4">
      <p className="text-xs mb-3" style={{ color: 'var(--gold)', opacity: 0.7 }}>
        📊 آخر 7 أيام
      </p>
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barSize={24} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
            <XAxis dataKey="day"
              tick={{ fill: 'rgba(200,185,154,0.5)', fontSize: 11, fontFamily: 'Cairo' }}
              axisLine={false} tickLine={false}
            />
            <YAxis
              tick={{ fill: 'rgba(200,185,154,0.3)', fontSize: 10 }}
              axisLine={false} tickLine={false} allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--navy-ll)',
                border: '1px solid rgba(201,168,76,0.25)',
                borderRadius: '10px',
                color: 'var(--cream)',
                fontSize: '12px',
                fontFamily: 'Cairo',
                direction: 'rtl',
              }}
              formatter={(val: number, _: string, props: any) => [
                `${props.payload.completed} / ${props.payload.total}`, 'أتمت'
              ]}
              labelStyle={{ color: 'var(--gold)' }}
              cursor={{ fill: 'rgba(201,168,76,0.06)' }}
            />
            <Bar dataKey="completed" radius={[6, 6, 0, 0]}>
              {chartData.map((d, i) => (
                <Cell
                  key={i}
                  fill={
                    d.isToday   ? '#c9a84c' :
                    d.pct===100 ? '#52b788' :
                    d.completed > 0 ? '#40916c' :
                    'rgba(255,255,255,0.06)'
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex gap-4 mt-2" style={{ fontSize: 11, color: 'var(--cream-d)', opacity: 0.5 }}>
        <span>🟡 اليوم</span>
        <span>🟢 اكتمل</span>
        <span>🫙 ما اكتمل</span>
      </div>
    </div>
  )
}
