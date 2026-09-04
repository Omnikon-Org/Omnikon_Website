import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { getQuizWithAnswers } from '@/lib/data/quizzes';

export const dynamic = 'force-dynamic';

interface AnswerSubmission {
  questionId: string;
  selectedOptionId: string;
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to submit quiz attempts.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { quizId, answers, timeSpentSeconds = 0 } = body as {
      quizId?: string;
      answers?: AnswerSubmission[];
      timeSpentSeconds?: number;
    };

    if (!quizId || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: 'Invalid payload: quizId and answers array are required.' },
        { status: 400 }
      );
    }

    // Fetch quiz with correct answers server-side
    const quizData = await getQuizWithAnswers(quizId);
    if (!quizData || quizData.quiz.status !== 'published') {
      return NextResponse.json(
        { error: 'Quiz not found or not published.' },
        { status: 404 }
      );
    }

    const { quiz, questions } = quizData;
    const totalQuestions = questions.length;

    if (totalQuestions === 0) {
      return NextResponse.json(
        { error: 'Quiz has no registered questions.' },
        { status: 400 }
      );
    }

    // Map user answers
    const userAnswersMap = new Map<string, string>();
    answers.forEach((ans) => {
      userAnswersMap.set(ans.questionId, ans.selectedOptionId);
    });

    let score = 0;
    const breakdown = questions.map((q) => {
      const selectedOptionId = userAnswersMap.get(q.id) || '';
      const isCorrect = selectedOptionId === q.correct_option_id;

      if (isCorrect) {
        score++;
      }

      return {
        questionId: q.id,
        selectedOptionId,
        correctOptionId: q.correct_option_id,
        isCorrect,
        explanation: q.explanation,
      };
    });

    const percentage = Number(((score / totalQuestions) * 100).toFixed(2));
    const passed = percentage >= quiz.pass_percentage;

    const adminSupabase = createAdminClient();

    // 1. Insert Quiz Attempt
    const { data: attemptRow, error: attemptError } = await adminSupabase
      .from('quiz_attempts')
      .insert({
        quiz_id: quiz.id,
        user_id: user.id,
        score,
        total_questions: totalQuestions,
        percentage,
        passed,
        time_spent_seconds: Math.max(0, Math.floor(timeSpentSeconds)),
        completed_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (attemptError || !attemptRow) {
      console.error('Failed to insert quiz attempt:', attemptError);
      return NextResponse.json(
        { error: 'Failed to record quiz attempt.' },
        { status: 500 }
      );
    }

    // 2. Insert Quiz Answers
    const answersToInsert = breakdown.map((b) => ({
      attempt_id: attemptRow.id,
      question_id: b.questionId,
      selected_option_id: b.selectedOptionId,
      is_correct: b.isCorrect,
    }));

    const { error: answersError } = await adminSupabase
      .from('quiz_answers')
      .insert(answersToInsert);

    if (answersError) {
      console.warn('Failed to insert individual quiz answers:', answersError);
    }

    // 3. Log Milestone Contribution if Passed
    if (passed) {
      await adminSupabase.from('contributions').insert({
        user_id: user.id,
        type: 'quiz_passed',
        title: `Passed ${quiz.title} (${percentage}%)`,
        description: `Achieved score ${score}/${totalQuestions} in ${quiz.category} technical challenge.`,
        metadata: {
          quiz_id: quiz.id,
          attempt_id: attemptRow.id,
          score,
          totalQuestions,
          percentage,
        },
        is_public: true,
      });
    }

    return NextResponse.json({
      success: true,
      score,
      totalQuestions,
      percentage,
      passed,
      passPercentage: quiz.pass_percentage,
      timeSpentSeconds,
      breakdown,
    });
  } catch (err: any) {
    console.error('Quiz submission error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred during quiz evaluation.' },
      { status: 500 }
    );
  }
}
