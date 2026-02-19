-- نسخة مبسطة - بدون تسجيل دخول، بالاسم بس

-- جدول المستخدمين
CREATE TABLE IF NOT EXISTS members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول العادات
CREATE TABLE IF NOT EXISTS habits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES members(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '🌙',
  color TEXT DEFAULT '#f59e0b',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول التتبع اليومي
CREATE TABLE IF NOT EXISTS habit_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES members(id) ON DELETE CASCADE NOT NULL,
  completed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(habit_id, completed_date)
);

-- تفعيل الأمان
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;

-- سياسات - مفيش auth
CREATE POLICY "anyone can read members" ON members FOR SELECT USING (true);
CREATE POLICY "anyone can insert members" ON members FOR INSERT WITH CHECK (true);

CREATE POLICY "anyone can read habits" ON habits FOR SELECT USING (true);
CREATE POLICY "anyone can insert habits" ON habits FOR INSERT WITH CHECK (true);
CREATE POLICY "anyone can update habits" ON habits FOR UPDATE USING (true);
CREATE POLICY "anyone can delete habits" ON habits FOR DELETE USING (true);

CREATE POLICY "anyone can read completions" ON habit_completions FOR SELECT USING (true);
CREATE POLICY "anyone can insert completions" ON habit_completions FOR INSERT WITH CHECK (true);
CREATE POLICY "anyone can delete completions" ON habit_completions FOR DELETE USING (true);

-- ليدربورد
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
