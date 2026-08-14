import { useState } from 'react';
import { Card, PageHeader, Badge, Button } from '@/components/ui';
import { TROUBLESHEET_ISSUES } from '@/data/jenkinsData';
import {
  AlertTriangle, AlertCircle, Info, ChevronDown, ChevronUp, Terminal, Wrench, CheckCircle2, Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TroubleshootIssue } from '@/types';

const severityConfig = {
  critical: { icon: AlertCircle, color: 'text-error-400', bg: 'bg-error-500/10 border-error-500/30', label: 'Critical' },
  warning: { icon: AlertTriangle, color: 'text-warning-400', bg: 'bg-warning-500/10 border-warning-500/30', label: 'Warning' },
  info: { icon: Info, color: 'text-primary-400', bg: 'bg-primary-500/10 border-primary-500/30', label: 'Info' },
};

export function Troubleshooting() {
  const [expanded, setExpanded] = useState<string | null>(TROUBLESHEET_ISSUES.find((t) => t.detected)?.id || null);
  const [filter, setFilter] = useState<'all' | 'detected'>('detected');

  const issues = filter === 'all' ? TROUBLESHEET_ISSUES : TROUBLESHEET_ISSUES.filter((t) => t.detected);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Troubleshooting"
        description="Detected issues and suggested fixes for common Jenkins errors."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('detected')}
              className={cn('rounded-lg px-3 py-2 text-xs font-medium', filter === 'detected' ? 'bg-primary-600 text-white' : 'bg-ink-800 text-ink-400')}
            >
              Detected ({TROUBLESHEET_ISSUES.filter((t) => t.detected).length})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={cn('rounded-lg px-3 py-2 text-xs font-medium', filter === 'all' ? 'bg-primary-600 text-white' : 'bg-ink-800 text-ink-400')}
            >
              All Issues ({TROUBLESHEET_ISSUES.length})
            </button>
          </div>
        }
      />

      <Card className="border-error-500/20 bg-error-500/5 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-error-400" />
          <div className="text-sm">
            <p className="font-medium text-ink-100">3 issues detected on your Jenkins server</p>
            <p className="mt-1 text-xs text-ink-400">Review the suggested fixes below. Issues marked "detected" are currently affecting your environment.</p>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        {issues.map((issue) => (
          <IssueCard key={issue.id} issue={issue} expanded={expanded === issue.id} onToggle={() => setExpanded(expanded === issue.id ? null : issue.id)} />
        ))}
      </div>
    </div>
  );
}

function IssueCard({ issue, expanded, onToggle }: { issue: TroubleshootIssue; expanded: boolean; onToggle: () => void }) {
  const cfg = severityConfig[issue.severity];
  const Icon = cfg.icon;

  return (
    <Card className={cn('overflow-hidden', issue.detected && issue.severity === 'critical' && 'border-l-2 border-l-error-500')}>
      <button onClick={onToggle} className="flex w-full items-center gap-4 p-5 text-left">
        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border', cfg.bg)}>
          <Icon size={18} className={cfg.color} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-white">{issue.title}</h3>
            {issue.detected ? <Badge variant="error">Detected</Badge> : <Badge variant="neutral">Potential</Badge>}
            <Badge variant={issue.severity === 'critical' ? 'error' : issue.severity === 'warning' ? 'warning' : 'info'}>{cfg.label}</Badge>
          </div>
          <p className="mt-0.5 truncate text-xs text-ink-400">{issue.category} · {issue.symptom}</p>
        </div>
        {expanded ? <ChevronUp size={18} className="shrink-0 text-ink-400" /> : <ChevronDown size={18} className="shrink-0 text-ink-400" />}
      </button>

      {expanded && (
        <div className="border-t border-border px-5 py-4 slide-in">
          {issue.logSnippet && (
            <div className="mb-4">
              <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-ink-300"><Terminal size={13} /> Log Snippet</p>
              <pre className="overflow-x-auto rounded-lg bg-ink-950/80 p-3 font-mono text-xs text-error-300">{issue.logSnippet}</pre>
            </div>
          )}

          <div className="mb-4">
            <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-ink-300"><Info size={13} /> Root Cause</p>
            <p className="text-sm text-ink-400">{issue.cause}</p>
          </div>

          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-ink-300"><Wrench size={13} /> Suggested Fixes</p>
            <div className="space-y-2">
              {issue.fixes.map((fix, i) => (
                <div key={i} className="flex items-start gap-2.5 rounded-lg border border-border bg-ink-900/40 p-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success-500/10 text-[10px] font-semibold text-success-400">{i + 1}</span>
                  <code className="flex-1 font-mono text-xs text-ink-300">{fix}</code>
                </div>
              ))}
            </div>
          </div>

          {issue.detected && (
            <div className="mt-4 flex items-center gap-2">
              <Button size="sm" variant="success"><CheckCircle2 size={14} /> Mark as Resolved</Button>
              <Button size="sm" variant="secondary"><Search size={14} /> Run Diagnostics</Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
