'use client'

import { useState } from 'react'

const ICONS = ['🤲','📖','🕌','🌙','⭐','💧','🍎','🏃','❤️','🎁','📿','✨','🧘','🌿','💪','🙏']
const COLORS = ['#c9a84c','#3d9970','#4a90d9','#9b59b6','#e07a30','#e05252','#27ae60','#2980b9']

interface Props {
  habit: { id: string; name: string; icon: string; color: string } | null
  onSave: (d: { name: string; icon: string; color: string }) => void
  onClose: () => void
}

export default function HabitModal({ habit, onSave, onClose }: Props) {
  const [name, setName] = useState(habit?.name || '')
  const [icon, setIcon] = useState(habit?.icon || '🌙')
  const [color, setColor] = useState(habit?.color || '#c9a84c')

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)' }} onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl p-5 space-y-4"
        style={{ background: '#131e28', border: '1px solid var(--border)', animation: 'fadeUp 0.25s ease-out' }}
        onClick={e => e.stopPropagation()}>

        <h2 className="font-black text-lg" style={{ color: 'var(--text)' }}>
          {habit ? 'تعديل العادة' : 'عادة جديدة'}
        </h2>

        {/* اسم */}
        <input type="text" value={name} onChange={e => setName(e.target.value)}
          placeholder="اسم العادة..." maxLength={40} autoFocus
          className="w-full px-4 py-3 rounded-xl focus:outline-none"
          style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
          onFocus={e => (e.target.style.borderColor = 'var(--gold)')}
          onBlur={e => (e.target.style.borderColor = 'var(--border)')}
        />

        {/* أيقونة */}
        <div>
          <p className="text-xs mb-2" style={{ color: 'var(--muted)' }}>الأيقونة</p>
          <div className="flex flex-wrap gap-2">
            {ICONS.map(ic => (
              <button key={ic} onClick={() => setIcon(ic)}
                className="w-10 h-10 rounded-xl text-xl transition-all"
                style={{
                  background: icon === ic ? 'rgba(201,168,76,0.15)' : 'var(--bg)',
                  border: `1.5px solid ${icon === ic ? 'var(--gold)' : 'var(--border)'}`,
                  transform: icon === ic ? 'scale(1.1)' : 'scale(1)',
                }}>
                {ic}
              </button>
            ))}
          </div>
        </div>

        {/* لون */}
        <div>
          <p className="text-xs mb-2" style={{ color: 'var(--muted)' }}>اللون</p>
          <div className="flex gap-2">
            {COLORS.map(c => (
              <button key={c} onClick={() => setColor(c)}
                className="w-7 h-7 rounded-full transition-all"
                style={{
                  background: c,
                  outline: color === c ? `2px solid ${c}` : 'none',
                  outlineOffset: 2,
                  transform: color === c ? 'scale(1.2)' : 'scale(1)',
                }} />
            ))}
          </div>
        </div>

        {/* أزرار */}
        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="btn-ghost flex-1 py-2.5 text-sm">إلغاء</button>
          <button onClick={() => name.trim() && onSave({ name: name.trim(), icon, color })}
            disabled={!name.trim()} className="btn-gold flex-1 py-2.5 text-sm">
            {habit ? 'حفظ' : 'إضافة'}
          </button>
        </div>
      </div>
    </div>
  )
}
