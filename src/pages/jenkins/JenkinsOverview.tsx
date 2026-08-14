import { Card, StatCard, StatusBadge, Badge, Button } from '@/components/ui';
import { SERVER_INFO, BUILDS, PIPELINES, AGENTS, PLUGINS } from '@/data/jenkinsData';
import {
  Workflow, Server, Cpu, Plug, ShieldCheck, GitBranch, Activity,
  Clock, Globe, Database, HardDrive, Zap, ExternalLink,
} from 'lucide-react';
import type { ModuleKey } from '@/types';

export default function JenkinsOverview({ onNavigate }: { onNavigate: (k: ModuleKey, tab?: string) => void }) {
  return (
    <div className="space-y-6">
      {/* Server status hero */}
      <Card className="overflow-hidden">
        <div className="grid gap-0 lg:grid-cols-3">
          <div className="border-b border-border p-6 lg:border-b-0 lg:border-r">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 shadow-lg">
                <Workflow size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Jenkins Controller</h2>
                <div className="mt-1 flex items-center gap-2">
                  <StatusBadge status="running" />
                  <span className="text-xs text-ink-400">{SERVER_INFO.version}</span>
                </div>
              </div>
            </div>
            <div className="mt-5 space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-ink-400"><Globe size={14} /> URL</span>
                <a href="#" className="flex items-center gap-1 text-primary-400 hover:text-primary-300">
                  {SERVER_INFO.url.replace('https://', '')}
                  <ExternalLink size={12} />
                </a>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-ink-400"><Zap size={14} /> Java</span>
                <span className="text-ink-200">{SERVER_INFO.javaVersion}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-ink-400"><Activity size={14} /> Uptime</span>
                <span className="text-ink-200">{SERVER_INFO.uptime}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-px bg-border lg:col-span-2">
            {[
              { label: 'Jobs', value: SERVER_INFO.jobsCount, icon: Workflow, sub: 'configured' },
              { label: 'Executors Online', value: SERVER_INFO.executorsOnline, icon: Cpu, sub: `${SERVER_INFO.executorsBusy} busy` },
              { label: 'Plugins', value: PLUGINS.length, icon: Plug, sub: `${PLUGINS.filter(p => p.hasUpdate).length} updates` },
              { label: 'Agents', value: AGENTS.length, icon: Server, sub: `${AGENTS.filter(a => a.status === 'online').length} online` },
            ].map((m) => (
              <div key={m.label} className="bg-panel/60 p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wider text-ink-400">{m.label}</p>
                  <m.icon size={16} className="text-ink-500" />
                </div>
                <p className="mt-2 text-2xl font-semibold text-white">{m.value}</p>
                <p className="text-xs text-ink-500">{m.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Current Build" value="frontend-react-app #188" sub="stage: Build" icon={<Workflow size={20} />} accent="primary" />
        <StatCard label="Last Build" value="success" sub="2m 18s · #187" icon={<Activity size={20} />} accent="success" />
        <StatCard label="Avg Build Time" value="2m 14s" sub="last 30 builds" icon={<Clock size={20} />} accent="accent" />
        <StatCard label="Success Rate" value="94%" sub="last 7 days" icon={<ShieldCheck size={20} />} accent="success" />
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: 'Pipelines', tab: 'pipelines', icon: Workflow },
          { label: 'Agents', tab: 'agents', icon: Server },
          { label: 'Webhooks', tab: 'webhooks', icon: GitBranch },
          { label: 'Plugins', tab: 'plugins', icon: Plug },
          { label: 'Credentials', tab: 'credentials', icon: ShieldCheck },
          { label: 'Artifacts', tab: 'artifacts', icon: Database },
        ].map((q) => (
          <button
            key={q.label}
            onClick={() => onNavigate('jenkins', q.tab)}
            className="flex flex-col items-center gap-2 rounded-xl border border-border bg-panel/60 p-4 transition-colors hover:border-primary-500/40 hover:bg-panel-light/60"
          >
            <q.icon size={20} className="text-primary-400" />
            <span className="text-xs font-medium text-ink-200">{q.label}</span>
          </button>
        ))}
      </div>

      {/* Build history + deployment status */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Build History</h3>
            <Button size="sm" variant="secondary" onClick={() => onNavigate('jenkins', 'pipelines')}>
              <Workflow size={14} /> View Pipelines
            </Button>
          </div>
          <div className="space-y-2">
            {BUILDS.slice(0, 6).map((b) => (
              <div key={b.id} className="flex items-center gap-3 rounded-lg border border-border bg-ink-900/40 p-3 text-sm">
                <StatusBadge status={b.status} />
                <span className="font-mono text-xs text-ink-500">#{b.number}</span>
                <span className="flex-1 truncate font-medium text-ink-100">{b.pipeline}</span>
                <span className="hidden text-xs text-ink-500 sm:block">{b.branch}</span>
                <span className="font-mono text-xs text-primary-400">{b.commit}</span>
                <span className="flex items-center gap-1 text-xs text-ink-400"><Clock size={12} />{b.duration}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 text-sm font-semibold text-white">Deployment Status</h3>
          <div className="space-y-3">
            {PIPELINES.filter((p) => p.enabled).map((p) => (
              <div key={p.id} className="rounded-lg border border-border bg-ink-900/40 p-3">
                <div className="flex items-center justify-between">
                  <span className="truncate text-sm font-medium text-ink-100">{p.name}</span>
                  <Badge variant="success">Deployed</Badge>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-ink-500">
                  <span>{p.repository.split('/').pop()}</span>
                  <span>{p.branch}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg border border-border bg-ink-900/40 p-3">
            <div className="flex items-center gap-2 text-xs text-ink-400">
              <HardDrive size={14} />
              Disk usage
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink-800">
              <div className="h-full rounded-full bg-success-500" style={{ width: '41%' }} />
            </div>
            <p className="mt-1 text-xs text-ink-500">41% of 100GB used</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
