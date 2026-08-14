import { useEffect, useRef, useState } from 'react';
import { Card, StatusBadge, Button, Badge, EmptyState, PageHeader } from '@/components/ui';
import { PIPELINES, PIPELINE_STAGES_TEMPLATE } from '@/data/jenkinsData';
import { useLiveBuild } from '@/hooks/useLiveBuild';
import {
  Play, Square, RotateCcw, Terminal, CheckCircle2, Loader2, Clock,
  GitBranch, ChevronRight, Zap, Activity, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PipelineStage, StageStatus, BuildStatus, ModuleKey } from '@/types';

export default function PipelineExecution({
  initialPipeline,
  triggerBuild,
  onNavigate,
}: {
  initialPipeline?: string;
  triggerBuild: { name: string; n: number } | null;
  onNavigate: (k: ModuleKey, tab?: string) => void;
}) {
  const { build, isRunning, start, stop, stageProgress } = useLiveBuild();
  const [selectedPipeline, setSelectedPipeline] = useState(initialPipeline || PIPELINES[0].name);
  const consoleRef = useRef<HTMLDivElement>(null);

  // External build trigger
  useEffect(() => {
    if (triggerBuild && triggerBuild.n > 0) {
      setSelectedPipeline(triggerBuild.name);
      start(triggerBuild.name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerBuild?.n]);

  // Auto-scroll console
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [build?.stages]);

  const allLogs: string[] = build ? build.stages.flatMap((s) => s.logs) : [];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Pipeline Execution"
        description="Live stage-by-stage pipeline execution with real-time console output."
        actions={
          <>
            <select
              value={selectedPipeline}
              onChange={(e) => setSelectedPipeline(e.target.value)}
              disabled={isRunning}
              className="rounded-lg border border-border bg-ink-900/60 px-3 py-2 text-sm text-white outline-none focus:border-primary-500 disabled:opacity-50"
            >
              {PIPELINES.map((p) => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
            {!isRunning ? (
              <Button variant="success" onClick={() => start(selectedPipeline)}>
                <Play size={16} /> Build Now
              </Button>
            ) : (
              <Button variant="danger" onClick={stop}>
                <Square size={16} /> Stop Build
              </Button>
            )}
            <Button variant="secondary" onClick={() => start(selectedPipeline)} disabled={isRunning}>
              <RotateCcw size={16} /> Replay
            </Button>
          </>
        }
      />

      {!build ? (
        <EmptyState
          icon={<Activity size={28} />}
          title="No active build"
          description={`Select a pipeline and click "Build Now" to watch stages execute in real time with live console output.`}
          action={<Button variant="success" onClick={() => start(selectedPipeline)}><Play size={16} /> Start Build</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          {/* Stage view */}
          <div className="space-y-4 lg:col-span-3">
            <Card className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-semibold text-white">Build #{build.number}</h3>
                  <StatusBadge status={build.status} />
                </div>
                <div className="flex items-center gap-3 text-xs text-ink-400">
                  <span className="flex items-center gap-1"><GitBranch size={12} /> {build.branch}</span>
                  <span className="font-mono text-primary-400">{build.commit}</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {build.duration}</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-5">
                <div className="flex justify-between text-xs">
                  <span className="text-ink-400">Progress</span>
                  <span className="font-medium text-ink-200">{stageProgress}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink-800">
                  <div
                    className={cn('h-full rounded-full transition-all duration-500', isRunning ? 'bg-accent-500' : build.status === 'success' ? 'bg-success-500' : 'bg-error-500')}
                    style={{ width: `${stageProgress}%` }}
                  />
                </div>
              </div>

              {/* Stage timeline */}
              <div className="space-y-0">
                {build.stages.map((stage, idx) => (
                  <StageRow key={stage.id} stage={stage} isLast={idx === build.stages.length - 1} />
                ))}
              </div>
            </Card>

            {/* Pipeline metadata */}
            <Card className="p-5">
              <h3 className="mb-3 text-sm font-semibold text-white">Build Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <Detail label="Pipeline" value={build.pipeline} />
                <Detail label="Triggered By" value={build.triggeredBy} />
                <Detail label="Author" value={build.author} />
                <Detail label="Commit Message" value={build.message} />
                <Detail label="Started" value={build.timestamp} />
                <Detail label="Duration" value={build.duration} />
              </div>
            </Card>
          </div>

          {/* Console output */}
          <div className="lg:col-span-2">
            <Card className="flex h-full flex-col overflow-hidden">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="flex items-center gap-2">
                  <Terminal size={15} className="text-accent-400" />
                  <h3 className="text-sm font-semibold text-white">Console Output</h3>
                </div>
                {isRunning && (
                  <Badge variant="running">
                    <Loader2 size={12} className="animate-spin" /> Auto-refreshing
                  </Badge>
                )}
              </div>
              <div
                ref={consoleRef}
                className="flex-1 overflow-y-auto bg-ink-950/80 p-4 font-mono text-xs leading-relaxed"
                style={{ maxHeight: '560px', minHeight: '400px' }}
              >
                {allLogs.length === 0 ? (
                  <p className="text-ink-600">Waiting for build output...</p>
                ) : (
                  allLogs.map((line, i) => <ConsoleLine key={i} line={line} index={i} />)
                )}
                {isRunning && <span className="inline-block h-3.5 w-2 animate-pulse bg-accent-400 align-middle" />}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

function StageRow({ stage, isLast }: { stage: PipelineStage; isLast: boolean }) {
  const icon = getStageIcon(stage.status);
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border',
            stageBg(stage.status),
          )}
        >
          {icon}
        </div>
        {!isLast && <div className={cn('w-px flex-1', stage.status === 'success' ? 'bg-success-500/40' : 'bg-border')} />}
      </div>
      <div className="flex-1 pb-4">
        <div className="flex items-center justify-between">
          <span className={cn('text-sm font-medium', stage.status === 'pending' ? 'text-ink-500' : 'text-ink-100')}>
            {stage.name}
          </span>
          <div className="flex items-center gap-2">
            {stage.duration && <span className="text-xs text-ink-400">{stage.duration}</span>}
            <StatusBadge status={stage.status} />
          </div>
        </div>
        {stage.status === 'running' && (
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-ink-800">
            <div className="h-full w-1/2 rounded-full bg-accent-500 shimmer" />
          </div>
        )}
        {stage.logs.length > 0 && (
          <div className="mt-2 max-h-20 overflow-y-auto rounded-md bg-ink-950/60 p-2 font-mono text-[11px] text-ink-400">
            {stage.logs.slice(-2).map((l, i) => <div key={i}>{l}</div>)}
          </div>
        )}
      </div>
    </div>
  );
}

function ConsoleLine({ line, index }: { line: string; index: number }) {
  let color = 'text-ink-300';
  if (line.includes('SUCCESS') || line.includes('passed') || line.includes('✓')) color = 'text-success-400';
  if (line.includes('ERROR') || line.includes('FAIL') || line.includes('failed')) color = 'text-error-400';
  if (line.includes('Pipeline') || line.includes('$ ')) color = 'text-primary-300';
  if (line.includes('warn')) color = 'text-warning-400';
  return (
    <div className={cn('whitespace-pre-wrap', color)}>
      <span className="mr-3 select-none text-ink-700">{String(index + 1).padStart(3, '0')}</span>
      {line}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-ink-500">{label}</p>
      <p className="mt-0.5 truncate font-medium text-ink-200">{value}</p>
    </div>
  );
}

function getStageIcon(status: StageStatus | BuildStatus) {
  switch (status) {
    case 'success': return <CheckCircle2 size={16} className="text-success-400" />;
    case 'failed': return <X size={16} className="text-error-400" />;
    case 'running': return <Loader2 size={16} className="animate-spin text-accent-400" />;
    case 'skipped': return <ChevronRight size={16} className="text-ink-600" />;
    default: return <Clock size={16} className="text-ink-500" />;
  }
}

function stageBg(status: StageStatus): string {
  switch (status) {
    case 'success': return 'border-success-500/30 bg-success-500/10';
    case 'failed': return 'border-error-500/30 bg-error-500/10';
    case 'running': return 'border-accent-500/40 bg-accent-500/10';
    case 'skipped': return 'border-border bg-ink-800/40';
    default: return 'border-border bg-ink-900/40';
  }
}
