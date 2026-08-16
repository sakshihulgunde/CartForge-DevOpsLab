import {
  Activity,
  CheckCircle2,
  Clock,
  GitBranch,
  Package,
  Play,
  Server,
  Settings,
  ShieldCheck,
  Webhook,
  Wrench,
  Zap,
} from 'lucide-react';

type JenkinsTab =
  | 'overview'
  | 'pipelines'
  | 'execution'
  | 'agents'
  | 'webhooks'
  | 'plugins'
  | 'credentials'
  | 'artifacts'
  | 'aws'
  | 'deploy'
  | 'reports'
  | 'troubleshooting';

interface JenkinsPageProps {
  initialTab?: string;
  buildTrigger?: {
    name: string;
    n: number;
  } | null;
  onNavigate?: (
    k: any,
    tab?: string,
    build?: string
  ) => void;
}

export default function JenkinsPage({
  initialTab = 'overview',
  buildTrigger,
}: JenkinsPageProps) {
  const tab = initialTab as JenkinsTab;

  return (
    <div className="min-h-full bg-slate-50 p-6 text-slate-900">

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
              <Settings size={22} className="text-blue-600" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Jenkins
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                CI/CD server — pipelines, agents, webhooks, plugins,
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

      {/* Tabs */}
      <div className="mb-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex min-w-max">
          <Tab label="Overview" icon={<Activity size={15} />} active={tab === 'overview'} />
          <Tab label="Pipelines" icon={<GitBranch size={15} />} active={tab === 'pipelines'} />
          <Tab label="Execution" icon={<Play size={15} />} active={tab === 'execution'} />
          <Tab label="Agents" icon={<Server size={15} />} active={tab === 'agents'} />
          <Tab label="Webhooks" icon={<Webhook size={15} />} active={tab === 'webhooks'} />
          <Tab label="Plugins" icon={<Package size={15} />} active={tab === 'plugins'} />
          <Tab label="Credentials" icon={<ShieldCheck size={15} />} active={tab === 'credentials'} />
          <Tab label="Artifacts" icon={<Package size={15} />} active={tab === 'artifacts'} />
          <Tab label="AWS Deploy" icon={<Zap size={15} />} active={tab === 'aws'} />
          <Tab label="Reports" icon={<Activity size={15} />} active={tab === 'reports'} />
          <Tab label="Troubleshooting" icon={<Wrench size={15} />} active={tab === 'troubleshooting'} />
        </div>
      </div>

      {/* Build trigger message */}
      {buildTrigger && (
        <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={17} className="text-blue-600" />

            <p className="text-sm font-medium text-blue-800">
              Build #{buildTrigger.n} triggered for {buildTrigger.name}
            </p>
          </div>
        </div>
      )}

      {/* Content */}
      <JenkinsOverview />

    </div>
  );
}

/* -------------------------------------------------- */
/* Jenkins Overview */
/* -------------------------------------------------- */

