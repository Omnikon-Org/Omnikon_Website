import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { TerminalHeader } from '@/components/terminal/TerminalHeader';
import { formatDate } from '@/lib/utils';
import { ShieldAlert } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminAuditLogsPage() {
  const supabase = await createClient();

  const { data: logs, error } = await supabase
    .from('audit_logs')
    .select(`
      id,
      action,
      entity_type,
      entity_id,
      actor_id,
      ip_hash,
      created_at,
      actor:profiles!audit_logs_actor_id_fkey(username, role)
    `)
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6 font-mono-terminal text-xs">
      <TerminalHeader
        title="AUDIT_LOGS"
        subtitle="Immutable administrative action records and system state audit feed."
      />

      {error ? (
        <div className="p-4 rounded border border-[#FF3131] bg-[#FF3131]/10 text-[#FF3131] flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>Failed to fetch audit logs: {error.message}</span>
        </div>
      ) : !logs || logs.length === 0 ? (
        <div className="p-8 rounded-xl border border-[#27272A] bg-[#0A0A0A] text-center text-[#A1A1AA]">
          NO_AUDIT_RECORDS_LOGGED IN SYSTEM.
        </div>
      ) : (
        <div className="rounded-xl border border-[#27272A] bg-[#0A0A0A] overflow-hidden">
          <table className="w-full text-left">
            <thead className="border-b border-[#27272A] bg-[#121212] text-[#A1A1AA]">
              <tr>
                <th className="p-3.5">ACTION</th>
                <th className="p-3.5">ENTITY TYPE</th>
                <th className="p-3.5">ENTITY ID</th>
                <th className="p-3.5">ACTOR</th>
                <th className="p-3.5">TIMESTAMP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272A]">
              {logs.map((log) => {
                const actorData = log.actor as unknown as { username?: string } | { username?: string }[] | null;
                const actorName = Array.isArray(actorData)
                  ? actorData[0]?.username
                  : actorData?.username || 'SYSTEM';

                return (
                  <tr key={log.id} className="hover:bg-[#121212]/50 transition-colors">
                    <td className="p-3.5 font-bold text-[#FF3131]">{log.action}</td>
                    <td className="p-3.5 text-white">{log.entity_type}</td>
                    <td className="p-3.5 text-[#A1A1AA] font-mono text-[11px]">{log.entity_id || 'N/A'}</td>
                    <td className="p-3.5 text-[#38BDF8]">{actorName}</td>
                    <td className="p-3.5 text-[#A1A1AA]">{formatDate(log.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
