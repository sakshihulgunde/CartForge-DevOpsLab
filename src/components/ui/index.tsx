import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  AlertTriangle,
  Circle,
  MinusCircle,
} from 'lucide-react';
import type { BuildStatus, StageStatus, AgentStatus } from '@/types';

export function Badge({
  children,
  variant = 'neutral',
  className,
}: {
  children: ReactNode;
  variant?: 'neutral' | 'success' | 'warning' | 'error' | 'info' | 'running';
  className?: string;
}) {
  const styles: Record<string, string> = {
    neutral: 'bg-ink-800/60 text-ink-300 border-ink-700',
    success: 'bg-success-500/10 text-success-400 border-success-500/30',
    warning: 'bg-warning-500/10 text-warning-400 border-warning-500/30',
    error: 'bg-error-500/10 text-error-400 border-error-500/30',
    info: 'bg-primary-500/10 text-primary-300 border-primary-500/30',
    running: 'bg-accent-500/10 text-accent-400 border-accent-500/30',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        styles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatusIcon({ status, className }: { status: BuildStatus | StageStatus; className?: string }) {
  switch (status) {
    case 'success':
      return <CheckCircle2 className={cn('text-success-400', className)} size={16} />;
    case 'failed':
      return <XCircle className={cn('text-error-400', className)} size={16} />;
    case 'running':
      return <Loader2 className={cn('text-accent-400 animate-spin', className)} size={16} />;
    case 'queued':
    case 'pending':
      return <Clock className={cn('text-ink-400', className)} size={16} />;
    case 'aborted':
      return <MinusCircle className={cn('text-ink-400', className)} size={16} />;
    case 'unstable':
      return <AlertTriangle className={cn('text-warning-400', className)} size={16} />;
    case 'skipped':
      return <Circle className={cn('text-ink-600', className)} size={16} />;
    default:
      return <Circle className={cn('text-ink-400', className)} size={16} />;
  }
}

export function StatusBadge({ status }: { status: BuildStatus | StageStatus | AgentStatus | string }) {
  const map: Record<string, { variant: 'success' | 'error' | 'running' | 'neutral' | 'warning'; label: string }> = {
    success: { variant: 'success', label: 'Success' },
    failed: { variant: 'error', label: 'Failed' },
    running: { variant: 'running', label: 'Running' },
    queued: { variant: 'neutral', label: 'Queued' },
    pending: { variant: 'neutral', label: 'Pending' },
    aborted: { variant: 'neutral', label: 'Aborted' },
    unstable: { variant: 'warning', label: 'Unstable' },
    skipped: { variant: 'neutral', label: 'Skipped' },
    online: { variant: 'success', label: 'Online' },
    offline: { variant: 'error', label: 'Offline' },
    connecting: { variant: 'running', label: 'Connecting' },
    deployed: { variant: 'success', label: 'Deployed' },
    'in-progress': { variant: 'running', label: 'In Progress' },
  };
  const cfg = map[status] || { variant: 'neutral' as const, label: String(status) };
  return (
    <Badge variant={cfg.variant}>
      <StatusIcon status={status as BuildStatus} />
      {cfg.label}
    </Badge>
  );
}

export function Card({
  children,
  className,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-xl border border-border bg-panel/60 backdrop-blur-sm',
        onClick && 'cursor-pointer transition-colors hover:border-primary-500/40 hover:bg-panel-light/60',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  onClick,
  disabled,
  type = 'button',
}: {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
}) {
  const variants: Record<string, string> = {
    primary:
      'bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-600/20 disabled:opacity-40',
    secondary: 'bg-ink-800 hover:bg-ink-700 text-ink-100 border border-border',
    ghost: 'hover:bg-ink-800/60 text-ink-300',
    danger: 'bg-error-600 hover:bg-error-500 text-white',
    success: 'bg-success-600 hover:bg-success-500 text-white',
  };
  const sizes: Record<string, string> = {
    sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5',
    md: 'text-sm px-4 py-2 rounded-lg gap-2',
    lg: 'text-base px-5 py-2.5 rounded-lg gap-2',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-150 active:scale-[0.98]',
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {children}
    </button>
  );
}

export function StatCard({
  label,
  value,
  sub,
  icon,
  accent = 'primary',
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: ReactNode;
  accent?: 'primary' | 'success' | 'warning' | 'error' | 'accent';
}) {
  const colors: Record<string, string> = {
    primary: 'text-primary-400 bg-primary-500/10',
    success: 'text-success-400 bg-success-500/10',
    warning: 'text-warning-400 bg-warning-500/10',
    error: 'text-error-400 bg-error-500/10',
    accent: 'text-accent-400 bg-accent-500/10',
  };
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-ink-400">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
          {sub && <p className="mt-1 text-xs text-ink-400">{sub}</p>}
        </div>
        <div className={cn('rounded-lg p-2.5', colors[accent])}>{icon}</div>
      </div>
    </Card>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
      <div className="mb-4 rounded-xl bg-ink-800/60 p-4 text-ink-400">{icon}</div>
      <h3 className="text-base font-semibold text-ink-100">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-ink-400">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-semibold text-white">{title}</h1>
        {description && <p className="mt-1 text-sm text-ink-400">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
