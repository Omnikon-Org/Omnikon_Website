import { createClient, createAdminClient } from '@/lib/supabase/server';
import type { Profile } from './profiles';

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestionClient {
  id: string;
  quiz_id: string;
  question_text: string;
  options: QuizOption[];
  difficulty: string;
  order_index: number;
}

export interface QuizQuestionFull extends QuizQuestionClient {
  correct_option_id: string;
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  difficulty: string;
  estimated_duration_minutes: number;
  pass_percentage: number;
  status: 'draft' | 'review' | 'published' | 'archived';
  author_id: string | null;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  author?: Profile | null;
  question_count?: number;
}

export interface QuizWithQuestionsClient extends Quiz {
  questions: QuizQuestionClient[];
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  user_id: string;
  score: number;
  total_questions: number;
  percentage: number;
  passed: boolean;
  time_spent_seconds: number;
  completed_at: string;
  created_at: string;
  quiz?: Quiz | null;
  user?: Profile | null;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  developer_tier: string;
  total_score: number;
  quizzes_completed: number;
  quizzes_passed: number;
  avg_percentage: number;
}

/**
 * Fetch all published quizzes with their question counts
 */
export async function getPublishedQuizzes(category?: string): Promise<Quiz[]> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from('quizzes')
      .select(`
        *,
        author:profiles!quizzes_author_id_fkey(id, username, full_name, avatar_url, role),
        quiz_questions(count)
      `)
      .eq('status', 'published')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false });

    if (category && category !== 'ALL') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch published quizzes:', error.message);
      return [];
    }

    return (data || []).map((q: any) => ({
      ...q,
      question_count: q.quiz_questions?.[0]?.count || 0,
    })) as Quiz[];
  } catch (err) {
    console.error('Unexpected error fetching quizzes:', err);
    return [];
  }
}

/**
 * Fetch a quiz by slug with sanitized questions (NO correct_option_id or explanation)
 * Ensures zero client-side answer disclosure
 */
export async function getQuizBySlugForClient(slug: string): Promise<QuizWithQuestionsClient | null> {
  try {
    const supabase = await createClient();
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select(`
        *,
        author:profiles!quizzes_author_id_fkey(id, username, full_name, avatar_url, role)
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    if (quizError || !quiz) {
      if (quizError) console.error(`Failed to fetch quiz ${slug}:`, quizError.message);
      return null;
    }

    // Explicitly select only client-safe fields
    const { data: questions, error: qError } = await supabase
      .from('quiz_questions')
      .select('id, quiz_id, question_text, options, difficulty, order_index')
      .eq('quiz_id', quiz.id)
      .order('order_index', { ascending: true });

    if (qError) {
      console.error(`Failed to fetch questions for quiz ${slug}:`, qError.message);
      return null;
    }

    return {
      ...(quiz as Quiz),
      questions: (questions || []) as QuizQuestionClient[],
    };
  } catch (err) {
    console.error(`Unexpected error fetching quiz ${slug}:`, err);
    return null;
  }
}

/**
 * Server-only helper to fetch quiz with answers for grading
 */
export async function getQuizWithAnswers(quizId: string): Promise<{ quiz: Quiz; questions: QuizQuestionFull[] } | null> {
  try {
    const adminSupabase = createAdminClient();
    const { data: quiz, error: quizError } = await adminSupabase
      .from('quizzes')
      .select('*')
      .eq('id', quizId)
      .maybeSingle();

    if (quizError || !quiz) {
      return null;
    }

    const { data: questions, error: qError } = await adminSupabase
      .from('quiz_questions')
      .select('id, quiz_id, question_text, options, correct_option_id, explanation, difficulty, order_index')
      .eq('quiz_id', quizId)
      .order('order_index', { ascending: true });

    if (qError) {
      return null;
    }

    return {
      quiz: quiz as Quiz,
      questions: (questions || []) as QuizQuestionFull[],
    };
  } catch (err) {
    console.error('Error fetching quiz with answers:', err);
    return null;
  }
}

/**
 * Fetch authenticated user's quiz attempts
 */
export async function getUserQuizAttempts(userId: string): Promise<QuizAttempt[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select(`
        *,
        quiz:quizzes(id, title, slug, category, difficulty)
      `)
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch user quiz attempts:', error.message);
      return [];
    }

    return (data || []) as unknown as QuizAttempt[];
  } catch (err) {
    console.error('Unexpected error fetching user quiz attempts:', err);
    return [];
  }
}

/**
 * Fetch aggregated public leaderboard
 */
export async function getQuizLeaderboard(timeframe: 'weekly' | 'monthly' | 'all_time' = 'all_time'): Promise<LeaderboardEntry[]> {
  try {
    const adminSupabase = createAdminClient();
    let query = adminSupabase
      .from('quiz_attempts')
      .select(`
        score,
        total_questions,
        percentage,
        passed,
        completed_at,
        user:profiles!quiz_attempts_user_id_fkey(id, username, full_name, avatar_url, developer_tier, is_public)
      `);

    if (timeframe === 'weekly') {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      query = query.gte('completed_at', oneWeekAgo);
    } else if (timeframe === 'monthly') {
      const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      query = query.gte('completed_at', oneMonthAgo);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch quiz leaderboard:', error.message);
      return [];
    }

    // Group and aggregate by user_id
    const userMap: Record<string, {
      user_id: string;
      username: string;
      full_name: string;
      avatar_url: string | null;
      developer_tier: string;
      total_score: number;
      quizzes_completed: number;
      quizzes_passed: number;
      sum_percentage: number;
    }> = {};

    (data || []).forEach((row: any) => {
      const user = row.user;
      if (!user || user.is_public === false) return;

      if (!userMap[user.id]) {
        userMap[user.id] = {
          user_id: user.id,
          username: user.username,
          full_name: user.full_name,
          avatar_url: user.avatar_url,
          developer_tier: user.developer_tier,
          total_score: 0,
          quizzes_completed: 0,
          quizzes_passed: 0,
          sum_percentage: 0,
        };
      }

      userMap[user.id].total_score += row.score || 0;
      userMap[user.id].quizzes_completed += 1;
      if (row.passed) {
        userMap[user.id].quizzes_passed += 1;
      }
      userMap[user.id].sum_percentage += Number(row.percentage || 0);
    });

    const entries: LeaderboardEntry[] = Object.values(userMap)
      .map((item) => ({
        rank: 0,
        user_id: item.user_id,
        username: item.username,
        full_name: item.full_name,
        avatar_url: item.avatar_url,
        developer_tier: item.developer_tier,
        total_score: item.total_score,
        quizzes_completed: item.quizzes_completed,
        quizzes_passed: item.quizzes_passed,
        avg_percentage: item.quizzes_completed > 0 ? Math.round(item.sum_percentage / item.quizzes_completed) : 0,
      }))
      .sort((a, b) => b.total_score - a.total_score || b.avg_percentage - a.avg_percentage)
      .map((entry, idx) => ({ ...entry, rank: idx + 1 }));

    return entries;
  } catch (err) {
    console.error('Unexpected error aggregating leaderboard:', err);
    return [];
  }
}
