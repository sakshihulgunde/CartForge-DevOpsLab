import { cn } from '@/lib/utils';
import type { ModuleKey } from '@/types';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Cloud,
  Terminal,
  GitBranch,
  Workflow,
  Box,
  Ship,
  Layers,
  Activity,
  FileBarChart,
  BookOpen,
  Settings,
  Shield,
  LogOut,
  ChevronLeft,
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  key: ModuleKey;
  label: string;
  icon: typeof LayoutDashboard;
  group: 'overview' | 'modules' | 'system';
  status?: 'active' | 'planned' | 'next';
}

const NAV: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'overview', status: 'active' },
  { key: 'aws', label: 'AWS', icon: Cloud, group: 'modules', status: 'next' },
  { key: 'linux', label: 'Linux', icon: Terminal, group: 'modules', status: 'next' },
  { key: 'github', label: 'GitHub', icon: GitBranch, group: 'modules', status: 'next' },
  { key: 'jenkins', label: 'Jenkins', icon: Workflow, group: 'modules', status: 'active' },
  { key: 'docker', label: 'Docker', icon: Box, group: 'modules', status: 'planned' },
  { key: 'kubernetes', label: 'Kubernetes', icon: Ship, group: 'modules', status: 'planned' },
  { key: 'terraform', label: 'Terraform', icon: Layers, group: 'modules', status: 'planned' },
  { key: 'monitoring', label: 'Monitoring', icon: Activity, group: 'modules', status: 'planned' },
  { key: 'reports', label: 'Reports', icon: FileBarChart, group: 'system', status: 'active' },
  { key: 'documentation', label: 'Documentation', icon: BookOpen, group: 'system', status: 'active' },
  { key: 'settings', label: 'Settings', icon: Settings, group: 'system', status: 'active' },
];

const GROUP_LABELS: Record<string, string> = {
  overview: 'Overview',
  modules: 'DevOps Modules',
  system: 'System',
};

export default function Sidebar({
  current,
  onNavigate,
}: {
  current: ModuleKey;
  onNavigate: (k: ModuleKey) => void;
}) {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const groups = ['overview', 'modules', 'system'] as const;

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-border bg-ink-900/80 backdrop-blur-xl transition-all duration-200',
        collapsed ? 'w-[68px]' : 'w-64',
      )}
    >
      {/* Brand */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 shadow-lg shadow-primary-600/30">
          <Shield size={18} className="text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">DevOps Platform</p>
            <p className="truncate text-[10px] text-ink-500">Automation Control Plane</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="ml-auto rounded-md p-1 text-ink-500 hover:bg-ink-800 hover:text-ink-300"
          aria-label="Toggle sidebar"
        >
          <ChevronLeft size={16} className={cn('transition-transform', collapsed && 'rotate-180')} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {groups.map((g) => (
          <div key={g} className="mb-5">
            {!collapsed && (
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-ink-600">
                {GROUP_LABELS[g]}
              </p>
            )}
            <div className="space-y-0.5">
              {NAV.filter((n) => n.group === g).map((item) => {
                const Icon = item.icon;
                const active = current === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => onNavigate(item.key)}
                    className={cn(
                      'group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all',
                      active
                        ? 'bg-primary-600/15 text-primary-300'
                        : 'text-ink-400 hover:bg-ink-800/60 hover:text-ink-200',
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r bg-primary-500" />
                    )}
                    <Icon size={18} className="shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {!collapsed && item.status === 'active' && item.key !== 'dashboard' && item.group !== 'system' && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-success-400" />
                    )}
                    {!collapsed && item.status === 'planned' && (
                      <span className="ml-auto rounded bg-ink-800 px-1.5 py-0.5 text-[9px] font-medium text-ink-500">
                        SOON
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-border p-3">
        <div className={cn('flex items-center gap-3 rounded-lg p-2', !collapsed && 'hover:bg-ink-800/60')}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-xs font-semibold text-white">
            {user?.avatar}
          </div>
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-ink-200">{user?.name}</p>
                <p className="truncate text-[10px] text-ink-500">{user?.role}</p>
              </div>
              <button
                onClick={logout}
                className="rounded-md p-1.5 text-ink-500 hover:bg-error-500/10 hover:text-error-400"
                title="Sign out"
              >
                <LogOut size={15} />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
