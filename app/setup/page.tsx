'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Status = 'checking' | 'ok' | 'error' | 'creating'

export default function SetupPage() {
  const router = useRouter()
  const [status, setStatus] = useState<Status>('checking')
  const [log, setLog] = useState<string[]>([])
  const [errorMsg, setErrorMsg] = useState('')

  const addLog = (msg: string) => setLog(prev => [...prev, msg])

  useEffect(() => {
    runSetup()
  }, [])

  const runSetup = async () => {
    const supabase = createClient()
    setStatus('checking')
    addLog('🔍 بنتحقق من قاعدة البيانات...')

    // بنتحقق من وجود جدول members
    const { error: checkError } = await supabase.from('members').select('id').limit(1)

    if (!checkError) {
      addLog('✅ الجداول موجودة وشغالة!')
      setStatus('ok')
      setTimeout(() => router.push('/'), 1500)
      return
    }

    addLog('⚠️ الجداول مش موجودة — بنعملها دلوقتي...')
    setStatus('creating')

    // بنعمل الجداول عن طريق exec_sql RPC
    const sql = `
      CREATE TABLE IF NOT EXISTS members (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS habits (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES members(id) ON DELETE CASCADE NOT NULL,
        name TEXT NOT NULL,
        icon TEXT DEFAULT '🌙',
        color TEXT DEFAULT '#f59e0b',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS habit_completions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        habit_id UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
        user_id UUID REFERENCES members(id) ON DELETE CASCADE NOT NULL,
        completed_date DATE NOT NULL DEFAULT CURRENT_DATE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(habit_id, completed_date)
      );

      ALTER TABLE members ENABLE ROW LEVEL SECURITY;
      ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
      ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;

      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='members' AND policyname='anyone can read members') THEN
          CREATE POLICY "anyone can read members" ON members FOR SELECT USING (true);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='members' AND policyname='anyone can insert members') THEN
          CREATE POLICY "anyone can insert members" ON members FOR INSERT WITH CHECK (true);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='habits' AND policyname='anyone can read habits') THEN
          CREATE POLICY "anyone can read habits" ON habits FOR SELECT USING (true);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='habits' AND policyname='anyone can insert habits') THEN
          CREATE POLICY "anyone can insert habits" ON habits FOR INSERT WITH CHECK (true);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='habits' AND policyname='anyone can update habits') THEN
          CREATE POLICY "anyone can update habits" ON habits FOR UPDATE USING (true);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='habits' AND policyname='anyone can delete habits') THEN
          CREATE POLICY "anyone can delete habits" ON habits FOR DELETE USING (true);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='habit_completions' AND policyname='anyone can read completions') THEN
          CREATE POLICY "anyone can read completions" ON habit_completions FOR SELECT USING (true);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='habit_completions' AND policyname='anyone can insert completions') THEN
          CREATE POLICY "anyone can insert completions" ON habit_completions FOR INSERT WITH CHECK (true);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='habit_completions' AND policyname='anyone can delete completions') THEN
          CREATE POLICY "anyone can delete completions" ON habit_completions FOR DELETE USING (true);
        END IF;
      END $$;

      CREATE OR REPLACE VIEW leaderboard AS
      SELECT 
        u.id,
        u.name,
        COUNT(hc.id) AS total_completions,
        COUNT(DISTINCT hc.completed_date) AS active_days
      FROM members u
      LEFT JOIN habit_completions hc ON u.id = hc.user_id
      GROUP BY u.id, u.name
      ORDER BY total_completions DESC;
    `

    const { error: rpcError } = await supabase.rpc('exec_sql', { sql })

    if (rpcError) {
      // الـ RPC مش موجود — محتاج يعمل الجداول يدوي
      addLog('❌ مش قادر أعمل الجداول تلقائياً')
      addLog('👇 محتاج تعملها يدوي من Supabase')
      setStatus('error')
      setErrorMsg(rpcError.message)
      return
    }

    addLog('✅ اتعملت الجداول بنجاح!')
    setStatus('ok')
    setTimeout(() => router.push('/'), 1500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🌙</div>
          <h1 className="text-2xl font-black text-white">إعداد قاعدة البيانات</h1>
        </div>

        <div className="card p-5 space-y-2 mb-4 font-mono text-sm">
          {log.map((line, i) => (
            <p key={i} className="text-white/70">{line}</p>
          ))}
          {status === 'checking' || status === 'creating' ? (
            <p className="text-amber-400 animate-pulse">جاري التنفيذ...</p>
          ) : null}
        </div>

        {status === 'ok' && (
          <div className="card p-4 border-green-500/30 bg-green-900/10 text-center">
            <p className="text-green-400 font-bold">✅ كل حاجة تمام! بنحولك دلوقتي...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="card p-4 border-red-500/30 bg-red-900/10">
              <p className="text-red-400 text-sm font-bold mb-3">محتاج تعمل الجداول يدوياً:</p>
              <ol className="text-white/60 text-sm space-y-1 list-decimal list-inside">
                <li>روح <strong className="text-white">supabase.com</strong> وافتح مشروعك</li>
                <li>اضغط <strong className="text-white">SQL Editor</strong> من القائمة الجانبية</li>
                <li>اضغط <strong className="text-white">New Query</strong></li>
                <li>ألصق الكود اللي تحت واضغط <strong className="text-white">Run</strong></li>
              </ol>
            </div>

            <div className="card p-4 overflow-auto max-h-64">
              <p className="text-white/40 text-xs mb-2">الصق الكود ده في SQL Editor:</p>
              <pre className="text-green-400 text-xs whitespace-pre-wrap select-all">{`-- امسح الجداول القديمة لو موجودة
DROP TABLE IF EXISTS habit_completions CASCADE;
DROP TABLE IF EXISTS habits CASCADE;
DROP TABLE IF EXISTS members CASCADE;
DROP VIEW IF EXISTS leaderboard;

-- عمل الجداول الجديدة
CREATE TABLE members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE habits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES members(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '🌙',
  color TEXT DEFAULT '#f59e0b',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE habit_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES members(id) ON DELETE CASCADE NOT NULL,
  completed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(habit_id, completed_date)
);

ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read members" ON members FOR SELECT USING (true);
CREATE POLICY "insert members" ON members FOR INSERT WITH CHECK (true);
CREATE POLICY "read habits" ON habits FOR SELECT USING (true);
CREATE POLICY "insert habits" ON habits FOR INSERT WITH CHECK (true);
CREATE POLICY "update habits" ON habits FOR UPDATE USING (true);
CREATE POLICY "delete habits" ON habits FOR DELETE USING (true);
CREATE POLICY "read completions" ON habit_completions FOR SELECT USING (true);
CREATE POLICY "insert completions" ON habit_completions FOR INSERT WITH CHECK (true);
CREATE POLICY "delete completions" ON habit_completions FOR DELETE USING (true);

CREATE VIEW leaderboard AS
SELECT u.id, u.name,
  COUNT(hc.id) AS total_completions,
  COUNT(DISTINCT hc.completed_date) AS active_days
FROM members u
LEFT JOIN habit_completions hc ON u.id = hc.user_id
GROUP BY u.id, u.name
ORDER BY total_completions DESC;`}</pre>
            </div>

            <button
              onClick={runSetup}
              className="gold-btn w-full py-3"
            >
              🔄 جرب تاني بعد ما تشغّل الـ SQL
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
