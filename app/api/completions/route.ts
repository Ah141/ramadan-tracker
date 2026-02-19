import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { habit_id, completed_date } = body

  const { data, error } = await supabase
    .from('habit_completions')
    .upsert({ habit_id, user_id: user.id, completed_date: completed_date || new Date().toISOString().split('T')[0] })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function DELETE(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const habit_id = searchParams.get('habit_id')
  const completed_date = searchParams.get('date') || new Date().toISOString().split('T')[0]

  const { error } = await supabase
    .from('habit_completions')
    .delete()
    .eq('habit_id', habit_id!)
    .eq('user_id', user.id)
    .eq('completed_date', completed_date)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
