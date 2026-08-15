import { Card, StatCard, StatusBadge, PageHeader, Button, Badge } from '@/components/ui';
import { SERVER_INFO, BUILDS, PIPELINES, AGENTS, DEPLOYMENTS } from '@/data/jenkinsData';
import {
  Workflow,
  CheckCircle2,
  XCircle,
  Server,
  GitBranch,
  Cloud,
  Activity,
  ArrowUpRight,
  Clock,
  Cpu,
  Rocket,
} from 'lucide-react';
import type { ModuleKey } from '@/types';

export default function Dashboard({ onNavigate }: { onNavigate: (k: ModuleKey) => void }) {
  const successBuilds = BUILDS.filter((b) => b.status === 'success').length;
  const failedBuilds = BUILDS.filter((b) => b.status === 'failed').length;
  const onlineAgents = AGENTS.filter((a) => a.status === 'online').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Overview"
        description="Real-time health of your DevOps delivery pipeline across all modules."
        actions={
          <Button onClick={() => onNavigate('jenkins')}>
            <Workflow size={16} />
            Open Jenkins
          </Button>
        }
      />

      {/* Stat row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Active Pipelines" value={PIPELINES.filter((p) => p.enabled).length} sub={`${PIPELINES.length} total configured`} icon={<Workflow size={20} />} accent="primary" />
        <StatCard label="Successful Builds" value={successBuilds} sub="last 24 hours" icon={<CheckCircle2 size={20} />} accent="success" />
        <StatCard label="Failed Builds" value={failedBuilds} sub="requires attention" icon={<XCircle size={20} />} accent="error" />
        <StatCard label="Online Agents" value={`${onlineAgents}/${AGENTS.length}`} sub="Jenkins build fleet" icon={<Cpu size={20} />} accent="accent" />
      </div>

      {/* Module cards */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-ink-400">Modules</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { key: 'aws' as ModuleKey, label: 'AWS', desc: 'EC2 instances & VPC', icon: Cloud, status: 'Connected', accent: 'text-warning-400 bg-warning-500/10' },
            { key: 'linux' as ModuleKey, label: 'Linux', desc: '3 servers managed', icon: Server, status: 'Active', accent: 'text-success-400 bg-success-500/10' },
            { key: 'github' as ModuleKey, label: 'GitHub', desc: '4 repos connected', icon: GitBranch, status: 'Connected', accent: 'text-primary-400 bg-primary-500/10' },
            { key: 'jenkins' as ModuleKey, label: 'Jenkins', desc: `${SERVER_INFO.version}`, icon: Workflow, status: 'Running', accent: 'text-accent-400 bg-accent-500/10' },
                        { key: 'monitoring' as ModuleKey, label: 'Monitoring', desc: 'Module coming soon', icon: Activity, status: 'Planned', accent: 'text-ink-400 bg-ink-800/60' },
          ].map((m) => (
            <Card key={m.key} onClick={() => onNavigate(m.key)} className="p-4">
              <div className="flex items-start justify-between">
                <div className={`rounded-lg p-2.5 ${m.accent}`}>
                  <m.icon size={20} />
                </div>
                <ArrowUpRight size={16} className="text-ink-600" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-white">{m.label}</h3>
              <p className="text-xs text-ink-400">{m.desc}</p>
              <div className="mt-3">
                <Badge variant={m.status === 'Planned' ? 'neutral' : m.status === 'Running' ? 'running' : 'success'}>
                  {m.status}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent builds + deployments */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Recent Builds</h3>
            <button onClick={() => onNavigate('jenkins')} className="text-xs text-primary-400 hover:text-primary-300">
              View all
            </button>
          </div>
          <div className="space-y-3">
            {BUILDS.slice(0, 5).map((b) => (
              <div key={b.id} className="flex items-center gap-3 rounded-lg border border-border bg-ink-900/40 p-3">
                <StatusBadge status={b.status} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-100">#{b.number} {b.pipeline}</p>
                  <p className="truncate text-xs text-ink-500">{b.commit} · {b.author} · {b.timestamp}</p>
                </div>
                <span className="flex items-center gap-1 text-xs text-ink-400">
                  <Clock size={12} />
                  {b.duration}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Recent Deployments</h3>
            <button onClick={() => onNavigate('jenkins')} className="text-xs text-primary-400 hover:text-primary-300">
              View all
            </button>
          </div>
          <div className="space-y-3">
            {DEPLOYMENTS.map((d) => (
              <div key={d.id} className="flex items-center gap-3 rounded-lg border border-border bg-ink-900/40 p-3">
                <StatusBadge status={d.status} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-100">{d.pipeline} v{d.version}</p>
                  <p className="truncate text-xs text-ink-500">{d.environment} · {d.ec2Instance}</p>
                </div>
                <span className="text-xs text-ink-400">{d.deployedAt.split(' ')[1]}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Server health */}
      <Card className="p-5">
        <h3 className="mb-4 text-sm font-semibold text-white">Jenkins Server Health</h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: 'Disk Usage', value: SERVER_INFO.diskUsage, pct: 41, color: 'bg-success-500' },
            { label: 'Heap Usage', value: SERVER_INFO.heapUsage, pct: 38, color: 'bg-success-500' },
            { label: 'Executors Busy', value: `${SERVER_INFO.executorsBusy}/${SERVER_INFO.executorsOnline}`, pct: 33, color: 'bg-warning-500' },
            { label: 'Uptime', value: SERVER_INFO.uptime, pct: 100, color: 'bg-primary-500' },
          ].map((m) => (
            <div key={m.label}>
              <div className="flex justify-between text-xs">
                <span className="text-ink-400">{m.label}</span>
                <span className="font-medium text-ink-200">{m.value}</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink-800">
                <div className={`h-full rounded-full ${m.color}`} style={{ width: `${m.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
