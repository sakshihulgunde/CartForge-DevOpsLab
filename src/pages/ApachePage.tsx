import {
  Activity,
  CheckCircle2,
  Clock,
  FileText,
  FolderOpen,
  Globe,
  HardDrive,
  RefreshCw,
  RotateCcw,
  Server,
  Settings,
  Terminal,
} from 'lucide-react';

export default function ApachePage() {
  return (
    <div className="min-h-full bg-slate-50 p-6">

      {/* Page Header */}
      <div className="mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">

          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50">
                <Server size={22} className="text-orange-600" />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Apache Server
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Web server management, status, configuration and logs.
                </p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />

            <span className="text-xs font-semibold text-emerald-700">
              Apache Running
            </span>
          </div>

        </div>
      </div>

      {/* Server Overview */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* Status */}
        <InfoCard
          icon={<Activity size={21} />}
          iconClass="bg-emerald-50 text-emerald-600"
          title="Server Status"
          value="Running"
          subtitle="Service is active"
          valueClass="text-emerald-600"
        />

        {/* Port */}
        <InfoCard
          icon={<Globe size={21} />}
          iconClass="bg-blue-50 text-blue-600"
          title="HTTP Port"
          value="80"
          subtitle="Public web traffic"
        />

        {/* Version */}
        <InfoCard
          icon={<Server size={21} />}
          iconClass="bg-orange-50 text-orange-600"
          title="Apache Version"
          value="2.4.x"
          subtitle="Ubuntu Apache"
        />

        {/* Uptime */}
        <InfoCard
          icon={<Clock size={21} />}
          iconClass="bg-purple-50 text-purple-600"
          title="Server Uptime"
          value="14d 6h"
          subtitle="Since last restart"
        />

      </div>

      {/* Main Information */}
      <div className="mb-6 grid grid-cols-1 gap-5 xl:grid-cols-3">

        {/* Server Configuration */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">

          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2">
              <Settings size={18} className="text-blue-600" />
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900">
                Server Configuration
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Current Apache server configuration
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

            <ConfigRow
              label="Server"
              value="Apache2"
              icon={<Server size={15} />}
            />

            <ConfigRow
              label="Operating System"
              value="Ubuntu Linux"
              icon={<Terminal size={15} />}
            />

            <ConfigRow
              label="HTTP Port"
              value="80"
              icon={<Globe size={15} />}
            />

            <ConfigRow
              label="Protocol"
              value="HTTP"
              icon={<Activity size={15} />}
            />

            <ConfigRow
              label="Document Root"
              value="/var/www/html"
              icon={<FolderOpen size={15} />}
            />

            <ConfigRow
              label="Configuration"
              value="/etc/apache2/apache2.conf"
              icon={<FileText size={15} />}
            />

          </div>

        </div>

        {/* Health */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="mb-5">
            <h2 className="text-base font-bold text-slate-900">
              Apache Health
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Current web server health
            </p>
          </div>

          <div className="flex items-center justify-center py-4">

            <div className="relative flex h-36 w-36 items-center justify-center rounded-full border-[10px] border-emerald-100">

              <div className="text-center">
                <p className="text-3xl font-bold text-slate-900">
                  92%
                </p>

                <p className="mt-1 text-xs font-medium text-emerald-600">
                  Healthy
                </p>
              </div>

            </div>

          </div>

          <div className="mt-4 space-y-3">

            <HealthRow
              label="Service"
              value="Running"
            />

            <HealthRow
              label="Port 80"
              value="Listening"
            />

            <HealthRow
              label="Configuration"
              value="Valid"
            />

          </div>

        </div>

      </div>

      {/* Quick Actions */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="mb-5">
          <h2 className="text-base font-bold text-slate-900">
            Quick Actions
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Common Apache server operations
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

          <ActionButton
            icon={<Activity size={18} />}
            title="Check Status"
            description="apache2 status"
          />

          <ActionButton
            icon={<RefreshCw size={18} />}
            title="Reload Apache"
            description="Reload configuration"
          />

          <ActionButton
            icon={<RotateCcw size={18} />}
            title="Restart Apache"
            description="Restart web server"
          />

          <ActionButton
            icon={<FileText size={18} />}
            title="View Logs"
            description="Apache access & error logs"
          />

        </div>

      </div>

      {/* Logs + Website */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

        {/* Recent Activity */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="mb-5 flex items-center justify-between">

            <div>
              <h2 className="text-base font-bold text-slate-900">
                Recent Activity
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Latest Apache server events
              </p>
            </div>

            <Activity size={18} className="text-slate-400" />

          </div>

          <div className="space-y-3">

            <ActivityRow
              title="Apache service started"
              time="Today, 07:02"
            />

            <ActivityRow
              title="Configuration syntax verified"
              time="Today, 07:01"
            />

            <ActivityRow
              title="Port 80 listening"
              time="Today, 07:01"
            />

            <ActivityRow
              title="CartForge website deployed"
              time="Today, 06:58"
            />

          </div>

        </div>

        {/* Website */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="mb-5 flex items-center gap-3">

            <div className="rounded-lg bg-blue-50 p-2">
              <Globe size={18} className="text-blue-600" />
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900">
                Hosted Website
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Apache document root
              </p>
            </div>

          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-slate-200">
                <HardDrive size={18} className="text-blue-600" />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">
                  CartForge
                </p>

                <p className="truncate font-mono text-xs text-slate-500">
                  /var/www/html
                </p>
              </div>

              <span className="ml-auto rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
                LIVE
              </span>

            </div>

          </div>

          <div className="mt-4 flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-3">

            <CheckCircle2
              size={16}
              className="shrink-0 text-blue-600"
            />

            <p className="text-xs font-medium text-blue-700">
              Website is being served through Apache on port 80.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

/* ---------------- Components ---------------- */

function InfoCard({
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

function ConfigRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">

      <div className="flex items-center gap-2 text-xs text-slate-500">
        {icon}
        {label}
      </div>

      <p className="mt-2 truncate font-mono text-xs font-semibold text-slate-800">
        {value}
      </p>

    </div>
  );
}

function HealthRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0">

      <span className="text-xs text-slate-500">
        {label}
      </span>

      <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">

        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

        {value}

      </span>

    </div>
  );
}

function ActionButton({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
    >

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
        {icon}
      </div>

      <div className="min-w-0">

        <p className="text-sm font-semibold text-slate-800">
          {title}
        </p>

        <p className="mt-0.5 truncate text-xs text-slate-500">
          {description}
        </p>

      </div>

    </button>
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