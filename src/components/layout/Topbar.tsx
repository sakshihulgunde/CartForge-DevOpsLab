import { useAuth } from '@/context/AuthContext';
import { Search, Bell, Command, Activity, ChevronRight } from 'lucide-react';
import type { ModuleKey } from '@/types';

const TITLES: Record<ModuleKey, { title: string; crumb: string }> = {

  dashboard: { title: 'Dashboard', crumb: 'Overview' },
  aws: { title: 'AWS Infrastructure', crumb: 'Cloud' },
  linux: { title: 'Linux Servers', crumb: 'Compute' },
  github: { title: 'GitHub Repositories', crumb: 'Source Control' },
  jenkins: { title: 'Jenkins', crumb: 'CI/CD' },
  docker: { title: 'Docker', crumb: 'Containerization' },
  kubernetes: { title: 'Kubernetes', crumb: 'Container Orchestration' },
  terraform: { title: 'Terraform', crumb: 'Infrastructure as Code' },
	automation: { title: 'Automation', crumb: 'Automation Scripts' },
	apache: { title: 'Apache', crumb: 'Web Server' },
    monitoring: { title: 'Monitoring', crumb: 'Observability' },
  reports: { title: 'Reports', crumb: 'Analytics' },
  documentation: { title: 'Documentation', crumb: 'Docs' },
  settings: { title: 'Settings', crumb: 'Configuration' },
};

export default function Topbar({ current }: { current: ModuleKey }) {
  const { user } = useAuth();
  const meta = TITLES[current];

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border bg-ink-950/80 px-6 backdrop-blur-xl">
      <div className="flex items-center gap-2 text-xs text-ink-500">
        <span>Platform</span>
        <ChevronRight size={12} />
        <span className="text-ink-300">{meta.crumb}</span>
        <ChevronRight size={12} />
        <span className="font-medium text-white">{meta.title}</span>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-lg border border-border bg-ink-900/60 px-3 py-1.5 text-sm text-ink-400 md:flex">
          <Search size={15} />
          <span className="text-xs">Search...</span>
          <span className="ml-4 flex items-center gap-0.5 rounded border border-border px-1 text-[10px] text-ink-500">
            <Command size={10} />K
          </span>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-success-500/20 bg-success-500/5 px-3 py-1.5 text-xs text-success-400">
          <span className="h-1.5 w-1.5 rounded-full bg-success-400 pulse-dot" />
          All systems operational
        </div>

        <button className="relative rounded-lg border border-border bg-ink-900/60 p-2 text-ink-400 hover:text-ink-200">
          <Bell size={16} />
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-error-500" />
        </button>

        <div className="hidden items-center gap-2 border-l border-border pl-3 lg:flex">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-xs font-semibold text-white">
            {user?.avatar}
          </div>
          <div className="text-xs">
            <p className="font-medium text-ink-200">{user?.name}</p>
            <p className="text-ink-500">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
