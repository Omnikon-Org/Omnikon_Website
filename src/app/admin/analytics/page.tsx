import React from 'react';
import { createAdminClient } from '@/lib/supabase/server';
import { TerminalHeader } from '@/components/terminal/TerminalHeader';
import { GlowCard } from '@/components/content/GlowCard';
import { formatDate } from '@/lib/utils';
import { 
  BarChart3, 
  Activity, 
  Eye, 
  Github, 
  GitPullRequest, 
  Calendar, 
  Search, 
  UserPlus, 
  ShieldCheck,
  Zap,
  Award
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminAnalyticsDashboardPage() {
  const adminClient = createAdminClient();

  // Fetch aggregated logs and statistics
  const [
    { count: totalLogsCount },
    { data: recentLogs },
    { count: totalRegistrationsCount },
    { count: totalContributionsCount },
    { count: totalQuizAttemptsCount },
    { data: quizAttemptsData },
  ] = await Promise.all([
    adminClient.from('view_logs').select('id', { count: 'exact', head: true }),
    adminClient.from('view_logs').select('*').order('created_at', { ascending: false }).limit(30),
    adminClient.from('event_registrations').select('id', { count: 'exact', head: true }),
    adminClient.from('contributions').select('id', { count: 'exact', head: true }),
    adminClient.from('quiz_attempts').select('id', { count: 'exact', head: true }),
    adminClient.from('quiz_attempts').select('percentage, passed').limit(100),
  ]);

  // Aggregate event metrics from recent sample
  const logs = recentLogs || [];
  const projectViews = logs.filter((l) => l.entity_type === 'project_view').length;
  const githubClicks = logs.filter((l) => l.entity_type === 'project_github_click').length;
  const issueClicks = logs.filter((l) => l.entity_type === 'issue_click' || l.entity_type === 'contribution_cta_click').length;
  const articleViews = logs.filter((l) => l.entity_type === 'article_view').length;
  const eventViews = logs.filter((l) => l.entity_type === 'event_view' || l.entity_type === 'hackathon_view').length;
  const quizViews = logs.filter((l) => l.entity_type === 'quiz_view' || l.entity_type === 'quiz_started' || l.entity_type === 'quiz_completed').length;
  const calendarViews = logs.filter((l) => l.entity_type === 'calendar_view').length;
  const searchEvents = logs.filter((l) => l.entity_type === 'search_performed' || l.entity_type === 'search_result_clicked').length;
  const signups = logs.filter((l) => l.entity_type === 'signup').length;

  const passedAttempts = (quizAttemptsData || []).filter((q) => q.passed).length;
  const avgQuizScore = quizAttemptsData && quizAttemptsData.length > 0
    ? Math.round(quizAttemptsData.reduce((acc, q) => acc + Number(q.percentage), 0) / quizAttemptsData.length)
    : 0;

  return (
    <div className="space-y-8 font-mono-terminal text-xs">
      <TerminalHeader
        title="SYSTEM_ANALYTICS"
        subtitle="Aggregated ecosystem telemetry, developer interaction metrics, and privacy-conscious logs."
      />

      {/* Real Aggregate Telemetry Counters */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-5 rounded-xl border border-[#27272A] bg-[#0A0A0A] space-y-1">
          <div className="flex items-center justify-between text-[#38BDF8]">
            <span className="text-[11px] uppercase">TOTAL_INTERACTIONS</span>
            <Eye className="h-4 w-4" />
          </div>
          <div className="text-3xl font-extrabold text-white">{totalLogsCount || 0}</div>
          <span className="text-[#A1A1AA]">Recorded Events</span>
        </div>

        <div className="p-5 rounded-xl border border-[#27272A] bg-[#0A0A0A] space-y-1">
          <div className="flex items-center justify-between text-[#22C55E]">
            <span className="text-[11px] uppercase">REGISTRATIONS</span>
            <Calendar className="h-4 w-4" />
          </div>
          <div className="text-3xl font-extrabold text-white">{totalRegistrationsCount || 0}</div>
          <span className="text-[#A1A1AA]">Confirmed Hackathons</span>
        </div>

        <div className="p-5 rounded-xl border border-[#27272A] bg-[#0A0A0A] space-y-1">
          <div className="flex items-center justify-between text-[#FF3131]">
            <span className="text-[11px] uppercase">QUIZ_ATTEMPTS</span>
            <Zap className="h-4 w-4" />
          </div>
          <div className="text-3xl font-extrabold text-white">{totalQuizAttemptsCount || 0}</div>
          <span className="text-[#A1A1AA]">Avg Score: {avgQuizScore}%</span>
        </div>

        <div className="p-5 rounded-xl border border-[#27272A] bg-[#0A0A0A] space-y-1">
          <div className="flex items-center justify-between text-[#EAB308]">
            <span className="text-[11px] uppercase">CONTRIBUTIONS</span>
            <GitPullRequest className="h-4 w-4" />
          </div>
          <div className="text-3xl font-extrabold text-white">{totalContributionsCount || 0}</div>
          <span className="text-[#A1A1AA]">Logged Milestones</span>
        </div>

        <div className="p-5 rounded-xl border border-[#27272A] bg-[#0A0A0A] space-y-1">
          <div className="flex items-center justify-between text-[#22C55E]">
            <span className="text-[11px] uppercase">PRIVACY_COMPLIANCE</span>
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="text-xl font-bold text-[#22C55E]">SHA-256</div>
          <span className="text-[#A1A1AA]">Zero Raw PII Stored</span>
        </div>
      </div>

      {/* Event Type Telemetry Breakdown */}
      <GlowCard accentColor="cyan" className="space-y-4">
        <h3 className="font-bold text-white uppercase text-sm flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-[#38BDF8]" /> Recent Event Distribution (Last {logs.length} telemetry records)
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 pt-2">
          <div className="p-3 rounded bg-[#050505] border border-[#27272A] space-y-1">
            <span className="text-[10px] text-[#A1A1AA] uppercase flex items-center gap-1">
              <Eye className="h-3 w-3 text-[#38BDF8]" /> Project Views
            </span>
            <div className="text-lg font-bold text-white">{projectViews}</div>
          </div>

          <div className="p-3 rounded bg-[#050505] border border-[#27272A] space-y-1">
            <span className="text-[10px] text-[#A1A1AA] uppercase flex items-center gap-1">
              <Github className="h-3 w-3 text-[#38BDF8]" /> GitHub Clicks
            </span>
            <div className="text-lg font-bold text-white">{githubClicks}</div>
          </div>

          <div className="p-3 rounded bg-[#050505] border border-[#27272A] space-y-1">
            <span className="text-[10px] text-[#A1A1AA] uppercase flex items-center gap-1">
              <GitPullRequest className="h-3 w-3 text-[#22C55E]" /> Issue Clicks
            </span>
            <div className="text-lg font-bold text-white">{issueClicks}</div>
          </div>

          <div className="p-3 rounded bg-[#050505] border border-[#27272A] space-y-1">
            <span className="text-[10px] text-[#A1A1AA] uppercase flex items-center gap-1">
              <Activity className="h-3 w-3 text-[#FF3131]" /> Article Views
            </span>
            <div className="text-lg font-bold text-white">{articleViews}</div>
          </div>

          <div className="p-3 rounded bg-[#050505] border border-[#27272A] space-y-1">
            <span className="text-[10px] text-[#A1A1AA] uppercase flex items-center gap-1">
              <Calendar className="h-3 w-3 text-[#EAB308]" /> Events
            </span>
            <div className="text-lg font-bold text-white">{eventViews}</div>
          </div>

          <div className="p-3 rounded bg-[#050505] border border-[#27272A] space-y-1">
            <span className="text-[10px] text-[#A1A1AA] uppercase flex items-center gap-1">
              <Zap className="h-3 w-3 text-[#FF3131]" /> Quizzes
            </span>
            <div className="text-lg font-bold text-white">{quizViews}</div>
          </div>

          <div className="p-3 rounded bg-[#050505] border border-[#27272A] space-y-1">
            <span className="text-[10px] text-[#A1A1AA] uppercase flex items-center gap-1">
              <Search className="h-3 w-3 text-[#38BDF8]" /> Searches
            </span>
            <div className="text-lg font-bold text-white">{searchEvents}</div>
          </div>

          <div className="p-3 rounded bg-[#050505] border border-[#27272A] space-y-1">
            <span className="text-[10px] text-[#A1A1AA] uppercase flex items-center gap-1">
              <UserPlus className="h-3 w-3 text-[#22C55E]" /> Signups
            </span>
            <div className="text-lg font-bold text-white">{signups}</div>
          </div>
        </div>
      </GlowCard>

      {/* Raw Immutable Log Stream */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
          <h3 className="font-bold text-white uppercase text-sm flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#FF3131]" /> Telemetry Event Stream (`view_logs`)
          </h3>
          <span className="text-[#A1A1AA]">Latest {logs.length} records</span>
        </div>

        {logs.length === 0 ? (
          <div className="p-8 rounded-xl border border-[#27272A] bg-[#0A0A0A] text-center text-[#A1A1AA]">
            NO_ANALYTICS_LOGS_RECORDED_YET
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#27272A] bg-[#0A0A0A]">
            <table className="w-full text-left font-mono-terminal text-xs">
              <thead className="border-b border-[#27272A] bg-[#121212] text-[#A1A1AA] uppercase text-[10px]">
                <tr>
                  <th className="p-3">EVENT_TYPE</th>
                  <th className="p-3">ENTITY_UUID</th>
                  <th className="p-3">ANONYMIZED_IP_HASH</th>
                  <th className="p-3">RECORDED_AT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272A]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#121212] transition-colors">
                    <td className="p-3 font-bold text-white uppercase">{log.entity_type}</td>
                    <td className="p-3 text-[#38BDF8]">{log.entity_id}</td>
                    <td className="p-3 text-[#A1A1AA] truncate max-w-[200px]">{log.ip_hash}</td>
                    <td className="p-3 text-[#A1A1AA] whitespace-nowrap">{formatDate(log.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
