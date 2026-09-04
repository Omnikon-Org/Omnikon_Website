import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile || (profile.role !== 'admin' && profile.role !== 'editor' && profile.role !== 'contributor')) {
      return NextResponse.json({ error: 'Forbidden: Insufficient role' }, { status: 403 });
    }

    const body = await req.json();
    const { questions = [], ...quizFields } = body;

    const adminSupabase = createAdminClient();

    // 1. Insert Quiz
    const { data: quizData, error: quizError } = await adminSupabase
      .from('quizzes')
      .insert({
        title: quizFields.title,
        slug: quizFields.slug,
        description: quizFields.description,
        category: quizFields.category || 'JavaScript',
        difficulty: quizFields.difficulty || 'Beginner',
        estimated_duration_minutes: quizFields.estimated_duration_minutes || 10,
        pass_percentage: quizFields.pass_percentage || 70,
        status: quizFields.status || 'published',
        author_id: user.id,
      })
      .select('id')
      .single();

    if (quizError || !quizData) {
      return NextResponse.json({ error: quizError?.message || 'Failed to create quiz' }, { status: 400 });
    }

    // 2. Insert Questions
    if (questions.length > 0) {
      const formattedQuestions = questions.map((q: any, idx: number) => ({
        quiz_id: quizData.id,
        question_text: q.question_text,
        options: q.options,
        correct_option_id: q.correct_option_id,
        explanation: q.explanation,
        difficulty: q.difficulty || 'Medium',
        order_index: idx,
      }));

      const { error: qError } = await adminSupabase
        .from('quiz_questions')
        .insert(formattedQuestions);

      if (qError) {
        console.error('Failed to insert quiz questions:', qError);
      }
    }

    return NextResponse.json({ success: true, id: quizData.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
