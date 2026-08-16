import {
  GitBranch,
  CheckCircle2,
  Webhook,
  GitCommit,
  GitPullRequest,
  Server,
  ExternalLink,
  Copy,
  Activity,
  Terminal,
} from 'lucide-react';

export default function GitHubPage() {
  return (
    <div className="min-h-full bg-slate-50 p-6 text-slate-900">

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900">
            <GitBranch size={25} className="text-white" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Git & GitHub
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Source-code management, version control, branches,
              commits, pull requests and CI/CD triggering.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-semibold text-emerald-700">
            Repository Active
          </span>
        </div>
      </div>

      {/* Repository Overview */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="flex flex-wrap items-start justify-between gap-5">

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
              <GitBranch size={24} className="text-slate-800" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                GitHub Repository
              </p>

              <h2 className="mt-1 text-lg font-bold text-slate-900">
                CartForge
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                CartForge DevOps Project
              </p>
            </div>

          </div>

          <span className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            <CheckCircle2 size={14} />
            Active
          </span>

        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">

          <InfoCard
            label="Repository"
            value="CartForge"
          />

          <InfoCard
            label="Default Branch"
            value="main"
          />

          <InfoCard
            label="Version Control"
            value="Git"
          />

        </div>

      </div>

      {/* Metrics */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <MetricCard
          icon={<GitBranch size={20} />}
          title="Main Branch"
          value="main"
          subtitle="Active development branch"
          iconClass="bg-blue-50 text-blue-600"
        />

        <MetricCard
          icon={<GitCommit size={20} />}
          title="Latest Commit"
          value="CartForge"
          subtitle="Latest source update"
          iconClass="bg-purple-50 text-purple-600"
        />

        <MetricCard
          icon={<Webhook size={20} />}
          title="Webhook"
          value="Active"
          subtitle="GitHub → Jenkins trigger"
          iconClass="bg-orange-50 text-orange-600"
          valueClass="text-emerald-600"
        />

        <MetricCard
          icon={<Activity size={20} />}
          title="Repository"
          value="Healthy"
          subtitle="Git operations available"
          iconClass="bg-emerald-50 text-emerald-600"
          valueClass="text-emerald-600"
        />

      </div>

      {/* Implemented Features */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="mb-5">
          <h2 className="text-base font-bold text-slate-900">
            Implemented Features
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Git and GitHub capabilities configured for the CartForge project.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">

          <FeatureRow
            icon={<GitBranch size={18} />}
            title="CartForge source repository"
            description="Source code hosted on GitHub"
          />

          <FeatureRow
            icon={<GitBranch size={18} />}
            title="Git version control"
            description="Source changes tracked using Git"
          />

          <FeatureRow
            icon={<GitCommit size={18} />}
            title="Main branch integration"
            description="main branch used for project integration"
          />

          <FeatureRow
            icon={<Webhook size={18} />}
            title="GitHub webhook integration"
            description="Repository events can trigger Jenkins"
          />

          <FeatureRow
            icon={<GitPullRequest size={18} />}
            title="Pull request workflow"
            description="Changes can be reviewed before merging"
          />

          <FeatureRow
            icon={<Terminal size={18} />}
            title="Git CLI"
            description="Repository managed using Git commands"
          />

        </div>

      </div>

      {/* Git Workflow */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="mb-5">
          <h2 className="text-base font-bold text-slate-900">
            Git & CI/CD Workflow
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            How source-code changes move through the CartForge pipeline.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">

          <WorkflowStep
            number="01"
            icon={<Terminal size={18} />}
            title="Developer"
            description="Code changes"
          />

          <WorkflowArrow />

          <WorkflowStep
            number="02"
            icon={<GitCommit size={18} />}
            title="Git"
            description="Commit changes"
          />

          <WorkflowArrow />

          <WorkflowStep
            number="03"
            icon={<GitBranch size={18} />}
            title="GitHub"
            description="Push to main"
          />

          <WorkflowArrow />

          <WorkflowStep
            number="04"
            icon={<Webhook size={18} />}
            title="Webhook"
            description="Trigger Jenkins"
          />

          <WorkflowArrow />

          <WorkflowStep
            number="05"
            icon={<Server size={18} />}
            title="Jenkins"
            description="Build & deploy"
          />

        </div>

      </div>

      {/* Repository Details */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

        {/* Repository Information */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="mb-5">
            <h2 className="text-base font-bold text-slate-900">
              Repository Information
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              CartForge source repository configuration.
            </p>
          </div>

          <div className="space-y-3">

            <DetailRow
              label="Repository"
              value="CartForge"
            />

            <DetailRow
              label="Branch"
              value="main"
            />

            <DetailRow
              label="Version Control"
              value="Git"
            />

            <DetailRow
              label="CI/CD"
              value="Jenkins"
            />

            <DetailRow
              label="Deployment"
              value="Apache / AWS EC2"
            />

          </div>

        </div>

        {/* CI/CD Integration */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="mb-5">
            <h2 className="text-base font-bold text-slate-900">
              CI/CD Integration
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              GitHub integration with the Jenkins pipeline.
            </p>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">

            <div className="flex items-start gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white">
                <Webhook size={19} className="text-emerald-600" />
              </div>

              <div>
                <p className="text-sm font-bold text-emerald-800">
                  GitHub Webhook
                </p>

                <p className="mt-1 text-xs leading-5 text-emerald-700">
                  A GitHub repository event can notify Jenkins
                  and trigger the CartForge CI/CD pipeline.
                </p>
              </div>

            </div>

          </div>

          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">

            <div className="flex items-center justify-between gap-3">

              <div>
                <p className="text-xs font-semibold text-slate-400">
                  Pipeline Flow
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  GitHub → Webhook → Jenkins → Build → Deploy
                </p>
              </div>

              <CheckCircle2
                size={20}
                className="shrink-0 text-emerald-500"
              />

            </div>

          </div>

        </div>

      </div>

      {/* Project Summary */}
      <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-5">

        <div className="flex items-start gap-3">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white">
            <GitBranch size={19} className="text-blue-600" />
          </div>

          <div>

            <h2 className="text-sm font-bold text-blue-900">
              CartForge DevOps Project
            </h2>

            <p className="mt-1 text-xs leading-5 text-blue-700">
              This module represents the source-code management layer
              of the CartForge DevOps project. Git is used for version
              control, GitHub hosts the repository, and GitHub events
              integrate with Jenkins for automated CI/CD.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

/* ================================================== */
/* Components */
/* ================================================== */

function InfoCard({
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

function MetricCard({
  icon,
  title,
  value,
  subtitle,
  iconClass,
  valueClass = 'text-slate-900',
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
  iconClass: string;
  valueClass?: string;
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

          <p className={`mt-1 text-xl font-bold ${valueClass}`}>
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

function FeatureRow({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm">
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

      <CheckCircle2
        size={17}
        className="shrink-0 text-emerald-500"
      />

    </div>
  );
}

function WorkflowStep({
  number,
  icon,
  title,
  description,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

      <div className="flex items-center justify-between">

        <span className="text-[10px] font-bold text-slate-400">
          {number}
        </span>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
          {icon}
        </div>

      </div>

      <p className="mt-3 text-sm font-bold text-slate-800">
        {title}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>

    </div>
  );
}

function WorkflowArrow() {
  return (
    <div className="hidden items-center justify-center md:flex">
      <span className="text-lg font-bold text-slate-300">
        →
      </span>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-100 bg-slate-50 px-3 py-3">

      <span className="text-xs font-medium text-slate-500">
        {label}
      </span>

      <span className="text-xs font-semibold text-slate-800">
        {value}
      </span>

    </div>
  );
}
