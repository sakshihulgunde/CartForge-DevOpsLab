import { Card, StatCard, StatusBadge, Badge, Button } from '@/components/ui';
import { SERVER_INFO, BUILDS, PIPELINES, AGENTS, PLUGINS } from '@/data/jenkinsData';
import {
  Workflow,
  Server,
  Cpu,
  Plug,
  ShieldCheck,
  GitBranch,
  Activity,
  Clock,
  Globe,
  Database,
  HardDrive,
  Zap,
  ExternalLink,
} from 'lucide-react';
import type { ModuleKey } from '@/types';

export default function JenkinsOverview({
  onNavigate,
}: {
  onNavigate: (k: ModuleKey, tab?: string) => void;
}) {
  const successfulBuilds = BUILDS.filter((b) => b.status === 'success').length;
  const successRate =
    BUILDS.length > 0
      ? Math.round((successfulBuilds / BUILDS.length) * 100)
      : 0;

  const lastBuild = BUILDS[0];

  const averageSeconds =
    BUILDS.length > 0
      ? Math.round(
          BUILDS.reduce((total, build) => {
            const match = build.duration.match(/(\d+)m\s*(\d+)s/);

            if (!match) return total;

            return total + Number(match[1]) * 60 + Number(match[2]);
          }, 0) / BUILDS.length,
        )
      : 0;

  const averageMinutes = Math.floor(averageSeconds / 60);
  const averageRemainingSeconds = averageSeconds % 60;

  return (
    <div className="space-y-6">

      {/* Jenkins Controller */}
      <Card className="overflow-hidden">
        <div className="grid gap-0 lg:grid-cols-3">

          <div className="border-b border-slate-200 p-6 lg:border-b-0 lg:border-r">
            <div className="flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 shadow-sm">
                <Workflow size={24} className="text-white" />
              </div>

              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Jenkins Controller
                </h2>

                <div className="mt-1 flex items-center gap-2">
                  <StatusBadge status="running" />

                  <span className="text-xs text-slate-500">
                    {SERVER_INFO.version}
                  </span>
                </div>
              </div>

            </div>

            <div className="mt-5 space-y-3 text-sm">

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-500">
                  <Globe size={14} />
                  URL
                </span>

                <a
                  href="#"
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                >
                  Jenkins Local
                  <ExternalLink size={12} />
                </a>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-500">
                  <Zap size={14} />
                  Java
                </span>

                <span className="text-slate-700">
                  {SERVER_INFO.javaVersion}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-500">
                  <Activity size={14} />
                  Status
                </span>

                <span className="font-medium text-emerald-600">
                  Running
                </span>
              </div>

            </div>
          </div>

          {/* Controller statistics */}
          <div className="grid grid-cols-2 gap-px bg-slate-200 lg:col-span-2">

            {[
              {
                label: 'Jobs',
                value: SERVER_INFO.jobsCount,
                icon: Workflow,
                sub: 'configured',
              },
              {
                label: 'Executors Online',
                value: SERVER_INFO.executorsOnline,
                icon: Cpu,
                sub: `${SERVER_INFO.executorsBusy} busy`,
              },
              {
                label: 'Plugins',
                value: PLUGINS.length,
                icon: Plug,
                sub: `${PLUGINS.filter((p) => p.hasUpdate).length} updates`,
              },
              {
                label: 'Agents',
                value: AGENTS.length,
                icon: Server,
                sub: `${AGENTS.filter((a) => a.status === 'online').length} online`,
              },
            ].map((m) => (
              <div
                key={m.label}
                className="bg-white p-5"
              >
                <div className="flex items-center justify-between">

                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                    {m.label}
                  </p>

                  <m.icon size={16} className="text-slate-400" />

                </div>

                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {m.value}
                </p>

                <p className="text-xs text-slate-500">
                  {m.sub}
                </p>
              </div>
            ))}

          </div>
        </div>
      </Card>

      {/* Quick statistics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

        <StatCard
          label="Current Build"
          value={`Cartforge-Freestyle #${lastBuild?.number ?? 3}`}
          sub="stage: Build & Deploy"
          icon={<Workflow size={20} />}
          accent="primary"
        />

        <StatCard
          label="Last Build"
          value={lastBuild?.status === 'success' ? 'Success' : 'Failed'}
          sub={`${lastBuild?.duration ?? '1m 24s'} · #${lastBuild?.number ?? 3}`}
          icon={<Activity size={20} />}
          accent="success"
        />

        <StatCard
          label="Avg Build Time"
          value={`${averageMinutes}m ${averageRemainingSeconds}s`}
          sub="last 3 builds"
          icon={<Clock size={20} />}
          accent="accent"
        />

        <StatCard
          label="Success Rate"
          value={`${successRate}%`}
          sub="CartForge builds"
          icon={<ShieldCheck size={20} />}
          accent="success"
        />

      </div>

      {/* Quick navigation */}
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
            className="
              flex flex-col items-center gap-2
              rounded-xl border border-slate-200
              bg-white p-4
              shadow-sm
              transition-all duration-200
              hover:border-blue-300
              hover:shadow-md
            "
          >
            <q.icon size={20} className="text-blue-600" />

            <span className="text-xs font-medium text-slate-700">
              {q.label}
            </span>
          </button>
        ))}

      </div>

      {/* Build history + deployment */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

        {/* Build history */}
        <Card className="p-5 lg:col-span-2">

          <div className="mb-4 flex items-center justify-between">

            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Build History
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Recent CartForge Jenkins builds
              </p>
            </div>

            <Button
              size="sm"
              variant="secondary"
              onClick={() => onNavigate('jenkins', 'pipelines')}
            >
              <Workflow size={14} />
              View Jobs
            </Button>

          </div>

          <div className="space-y-2">

            {BUILDS.slice(0, 6).map((b) => (
              <div
                key={b.id}
                className="
                  flex items-center gap-3
                  rounded-lg
                  border border-slate-200
                  bg-slate-50
                  p-3
                  text-sm
                "
              >

                <StatusBadge status={b.status} />

                <span className="font-mono text-xs text-slate-500">
                  #{b.number}
                </span>

                <span className="flex-1 truncate font-medium text-slate-800">
                  {b.pipeline}
                </span>

                <span className="hidden text-xs text-slate-500 sm:block">
                  {b.branch}
                </span>

                <span className="font-mono text-xs text-blue-600">
                  {b.commit}
                </span>

                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Clock size={12} />
                  {b.duration}
                </span>

              </div>
            ))}

          </div>
        </Card>

        {/* Deployment */}
        <Card className="p-5">

          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-900">
              Deployment Status
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              CartForge deployment environment
            </p>
          </div>

          <div className="space-y-3">

            {PIPELINES.filter((p) => p.enabled).map((p) => (
              <div
                key={p.id}
                className="
                  rounded-lg
                  border border-slate-200
                  bg-slate-50
                  p-3
                "
              >

                <div className="flex items-center justify-between">

                  <span className="truncate text-sm font-medium text-slate-800">
                    {p.name}
                  </span>

                  <Badge variant="success">
                    Deployed
                  </Badge>

                </div>

                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>{p.repository}</span>
                  <span>{p.branch}</span>
                </div>

              </div>
            ))}

          </div>

          {/* Disk usage */}
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">

            <div className="flex items-center gap-2 text-xs text-slate-600">
              <HardDrive size={14} />
              Jenkins disk usage
            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-blue-600"
                style={{ width: `${SERVER_INFO.diskUsage}` }}
              />
            </div>

            <p className="mt-1 text-xs text-slate-500">
              {SERVER_INFO.diskUsage} of available storage used
            </p>

          </div>

        </Card>

      </div>
    </div>
  );
}