function JenkinsOverview() {
  return (
    <>
      {/* Controller */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">

          <div>
            <h2 className="text-base font-bold text-slate-900">
              Jenkins Controller
            </h2>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                Running
              </span>

              <span className="text-sm font-medium text-slate-700">
                2.452.1 LTS
              </span>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs text-slate-400">
              URL
            </p>

            <p className="mt-1 text-sm font-medium text-blue-600">
              Jenkins Local
            </p>
          </div>

        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">

          <ConfigItem
            label="Java"
            value="OpenJDK 17.0.10"
          />

          <ConfigItem
            label="Status"
            value="Running"
          />

          <ConfigItem
            label="Controller"
            value="Active"
          />

        </div>
      </div>

      {/* Metrics */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <MetricCard
          icon={<GitBranch size={20} />}
          title="Jobs"
          value="24"
          subtitle="configured"
          iconClass="bg-blue-50 text-blue-600"
        />

        <MetricCard
          icon={<Play size={20} />}
          title="Executors Online"
          value="6"
          subtitle="2 busy"
          iconClass="bg-purple-50 text-purple-600"
        />

        <MetricCard
          icon={<Package size={20} />}
          title="Plugins"
          value="12"
          subtitle="0 updates"
          iconClass="bg-orange-50 text-orange-600"
        />

        <MetricCard
          icon={<Server size={20} />}
          title="Agents"
          value="1"
          subtitle="1 online"
          iconClass="bg-emerald-50 text-emerald-600"
        />

      </div>

      {/* Build stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <MetricCard
          icon={<Play size={20} />}
          title="Current Build"
          value="Cartforge-Freestyle #3"
          subtitle="stage: Build & Deploy"
          iconClass="bg-blue-50 text-blue-600"
          smallValue
        />

        <MetricCard
          icon={<CheckCircle2 size={20} />}
          title="Last Build"
          value="Success"
          subtitle="1m 24s · #3"
          iconClass="bg-emerald-50 text-emerald-600"
          valueClass="text-emerald-600"
        />

        <MetricCard
          icon={<Clock size={20} />}
          title="Avg Build Time"
          value="1m 21s"
          subtitle="last 3 builds"
          iconClass="bg-purple-50 text-purple-600"
        />

        <MetricCard
          icon={<CheckCircle2 size={20} />}
          title="Success Rate"
          value="100%"
          subtitle="CartForge builds"
          iconClass="bg-emerald-50 text-emerald-600"
          valueClass="text-emerald-600"
        />

      </div>

      {/* Build History + Deployment */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

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
              number="#3"
              branch="main"
              time="1m 24s"
            />

            <BuildRow
              number="#2"
              branch="main"
              time="1m 18s"
            />

            <BuildRow
              number="#1"
              branch="main"
              time="1m 20s"
            />

          </div>
        </div>

        {/* Deployment */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="mb-5">
            <h2 className="text-base font-bold text-slate-900">
              Deployment Status
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              CartForge deployment environment
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                <Server size={18} className="text-emerald-600" />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Cartforge-Freestyle
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  CartForge GitHub Repository
                </p>
              </div>

              <span className="ml-auto rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
                Deployed
              </span>

            </div>

          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">

            <InfoBox
              label="Branch"
              value="main"
            />

            <InfoBox
              label="Disk Usage"
              value="41%"
            />

          </div>

          <div className="mt-4 flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-3">
            <CheckCircle2
              size={16}
              className="text-blue-600"
            />

            <p className="text-xs font-medium text-blue-700">
              Jenkins deployment completed successfully.
            </p>
          </div>

        </div>

      </div>
    </>
  );
}

/* -------------------------------------------------- */
/* Components */
/* -------------------------------------------------- */

function Tab({
  label,
  icon,
  active,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition ${
        active
          ? 'border-blue-600 text-blue-600'
          : 'border-transparent text-slate-500'
      }`}
    >
      {icon}
      {label}
    </div>
  );
}

function MetricCard({
  icon,
  title,
  value,
  subtitle,
  iconClass,
  valueClass = 'text-slate-900',
  smallValue = false,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
  iconClass: string;
  valueClass?: string;
  smallValue?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </p>

          <p
            className={`mt-1 truncate font-bold ${
              smallValue
                ? 'text-base'
                : 'text-2xl'
            } ${valueClass}`}
          >
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

function ConfigItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}

function BuildRow({
  number,
  branch,
  time,
}: {
  number: string;
  branch: string;
  time: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-3">

      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50">
        <CheckCircle2 size={15} className="text-emerald-600" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-800">
            Success
          </span>

          <span className="text-xs font-semibold text-slate-500">
            {number}
          </span>
        </div>

        <p className="mt-0.5 text-[11px] text-slate-500">
          Cartforge-Freestyle
        </p>
      </div>

      <div className="text-right">
        <p className="font-mono text-[11px] text-slate-500">
          {branch}
        </p>

        <p className="mt-0.5 text-[11px] text-slate-400">
          {time}
        </p>
      </div>

    </div>
  );
}

function InfoBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}