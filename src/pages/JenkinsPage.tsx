import {
  Activity,
  Bot,
  CheckCircle2,
  Clock,
  Cloud,
  Code2,
  GitBranch,
  HardDrive,
  Package,
  Play,
  Plug,
  Server,
  Settings,
  ShieldCheck,
  Webhook,
  XCircle,
} from 'lucide-react';

export default function JenkinsPage() {
  return (
    <div className="min-h-full bg-slate-50 p-6">

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">

        <div>
          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50">
              <GitBranch size={22} className="text-orange-600" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Jenkins
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                CI/CD server - pipelines, agents, webhooks, plugins,
                credentials, artifacts, and deployments.
              </p>
            </div>

          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />

          <span className="text-xs font-semibold text-emerald-700">
            Jenkins Running
          </span>
        </div>

      </div>

      {/* Navigation Tabs */}
      <div className="mb-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">

        <div className="flex min-w-max">

          <JenkinsTab
            label="Overview"
            active
            icon={<Activity size={15} />}
          />

          <JenkinsTab
            label="Pipelines"
            count="1"
            icon={<GitBranch size={15} />}
          />

          <JenkinsTab
            label="Pipeline Execution"
            icon={<Play size={15} />}
          />

          <JenkinsTab
            label="Agents"
            count="1"
            icon={<Bot size={15} />}
          />

          <JenkinsTab
            label="Webhooks"
            count="4"
            icon={<Webhook size={15} />}
          />

          <JenkinsTab
            label="Plugins"
            count="12"
            icon={<Plug size={15} />}
          />

          <JenkinsTab
            label="Credentials"
            icon={<ShieldCheck size={15} />}
          />

          <JenkinsTab
            label="Artifacts"
            icon={<Package size={15} />}
          />

          <JenkinsTab
            label="AWS Deploy"
            icon={<Cloud size={15} />}
          />

          <JenkinsTab
            label="Reports"
            icon={<Code2 size={15} />}
          />

          <JenkinsTab
            label="Troubleshooting"
            count="3"
            icon={<Settings size={15} />}
          />

        </div>
      </div>

      {/* Jenkins Controller */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50">
              <Server size={19} className="text-orange-600" />
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900">
                Jenkins Controller
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Jenkins controller and server information
              </p>
            </div>

          </div>

          <div className="flex items-center gap-2">

            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
              Running
            </span>

            <span className="text-xs font-medium text-slate-500">
              2.452.1 LTS
            </span>

          </div>

        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

          <ControllerInfo
            label="URL"
            value="Jenkins Local"
          />

          <ControllerInfo
            label="Java"
            value="OpenJDK 17.0.10"
          />

          <ControllerInfo
            label="Status"
            value="Running"
            valueClass="text-emerald-600"
          />

          <ControllerInfo
            label="Server"
            value="Jenkins Controller"
          />

        </div>

      </div>

      {/* Main Metrics */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <MetricCard
          icon={<Server size={21} />}
          iconClass="bg-blue-50 text-blue-600"
          title="Jobs"
          value="24"
          subtitle="configured"
        />

        <MetricCard
          icon={<Activity size={21} />}
          iconClass="bg-purple-50 text-purple-600"
          title="Executors Online"
          value="6"
          subtitle="2 busy"
        />

        <MetricCard
          icon={<Plug size={21} />}
          iconClass="bg-orange-50 text-orange-600"
          title="Plugins"
          value="4"
          subtitle="0 updates"
        />

        <MetricCard
          icon={<Bot size={21} />}
          iconClass="bg-emerald-50 text-emerald-600"
          title="Agents"
          value="1"
          subtitle="1 online"
          valueClass="text-emerald-600"
        />

      </div>

      {/* Build Metrics */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <MetricCard
          icon={<Play size={21} />}
          iconClass="bg-blue-50 text-blue-600"
          title="Current Build"
          value="#3"
          subtitle="Cartforge-Freestyle"
        />

        <MetricCard
          icon={<CheckCircle2 size={21} />}
          iconClass="bg-emerald-50 text-emerald-600"
          title="Last Build"
          value="Success"
          subtitle="1m 24s · #3"
          valueClass="text-emerald-600"
        />

        <MetricCard
          icon={<Clock size={21} />}
          iconClass="bg-purple-50 text-purple-600"
          title="Avg Build Time"
          value="1m 21s"
          subtitle="last 3 builds"
        />

        <MetricCard
          icon={<CheckCircle2 size={21} />}
          iconClass="bg-emerald-50 text-emerald-600"
          title="Success Rate"
          value="100%"
          subtitle="CartForge builds"
          valueClass="text-emerald-600"
        />

      </div>

      {/* Build History + Deployment */}
      <div className="mb-6 grid grid-cols-1 gap-5 xl:grid-cols-2">

        {/* Build History */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="mb-5 flex items-center justify-between">

            <div>
              <h2 className="text-base font-bold text-slate-900">
                Build History
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Recent CartForge Jenkins builds
              </p>
            </div>

            <button
              type="button"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              View Jobs
            </button>

          </div>

          <div className="space-y-3">

            <BuildRow
              build="#3"
              job="Cartforge-Freestyle"
              branch="main"
              time="1m 24s"
              status="Success"
            />

            <BuildRow
              build="#2"
              job="Cartforge-Freestyle"
              branch="main"
              time="1m 18s"
              status="Success"
            />

            <BuildRow
              build="#1"
              job="Cartforge-Freestyle"
              branch="main"
              time="1m 20s"
              status="Success"
            />

          </div>

        </div>

        {/* Deployment */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="mb-5 flex items-center gap-3">

            <div className="rounded-lg bg-blue-50 p-2">
              <Cloud size={18} className="text-blue-600" />
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900">
                Deployment Status
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                CartForge deployment environment
              </p>
            </div>

          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-slate-200">
                <Server size={18} className="text-blue-600" />
              </div>

              <div className="min-w-0">

                <p className="text-sm font-semibold text-slate-900">
                  Cartforge-Freestyle
                </p>

                <p className="mt-0.5 text-xs text-slate-500">
                  Production deployment
                </p>

              </div>

              <span className="ml-auto rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
                Deployed
              </span>

            </div>

          </div>

          <div className="mt-4 space-y-3">

            <DeploymentRow
              label="CartForge GitHub Repository"
              value="main"
            />

            <DeploymentRow
              label="Target"
              value="AWS EC2"
            />

            <DeploymentRow
              label="Web Server"
              value="Apache2"
            />

          </div>

        </div>

      </div>

      {/* Jenkins Resources */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">

        <ResourceCard
          icon={<HardDrive size={19} />}
          title="Jenkins Disk Usage"
          value="41%"
          description="of available storage used"
          percentage={41}
        />

        <ResourceCard
          icon={<Bot size={19} />}
          title="Agent Availability"
          value="100%"
          description="1 of 1 agents online"
          percentage={100}
        />

        <ResourceCard
          icon={<Activity size={19} />}
          title="Build Health"
          value="100%"
          description="Successful CartForge builds"
          percentage={100}
        />

      </div>

    </div>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function JenkinsTab({
  label,
  count,
  icon,
  active = false,
}: {
  label: string;
  count?: string;
  icon: React.ReactNode;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-medium transition ${
        active
          ? 'border-blue-600 text-blue-600'
          : 'border-transparent text-slate-500 hover:border-slate-200 hover:text-slate-800'
      }`}
    >
      {icon}

      <span>{label}</span>

      {count && (
        <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
          {count}
        </span>
      )}
    </button>
  );
}

function ControllerInfo({
  label,
  value,
  valueClass = 'text-slate-900',
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">

      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className={`mt-1 text-sm font-semibold ${valueClass}`}>
        {value}
      </p>

    </div>
  );
}

function MetricCard({
  icon,
  iconClass,
  title,
  value,
  subtitle,
  valueClass = 'text-slate-900',
}: {
  icon: React.ReactNode;
  iconClass: string;
  title: string;
  value: string;
  subtitle: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-start gap-4">

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>

        <div className="min-w-0">

          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </p>

          <p className={`mt-1 text-2xl font-bold ${valueClass}`}>
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {subtitle}
          </p>

        </div>

      </div>

    </div>
  );
}

function BuildRow({
  build,
  job,
  branch,
  time,
  status,
}: {
  build: string;
  job: string;
  branch: string;
  time: string;
  status: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-3">

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50">
        <CheckCircle2 size={15} className="text-emerald-600" />
      </div>

      <div className="min-w-0 flex-1">

        <div className="flex items-center gap-2">

          <span className="text-xs font-bold text-slate-900">
            {build}
          </span>

          <span className="truncate text-xs font-semibold text-slate-700">
            {job}
          </span>

        </div>

        <div className="mt-1 flex items-center gap-2">

          <span className="font-mono text-[11px] text-slate-400">
            {branch}
          </span>

          <span className="text-[11px] text-slate-400">
            {time}
          </span>

        </div>

      </div>

      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
        {status}
      </span>

    </div>
  );
}

function DeploymentRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0">

      <span className="text-xs text-slate-500">
        {label}
      </span>

      <span className="text-xs font-semibold text-slate-800">
        {value}
      </span>

    </div>
  );
}

function ResourceCard({
  icon,
  title,
  value,
  description,
  percentage,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
  percentage: number;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-center gap-3">

        <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
          {icon}
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-900">
            {title}
          </h3>

          <p className="mt-0.5 text-xs text-slate-500">
            {description}
          </p>
        </div>

      </div>

      <div className="mt-4 flex items-end justify-between">

        <span className="text-2xl font-bold text-slate-900">
          {value}
        </span>

        <CheckCircle2
          size={18}
          className="text-emerald-500"
        />

      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-blue-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

    </div>
  );
}