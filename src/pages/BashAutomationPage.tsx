import {
  Activity,
  CheckCircle2,
  Clock,
  FileCode2,
  HardDrive,
  Play,
  RotateCcw,
  Server,
  Terminal,
  Users,
} from 'lucide-react';

const scripts = [
  {
    name: 'Server Health Check',
    file: 'server_health_check.sh',
    description: 'Checks CPU, memory, disk usage and system uptime.',
    status: 'Ready',
    icon: <Activity size={18} />,
  },
  {
    name: 'Apache Monitor',
    file: 'apache_monitor.sh',
    description: 'Checks Apache service status and restarts it if required.',
    status: 'Ready',
    icon: <Server size={18} />,
  },
  {
    name: 'Website Backup',
    file: 'website_backup.sh',
    description: 'Creates a compressed backup of the hosted website.',
    status: 'Ready',
    icon: <HardDrive size={18} />,
  },
];

export default function BashAutomationPage() {
  return (
    <div className="min-h-full bg-slate-50 p-6">

      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50">
              <Terminal size={22} className="text-amber-600" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Bash Automation
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Automate server administration and DevOps operations using Bash scripts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />

            <span className="text-xs font-semibold text-emerald-700">
              Automation Ready
            </span>
          </div>

        </div>
      </div>

      {/* Overview Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <InfoCard
          icon={<FileCode2 size={21} />}
          iconClass="bg-blue-50 text-blue-600"
          title="Total Scripts"
          value="3"
          subtitle="Automation scripts"
        />

        <InfoCard
          icon={<CheckCircle2 size={21} />}
          iconClass="bg-emerald-50 text-emerald-600"
          title="Ready"
          value="3"
          subtitle="Scripts available"
          valueClass="text-emerald-600"
        />

        <InfoCard
          icon={<Play size={21} />}
          iconClass="bg-purple-50 text-purple-600"
          title="Executions"
          value="24"
          subtitle="This month"
        />

        <InfoCard
          icon={<Clock size={21} />}
          iconClass="bg-orange-50 text-orange-600"
          title="Last Run"
          value="Today"
          subtitle="07:02 AM"
        />

      </div>

      {/* Scripts */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="mb-5">
          <h2 className="text-base font-bold text-slate-900">
            Automation Scripts
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Bash scripts used for common server administration tasks.
          </p>
        </div>

        <div className="space-y-3">

          {scripts.map((script) => (
            <div
              key={script.file}
              className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-white sm:flex-row sm:items-center"
            >

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200 text-blue-600">
                {script.icon}
              </div>

              <div className="min-w-0 flex-1">

                <div className="flex flex-wrap items-center gap-2">

                  <h3 className="text-sm font-semibold text-slate-900">
                    {script.name}
                  </h3>

                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                    {script.status}
                  </span>

                </div>

                <p className="mt-1 font-mono text-xs text-blue-600">
                  {script.file}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {script.description}
                </p>

              </div>

              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
              >
                <Play size={14} />
                Run Script
              </button>

            </div>
          ))}

        </div>

      </div>

      {/* Terminal + System Information */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

        {/* Terminal */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

            <div>
              <h2 className="text-base font-bold text-slate-900">
                Automation Console
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Latest script execution output
              </p>
            </div>

            <Terminal size={18} className="text-slate-400" />

          </div>

          <div className="bg-slate-950 p-5 font-mono text-xs leading-6 text-slate-300">

            <p>
              <span className="text-emerald-400">ubuntu@cartforge</span>
              <span className="text-slate-500">:</span>
              <span className="text-blue-400">~</span>
              <span className="text-slate-500">$</span>{' '}
              ./server_health_check.sh
            </p>

            <p className="mt-2 text-slate-400">
              Running server health check...
            </p>

            <p>
              CPU Usage:{' '}
              <span className="text-emerald-400">18%</span>
            </p>

            <p>
              Memory Usage:{' '}
              <span className="text-emerald-400">42%</span>
            </p>

            <p>
              Disk Usage:{' '}
              <span className="text-emerald-400">31%</span>
            </p>

            <p>
              Logged-in Users:{' '}
              <span className="text-blue-400">1</span>
            </p>

            <p>
              Uptime:{' '}
              <span className="text-blue-400">14 days</span>
            </p>

            <p className="mt-2 text-emerald-400">
              ✓ Health check completed successfully.
            </p>

          </div>

        </div>

        {/* Server Automation */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="mb-5">
            <h2 className="text-base font-bold text-slate-900">
              Server Automation
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Automated Linux administration tasks.
            </p>
          </div>

          <div className="space-y-3">

            <AutomationRow
              icon={<Server size={17} />}
              title="Apache Monitoring"
              description="Monitor Apache service"
              status="Active"
            />

            <AutomationRow
              icon={<HardDrive size={17} />}
              title="Website Backup"
              description="Backup /var/www/html"
              status="Active"
            />

            <AutomationRow
              icon={<Activity size={17} />}
              title="Server Health"
              description="Monitor system resources"
              status="Active"
            />

            <AutomationRow
              icon={<Users size={17} />}
              title="User Monitoring"
              description="Check logged-in users"
              status="Ready"
            />

          </div>

        </div>

      </div>

      {/* Script Location */}
      <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">

        <div className="flex items-start gap-3">

          <FileCode2
            size={18}
            className="mt-0.5 shrink-0 text-blue-600"
          />

          <div>

            <p className="text-sm font-semibold text-blue-900">
              Script Location
            </p>

            <p className="mt-1 font-mono text-xs text-blue-700">
              /home/ubuntu/DevOps-Fundamentals-Project/scripts/
            </p>

            <p className="mt-1 text-xs text-blue-600">
              Bash automation scripts are maintained separately from the dashboard.
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

function AutomationRow({
  icon,
  title,
  description,
  status,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  status: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200 text-blue-600">
        {icon}
      </div>

      <div className="min-w-0 flex-1">

        <p className="text-xs font-semibold text-slate-800">
          {title}
        </p>

        <p className="mt-0.5 text-[11px] text-slate-500">
          {description}
        </p>

      </div>

      <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        {status}
      </span>

    </div>
  );
}