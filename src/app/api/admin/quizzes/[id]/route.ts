import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
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

    if (!profile || (profile.role !== 'admin' && profile.role !== 'editor')) {
      return NextResponse.json({ error: 'Forbidden: Insufficient role' }, { status: 403 });
    }

    const body = await req.json();
    const { questions = [], ...quizFields } = body;

    const adminSupabase = createAdminClient();

    // 1. Update Quiz
    const { error: quizError } = await adminSupabase
      .from('quizzes')
      .update({
        title: quizFields.title,
        slug: quizFields.slug,
        description: quizFields.description,
        category: quizFields.category,
        difficulty: quizFields.difficulty,
        estimated_duration_minutes: quizFields.estimated_duration_minutes,
        pass_percentage: quizFields.pass_percentage,
        status: quizFields.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (quizError) {
      return NextResponse.json({ error: quizError.message }, { status: 400 });
    }

    // 2. Replace Questions (Delete old and insert new)
    await adminSupabase.from('quiz_questions').delete().eq('quiz_id', id);

    if (questions.length > 0) {
      const formattedQuestions = questions.map((q: any, idx: number) => ({
        quiz_id: id,
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
        console.error('Failed to update questions:', qError);
      }
    }

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
