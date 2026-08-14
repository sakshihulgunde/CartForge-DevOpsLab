import { useState } from 'react';
import { cn } from '@/lib/utils';

export interface TabItem {
  key: string;
  label: string;
  icon?: React.ComponentType<{ size?: number }>;
  badge?: number;
}

export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: TabItem[];
  active: string;
  onChange: (k: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 border-b border-border">
      {tabs.map((t) => {
        const isActive = active === t.key;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={cn(
              'relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors',
              isActive ? 'text-primary-300' : 'text-ink-400 hover:text-ink-200',
            )}
          >
            {t.icon && <t.icon size={15} />}
            {t.label}
            {t.badge !== undefined && t.badge > 0 && (
              <span className="rounded-full bg-ink-800 px-1.5 text-[10px] text-ink-400">{t.badge}</span>
            )}
            {isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t bg-primary-500" />}
          </button>
        );
      })}
    </div>
  );
}

export function useTabs(initial: string) {
  const [active, setActive] = useState(initial);
  return { active, setActive };
}
