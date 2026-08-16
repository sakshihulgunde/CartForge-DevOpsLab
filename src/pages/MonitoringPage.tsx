import {
  Activity,
  CheckCircle2,
  Clock,
  Cpu,
  HardDrive,
  Server,
  Terminal,
  Users,
  GitBranch,
  Cloud,
  Container,
  Database,
  ShieldCheck,
  BarChart3,
} from 'lucide-react';

export default function MonitoringPage() {
  return (
    <div className="min-h-full bg-slate-50 p-6">

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
              <Activity size={22} className="text-blue-600" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Monitoring
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Monitor your current project and DevOps infrastructure health.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-semibold text-emerald-700">
            All Systems Operational
          </span>
        </div>
      </div>

      {/* Current Project Monitoring */}
      <section className="mb-6">

        <SectionHeader
          icon={<BarChart3 size={18} />}
          title="Current Project Monitoring"
          description="Live health overview of the CartForge project."
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <MetricCard
            icon={<Cpu size={21} />}
            iconClass="bg-blue-50 text-blue-600"
            title="CPU Usage"
            value="32%"
            subtitle="Normal utilization"
          />

          <MetricCard
            icon={<HardDrive size={21} />}
            iconClass="bg-purple-50 text-purple-600"
            title="Disk Usage"
            value="48%"
            subtitle="Healthy storage"
          />

          <MetricCard
            icon={<Users size={21} />}
            iconClass="bg-orange-50 text-orange-600"
            title="Active Users"
            value="12"
            subtitle="Currently connected"
          />

          <MetricCard
            icon={<Server size={21} />}
            iconClass="bg-emerald-50 text-emerald-600"
            title="Server Status"
            value="Online"
            subtitle="EC2 instance healthy"
            valueClass="text-emerald-600"
          />

        </div>
      </section>

      {/* Current Project Health */}
      <div className="mb-6 grid grid-cols-1 gap-5 xl:grid-cols-3">

        {/* System Health */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">

          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Current Project Health
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                CartForge application infrastructure
              </p>
            </div>

            <CheckCircle2
              size={20}
              className="text-emerald-500"
            />
          </div>

          <div className="space-y-4">

            <HealthProgress
              label="Application Server"
              value="98%"
              status="Healthy"
              percentage={98}
            />

            <HealthProgress
              label="Apache Web Server"
              value="92%"
              status="Healthy"
              percentage={92}
            />

            <HealthProgress
              label="Jenkins CI/CD"
              value="95%"
              status="Healthy"
              percentage={95}
            />

            <HealthProgress
              label="GitHub Integration"
              value="100%"
              status="Connected"
              percentage={100}
            />

          </div>
        </div>

        {/* Server Overview */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <h2 className="text-base font-bold text-slate-900">
            Server Overview
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Current EC2 environment
          </p>

          <div className="mt-5 space-y-4">

            <OverviewRow
              icon={<Server size={16} />}
              label="Instance"
              value="EC2"
            />

            <OverviewRow
              icon={<Terminal size={16} />}
              label="OS"
              value="Ubuntu Linux"
            />

            <OverviewRow
              icon={<GlobeIcon />}
              label="Web Server"
              value="Apache2"
            />

            <OverviewRow
              icon={<Clock size={16} />}
              label="Uptime"
              value="14d 6h"
            />

          </div>
        </div>
      </div>

      {/* DevOps Infrastructure Monitoring */}
      <section className="mb-6">

        <SectionHeader
          icon={<Cloud size={18} />}
          title="DevOps Infrastructure Monitoring"
          description="Status of the DevOps tools used across the project."
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <DevOpsCard
            icon={<GitBranch size={21} />}
            iconClass="bg-slate-100 text-slate-700"
            title="Git & GitHub"
            status="Connected"
            description="Repository integration"
          />

          <DevOpsCard
            icon={<Terminal size={21} />}
            iconClass="bg-orange-50 text-orange-600"
            title="Jenkins"
            status="Running"
            description="CI/CD automation"
          />

          <DevOpsCard
            icon={<Container size={21} />}
            iconClass="bg-blue-50 text-blue-600"
            title="Docker"
            status="Ready"
            description="Container platform"
          />

          <DevOpsCard
            icon={<Cloud size={21} />}
            iconClass="bg-yellow-50 text-yellow-600"
            title="AWS"
            status="Connected"
            description="Cloud infrastructure"
          />

        </div>
      </section>

      {/* DevOps Module Health */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="mb-5">
          <h2 className="text-base font-bold text-slate-900">
            DevOps Module Health
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Monitoring status across the DevOps learning modules.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">

          <ModuleStatus
            title="AWS EC2"
            description="Cloud server"
          />

          <ModuleStatus
            title="Linux"
            description="Server operating system"
          />

          <ModuleStatus
            title="Git & GitHub"
            description="Version control"
          />

          <ModuleStatus
            title="Jenkins"
            description="Continuous integration"
          />

          <ModuleStatus
            title="Bash Automation"
            description="Shell automation"
          />

          <ModuleStatus
            title="Apache"
            description="Web server"
          />

          <ModuleStatus
            title="Docker"
            description="Containerization"
          />

          <ModuleStatus
            title="Kubernetes"
            description="Container orchestration"
          />

          <ModuleStatus
            title="Terraform"
            description="Infrastructure as Code"
          />

        </div>
      </div>

      {/* Monitoring Activity */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

        {/* Recent Monitoring Events */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Recent Monitoring Events
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Latest infrastructure activity
              </p>
            </div>

            <Activity size={18} className="text-slate-400" />
          </div>

          <div className="space-y-3">

            <ActivityRow
              title="CartForge application is healthy"
              time="Today, 10:42"
            />

            <ActivityRow
              title="Jenkins pipeline completed successfully"
              time="Today, 10:35"
            />

            <ActivityRow
              title="Apache service is running"
              time="Today, 10:30"
            />

            <ActivityRow
              title="EC2 server health check passed"
              time="Today, 10:25"
            />

          </div>
        </div>

        {/* Monitoring Summary */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="mb-5 flex items-center gap-3">

            <div className="rounded-lg bg-emerald-50 p-2">
              <ShieldCheck size={18} className="text-emerald-600" />
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900">
                Monitoring Summary
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Overall project infrastructure status
              </p>
            </div>

          </div>

          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-5">

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
                <CheckCircle2
                  size={25}
                  className="text-emerald-600"
                />
              </div>

              <div>
                <p className="text-lg font-bold text-emerald-800">
                  Everything is healthy
                </p>

                <p className="mt-1 text-xs text-emerald-700">
                  No critical issues detected.
                </p>
              </div>

            </div>

          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">

            <SummaryBox
              label="Services"
              value="9"
            />

            <SummaryBox
              label="Healthy"
              value="9"
            />

            <SummaryBox
              label="Warnings"
              value="0"
            />

            <SummaryBox
              label="Critical"
              value="0"
            />

          </div>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
        {icon}
      </div>

      <div>
        <h2 className="text-base font-bold text-slate-900">
          {title}
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          {description}
        </p>
      </div>
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

        <div>
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

function HealthProgress({
  label,
  value,
  status,
  percentage,
}: {
  label: string;
  value: string;
  status: string;
  percentage: number;
}) {
  return (
    <div>

      <div className="mb-2 flex items-center justify-between">

        <div className="flex items-center gap-2">
          <CheckCircle2 size={15} className="text-emerald-500" />

          <span className="text-sm font-medium text-slate-700">
            {label}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-emerald-600">
            {status}
          </span>

          <span className="text-xs font-bold text-slate-700">
            {value}
          </span>
        </div>

      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-emerald-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

    </div>
  );
}

function OverviewRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0">

      <div className="flex items-center gap-2 text-slate-500">
        {icon}

        <span className="text-xs">
          {label}
        </span>
      </div>

      <span className="text-xs font-semibold text-slate-800">
        {value}
      </span>

    </div>
  );
}

function DevOpsCard({
  icon,
  iconClass,
  title,
  status,
  description,
}: {
  icon: React.ReactNode;
  iconClass: string;
  title: string;
  status: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

      <div className="flex items-center gap-3">

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconClass}`}
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-800">
            {title}
          </p>

          <p className="mt-0.5 text-xs text-slate-500">
            {description}
          </p>
        </div>

        <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-600">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {status}
        </span>

      </div>

    </div>
  );
}

function ModuleStatus({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">

      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
        <CheckCircle2 size={17} className="text-emerald-600" />
      </div>

      <div className="min-w-0 flex-1">

        <p className="text-sm font-semibold text-slate-800">
          {title}
        </p>

        <p className="mt-0.5 text-xs text-slate-500">
          {description}
        </p>

      </div>

      <span className="text-[10px] font-bold text-emerald-600">
        HEALTHY
      </span>

    </div>
  );
}

function ActivityRow({
  title,
  time,
}: {
  title: string;
  time: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-3">

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50">
        <CheckCircle2 size={15} className="text-emerald-600" />
      </div>

      <div className="min-w-0 flex-1">

        <p className="truncate text-xs font-semibold text-slate-800">
          {title}
        </p>

        <p className="mt-0.5 text-[11px] text-slate-400">
          {time}
        </p>

      </div>

    </div>
  );
}

function SummaryBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">

      <p className="text-lg font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-[11px] text-slate-500">
        {label}
      </p>

    </div>
  );
}

function GlobeIcon() {
  return <Activity size={16} />;
}