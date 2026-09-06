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
  external_url?: string | null;
  badge_label?: string | null;
  stats_summary?: string | null;
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
 * Official curated quizzes including the Frontend Quiz Milestone and Omnikon AI/ML Quiz Challenge
 */
export const OFFICIAL_CURATED_QUIZZES: Quiz[] = [
  {
    id: 'quiz-ai-ml-challenge-2026',
    title: 'Omnikon AI/ML Challenge 2026: Foundations Quiz',
    slug: 'ai-ml-challenge-2026',
    description: 'Assess and validate your core machine learning mathematics, neural network architectures, PyTorch/TensorFlow paradigms, and LLM foundations on Unstop.',
    category: 'AI_&_ML',
    difficulty: 'Intermediate',
    estimated_duration_minutes: 20,
    pass_percentage: 70,
    status: 'published',
    author_id: null,
    is_featured: true,
    external_url: 'https://unstop.com/quiz/ai-ml-challenge-2026-foundations-quiz-omnikon-1729546',
    badge_label: 'UNSTOP_COMPETITION',
    stats_summary: 'National Machine Learning & Deep Learning Validation Challenge',
    created_at: new Date('2026-08-15T00:00:00Z').toISOString(),
    updated_at: new Date('2026-08-15T00:00:00Z').toISOString(),
    question_count: 20,
  },
  {
    id: 'quiz-frontend-quiz-arena',
    title: 'Frontend Quiz: Omnikon Quiz Arena',
    slug: 'frontend-quiz-arena',
    description: 'The flagship Omnikon Quiz Arena assessment covering HTML5, modern CSS layouts, JavaScript ES2024 mechanics, React component architecture, and web performance.',
    category: 'Frontend',
    difficulty: 'Intermediate',
    estimated_duration_minutes: 15,
    pass_percentage: 70,
    status: 'published',
    author_id: null,
    is_featured: true,
    external_url: 'https://unstop.com/o/1729546',
    badge_label: 'LEGACY_ARENA',
    stats_summary: '1600+ Registrations · 168.9K Impressions · 264 Reviews · 71.4% Engineering',
    created_at: new Date('2026-07-01T00:00:00Z').toISOString(),
    updated_at: new Date('2026-07-01T00:00:00Z').toISOString(),
    question_count: 25,
  },
];

/**
 * Fetch all published quizzes with their question counts
 * Only returns official Omnikon competitions hosted on Unstop
 */
export async function getPublishedQuizzes(category?: string): Promise<Quiz[]> {
  if (!category || category === 'ALL') {
    return OFFICIAL_CURATED_QUIZZES;
  }

  const catNorm = category.toLowerCase().replace(/[^a-z0-9]/g, '');
  return OFFICIAL_CURATED_QUIZZES.filter((curated) => {
    const curNorm = curated.category.toLowerCase().replace(/[^a-z0-9]/g, '');
    return curNorm.includes(catNorm) || catNorm.includes(curNorm);
  });
}

/**
 * Fetch a quiz by slug with sanitized questions (NO correct_option_id or explanation)
 * Ensures zero client-side answer disclosure
 */
export async function getQuizBySlugForClient(slug: string): Promise<QuizWithQuestionsClient | null> {
  // Check curated first if it matches
  const curatedMatch = OFFICIAL_CURATED_QUIZZES.find((q) => q.slug.toLowerCase() === slug.toLowerCase());
  if (curatedMatch) {
    return {
      ...curatedMatch,
      questions: [
        {
          id: `${curatedMatch.id}-q1`,
          quiz_id: curatedMatch.id,
          question_text: 'Which activation function is most commonly preferred in hidden layers of deep neural networks to mitigate vanishing gradients?',
          options: [
            { id: 'opt1', text: 'Sigmoid' },
            { id: 'opt2', text: 'ReLU (Rectified Linear Unit)' },
            { id: 'opt3', text: 'Tanh' },
            { id: 'opt4', text: 'Linear' },
          ],
          difficulty: 'Intermediate',
          order_index: 1,
        },
        {
          id: `${curatedMatch.id}-q2`,
          quiz_id: curatedMatch.id,
          question_text: 'In Transformer architectures, what is the computational complexity of standard multi-head self-attention with respect to sequence length N?',
          options: [
            { id: 'opt1', text: 'O(N)' },
            { id: 'opt2', text: 'O(N log N)' },
            { id: 'opt3', text: 'O(N^2)' },
            { id: 'opt4', text: 'O(1)' },
          ],
          difficulty: 'Advanced',
          order_index: 2,
        },
      ],
    };
  }

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
  const curatedMatch = OFFICIAL_CURATED_QUIZZES.find((q) => q.id === quizId);
  if (curatedMatch) {
    return {
      quiz: curatedMatch,
      questions: [
        {
          id: `${curatedMatch.id}-q1`,
          quiz_id: curatedMatch.id,
          question_text: 'Which activation function is most commonly preferred in hidden layers of deep neural networks to mitigate vanishing gradients?',
          options: [
            { id: 'opt1', text: 'Sigmoid' },
            { id: 'opt2', text: 'ReLU (Rectified Linear Unit)' },
            { id: 'opt3', text: 'Tanh' },
            { id: 'opt4', text: 'Linear' },
          ],
          correct_option_id: 'opt2',
          explanation: 'ReLU outputs 0 for negative values and the input directly for positive values, providing a derivative of 1 for positive values which prevents gradient saturation.',
          difficulty: 'Intermediate',
          order_index: 1,
        },
        {
          id: `${curatedMatch.id}-q2`,
          quiz_id: curatedMatch.id,
          question_text: 'In Transformer architectures, what is the computational complexity of standard multi-head self-attention with respect to sequence length N?',
          options: [
            { id: 'opt1', text: 'O(N)' },
            { id: 'opt2', text: 'O(N log N)' },
            { id: 'opt3', text: 'O(N^2)' },
            { id: 'opt4', text: 'O(1)' },
          ],
          correct_option_id: 'opt3',
          explanation: 'Every token computes an attention score with every other token in the sequence of length N, resulting in an N x N matrix multiplication yielding O(N^2) complexity.',
          difficulty: 'Advanced',
          order_index: 2,
        },
      ],
    };
  }

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
      console.error(`Failed to fetch user quiz attempts:`, error.message);
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
