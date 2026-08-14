import { Card, PageHeader, Badge, StatCard } from '@/components/ui';
import type { BuildRecord, JenkinsPipeline } from '@/types';
import {
  CheckCircle2, XCircle, Clock, TrendingUp, Activity, AlertTriangle, Target, Gauge,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Reports({ builds, pipelines }: { builds: BuildRecord[]; pipelines: JenkinsPipeline[] }) {
  const success = builds.filter((b) => b.status === 'success').length;
  const failed = builds.filter((b) => b.status === 'failed').length;
  const aborted = builds.filter((b) => b.status === 'aborted').length;
  const total = builds.length;
  const successRate = total > 0 ? Math.round((success / total) * 100) : 0;

  const parseDuration = (d: string): number => {
    const m = d.match(/(\d+)m\s*(\d+)s/);
    if (m) return parseInt(m[1]) * 60 + parseInt(m[2]);
    return 0;
  };
  const durations = builds.filter((b) => b.status === 'success').map((b) => parseDuration(b.duration));
  const avgSeconds = durations.length > 0 ? Math.round(durations.reduce((s, x) => s + x, 0) / durations.length) : 0;
  const avgStr = `${Math.floor(avgSeconds / 60)}m ${avgSeconds % 60}s`;

  const pipelineStats = pipelines.map((p) => ({
    name: p.name,
    total: p.totalBuilds,
    successRate: p.successRate,
    failedRate: 100 - p.successRate,
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="Pipeline Reports" description="Execution metrics, success rates, and performance analytics." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Builds" value={total} sub="last 24 hours" icon={<Activity size={20} />} />
        <StatCard label="Success Rate" value={`${successRate}%`} sub={`${success} of ${total} builds`} icon={<Target size={20} />} accent="success" />
        <StatCard label="Failed Builds" value={failed} sub="needs investigation" icon={<XCircle size={20} />} accent="error" />
        <StatCard label="Avg Build Time" value={avgStr} sub="successful builds" icon={<Clock size={20} />} accent="accent" />
      </div>

      {/* Success rate donut-ish */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-5">
          <h3 className="mb-4 text-sm font-semibold text-white">Build Outcomes</h3>
          <div className="space-y-3">
            {[
              { label: 'Success', count: success, color: 'bg-success-500', pct: Math.round((success / total) * 100) },
              { label: 'Failed', count: failed, color: 'bg-error-500', pct: Math.round((failed / total) * 100) },
              { label: 'Aborted', count: aborted, color: 'bg-ink-500', pct: Math.round((aborted / total) * 100) },
            ].map((r) => (
              <div key={r.label}>
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2 text-ink-300">
                    <span className={cn('h-2.5 w-2.5 rounded-full', r.color)} />
                    {r.label}
                  </span>
                  <span className="font-medium text-ink-200">{r.count} ({r.pct}%)</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ink-800">
                  <div className={cn('h-full rounded-full', r.color)} style={{ width: `${r.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold text-white">Per-Pipeline Success Rate</h3>
          <div className="space-y-3">
            {pipelineStats.map((p) => (
              <div key={p.name}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-300">{p.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-ink-500">{p.total} builds</span>
                    <span className="font-medium text-success-400">{p.successRate}%</span>
                  </div>
                </div>
                <div className="mt-1.5 flex h-2 overflow-hidden rounded-full bg-ink-800">
                  <div className="h-full bg-success-500" style={{ width: `${p.successRate}%` }} />
                  <div className="h-full bg-error-500" style={{ width: `${p.failedRate}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Execution time chart (simple bars) */}
      <Card className="p-5">
        <h3 className="mb-4 text-sm font-semibold text-white">Build Duration Trend</h3>
        <div className="flex items-end justify-between gap-2" style={{ height: 160 }}>
          {builds.slice(0, 8).reverse().map((b) => {
            const secs = parseDuration(b.duration);
            const maxSec = Math.max(...builds.map((x) => parseDuration(x.duration)), 1);
            const h = Math.max(8, (secs / maxSec) * 130);
            return (
              <div key={b.id} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="text-[10px] text-ink-500">{b.duration}</span>
                <div
                  className={cn(
                    'w-full rounded-t transition-all',
                    b.status === 'success' ? 'bg-success-500/70' : b.status === 'failed' ? 'bg-error-500/70' : 'bg-ink-600',
                  )}
                  style={{ height: `${h}px` }}
                />
                <span className="font-mono text-[10px] text-ink-500">#{b.number}</span>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="mb-4 text-sm font-semibold text-white">Summary</h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <SummaryItem icon={<TrendingUp size={16} />} label="Trend" value="Improving" variant="success" />
          <SummaryItem icon={<Gauge size={16} />} label="Reliability" value="High" variant="success" />
          <SummaryItem icon={<AlertTriangle size={16} />} label="Risk Pipelines" value={pipelines.filter((p) => p.successRate < 90).length.toString()} variant="warning" />
          <SummaryItem icon={<CheckCircle2 size={16} />} label="Healthy Pipelines" value={pipelines.filter((p) => p.successRate >= 90).length.toString()} variant="success" />
        </div>
      </Card>
    </div>
  );
}

function SummaryItem({ icon, label, value, variant }: { icon: React.ReactNode; label: string; value: string; variant: 'success' | 'warning' | 'error' }) {
  return (
    <div className="rounded-lg border border-border bg-ink-900/40 p-4">
      <div className="flex items-center gap-2 text-ink-400">{icon}<span className="text-xs">{label}</span></div>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
      <Badge variant={variant} className="mt-1">●</Badge>
    </div>
  );
}
