
import {
  Card,
  StatCard,
  StatusBadge,
  PageHeader,
  Button,
  Badge,
} from '@/components/ui';

import {
  SERVER_INFO,
  BUILDS,
  PIPELINES,
  AGENTS,
  DEPLOYMENTS,
  PLUGINS,
} from '@/data/jenkinsData';

import {
  Workflow,
  CheckCircle2,
  XCircle,
  Server,
  GitBranch,
  Activity,
  Clock,
  Cpu,
  Plug,
  ShieldCheck,
  Database,
  Rocket,
  HardDrive,
} from 'lucide-react';

import type { ModuleKey } from '@/types';

export default function Dashboard({
  onNavigate,
}: {
  onNavigate: (k: ModuleKey) => void;
}) {
  const successBuilds = BUILDS.filter(
    (b) => b.status === 'success'
  ).length;

  const failedBuilds = BUILDS.filter(
    (b) => b.status === 'failed'
  ).length;

  const onlineAgents = AGENTS.filter(
    (a) => a.status === 'online'
  ).length;

  const activePipelines = PIPELINES.filter(
    (p) => p.enabled
  ).length;

  return (
    <div className="min-h-full bg-slate-50 p-6">

      {/* =========================
          PAGE HEADER
      ========================== */}
      <div className="mb-6">
  <h1 className="text-2xl font-bold tracking-tight text-slate-900">
    Jenkins Overview
  </h1>

  <p className="mt-1 text-sm text-slate-500">
    CI/CD server management and deployment overview
  </p>

  <div className="mt-4 flex flex-wrap gap-2.5">
    <span className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 shadow-sm">
      Pipelines
    </span>

    <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 shadow-sm">
      Agents
    </span>

    <span className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-700 shadow-sm">
      Webhooks
    </span>

    <span className="rounded-lg border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700 shadow-sm">
      Credentials
    </span>

    <span className="rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-bold text-cyan-700 shadow-sm">
      Artifacts
    </span>

    <span className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 shadow-sm">
      Deployments
    </span>
  </div>
</div>


      {/* =========================
          JENKINS SYSTEM STATS
      ========================== */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <Card className="border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start gap-4">

            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50">
              <Workflow
                size={25}
                className="text-blue-600"
              />
            </div>

            <div>
              <p className="text-sm font-medium text-slate-500">
                Jobs
              </p>

              <p className="mt-1 text-3xl font-bold text-slate-900">
                {activePipelines}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                configured
              </p>
            </div>

          </div>
        </Card>


        <Card className="border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start gap-4">

            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-green-50">
              <Cpu
                size={25}
                className="text-green-600"
              />
            </div>

            <div>
              <p className="text-sm font-medium text-slate-500">
                Executors Online
              </p>

              <p className="mt-1 text-3xl font-bold text-slate-900">
                {SERVER_INFO.executorsOnline}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {SERVER_INFO.executorsBusy} busy
              </p>
            </div>

          </div>
        </Card>


        <Card className="border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start gap-4">

            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-orange-50">
              <Plug
                size={25}
                className="text-orange-500"
              />
            </div>

            <div>
              <p className="text-sm font-medium text-slate-500">
                Plugins
              </p>

              <p className="mt-1 text-3xl font-bold text-slate-900">
                {PLUGINS.length}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {PLUGINS.filter((p) => p.hasUpdate).length} updates
              </p>
            </div>

          </div>
        </Card>


        <Card className="border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start gap-4">

            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-purple-50">
              <Server
                size={25}
                className="text-purple-600"
              />
            </div>

            <div>
              <p className="text-sm font-medium text-slate-500">
                Agents
              </p>

              <p className="mt-1 text-3xl font-bold text-slate-900">
                {AGENTS.length}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {onlineAgents} online
              </p>
            </div>

          </div>
        </Card>

      </div>


      {/* =========================
          BUILD SUMMARY
      ========================== */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

        <Card className="border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Current Build
              </p>

              <h2 className="mt-3 text-xl font-bold text-slate-900">
                Cartforge-Freestyle #3
              </h2>

              <p className="mt-2 text-sm font-medium text-blue-600">
                Stage: Build &amp; Deploy
              </p>
            </div>

            <div className="rounded-xl bg-blue-50 p-3">
              <Rocket
                size={22}
                className="text-blue-600"
              />
            </div>

          </div>
        </Card>


        <Card className="border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Last Build
              </p>

              <h2 className="mt-3 text-xl font-bold text-green-600">
                Success
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                1m 24s · #3
              </p>
            </div>

            <div className="rounded-xl bg-green-50 p-3">
              <CheckCircle2
                size={22}
                className="text-green-600"
              />
            </div>

          </div>
        </Card>


        <Card className="border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Avg Build Time
              </p>

              <h2 className="mt-3 text-xl font-bold text-slate-900">
                1m 21s
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                last 3 builds
              </p>
            </div>

            <div className="rounded-xl bg-orange-50 p-3">
              <Clock
                size={22}
                className="text-orange-500"
              />
            </div>

          </div>
        </Card>


        <Card className="border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Success Rate
              </p>

              <h2 className="mt-3 text-xl font-bold text-green-600">
                100%
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                CartForge builds
              </p>
            </div>

            <div className="rounded-xl bg-green-50 p-3">
              <ShieldCheck
                size={22}
                className="text-green-600"
              />
            </div>

          </div>
        </Card>

      </div>


      {/* =========================
          BUILD HISTORY + DEPLOYMENT
      ========================== */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">

        {/* Build History */}
        <Card className="border-slate-200 bg-white p-5 shadow-sm xl:col-span-3">

          <div className="mb-5 flex items-center justify-between">

            <div>
              <h2 className="text-base font-bold text-slate-900">
                Build History
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Recent CartForge Jenkins builds
              </p>
            </div>

            <Button
              size="sm"
              variant="secondary"
              onClick={() => onNavigate('jenkins')}
            >
              View Jobs
            </Button>

          </div>

          <div className="space-y-2">

            {BUILDS.slice(0, 3).map((b) => (

              <div
                key={b.id}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
              >

                <StatusBadge status={b.status} />

                <span className="font-mono text-sm font-semibold text-slate-700">
                  #{b.number}
                </span>

                <span className="min-w-36 flex-1 text-sm font-semibold text-slate-900">
                  {b.pipeline}
                </span>

                <span className="text-xs text-slate-500">
                  {b.branch}
                </span>

                <span className="font-mono text-xs font-medium text-blue-600">
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


        {/* Deployment Status */}
        <Card className="border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">

          <div className="mb-5">

            <h2 className="text-base font-bold text-slate-900">
              Deployment Status
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              CartForge deployment environment
            </p>

          </div>

          <div className="space-y-3">

            {PIPELINES.filter((p) => p.enabled).map((p) => (

              <div
                key={p.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
              >

                <div className="flex items-center justify-between gap-3">

                  <span className="truncate text-sm font-bold text-slate-900">
                    {p.name}
                  </span>

                  <Badge variant="success">
                    Deployed
                  </Badge>

                </div>

                <div className="mt-3 flex items-center justify-between">

                  <span className="text-xs text-slate-500">
                    {p.repository}
                  </span>

                  <span className="text-xs font-medium text-slate-700">
                    {p.branch}
                  </span>

                </div>

              </div>

            ))}

          </div>


          {/* Disk Usage */}
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">

            <div className="flex items-center gap-2">

              <HardDrive
                size={17}
                className="text-slate-600"
              />

              <span className="text-sm font-semibold text-slate-800">
                Jenkins Disk Usage
              </span>

            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">

              <div
                className="h-full rounded-full bg-blue-600"
                style={{ width: '41%' }}
              />

            </div>

            <p className="mt-2 text-xs text-slate-500">
              41% of available storage used
            </p>

          </div>

        </Card>

      </div>


      {/* =========================
          QUICK ACCESS
      ========================== */}
      <Card className="border-slate-200 bg-white p-5 shadow-sm">

        <div className="mb-5">

          <h2 className="text-base font-bold text-slate-900">
            Quick Access
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Jump to important Jenkins sections
          </p>

        </div>


        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">

          {[
            {
              label: 'Pipelines',
              icon: Workflow,
              color: 'text-blue-600',
              bg: 'bg-blue-50',
              tab: 'pipelines',
            },
            {
              label: 'Agents',
              icon: Server,
              color: 'text-green-600',
              bg: 'bg-green-50',
              tab: 'agents',
            },
            {
              label: 'Webhooks',
              icon: GitBranch,
              color: 'text-orange-500',
              bg: 'bg-orange-50',
              tab: 'webhooks',
            },
            {
              label: 'Plugins',
              icon: Plug,
              color: 'text-purple-600',
              bg: 'bg-purple-50',
              tab: 'plugins',
            },
            {
              label: 'Credentials',
              icon: ShieldCheck,
              color: 'text-cyan-600',
              bg: 'bg-cyan-50',
              tab: 'credentials',
            },
            {
              label: 'Artifacts',
              icon: Database,
              color: 'text-rose-600',
              bg: 'bg-rose-50',
              tab: 'artifacts',
            },
          ].map((item) => (

            <button
              key={item.label}
              onClick={() => onNavigate('jenkins')}
              className="group flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-4 transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-sm"
            >

              <div className={`rounded-lg p-2 ${item.bg}`}>
                <item.icon
                  size={18}
                  className={item.color}
                />
              </div>

              <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900">
                {item.label}
              </span>

            </button>

          ))}

        </div>

      </Card>

    </div>
  );
}

