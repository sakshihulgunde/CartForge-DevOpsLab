import { useCallback, useEffect, useRef, useState } from 'react';
import type { BuildRecord, PipelineStage, StageStatus } from '@/types';
import { PIPELINE_STAGES_TEMPLATE } from '@/data/jenkinsData';

const STAGE_LOG_TEMPLATES: Record<string, string[]> = {
  'Checkout SCM': [
    '[Pipeline] Start of Pipeline',
    'Selected Git installation: /usr/bin/git',
    'Cloning repository https://github.com/devops-platform/frontend-dashboard.git',
    'Cloning into /var/jenkins/workspace/frontend-react-app...',
    'Fetching upstream changes from origin',
    'Checking out revision a3f9c21 (main)',
    '[Pipeline] { (Checkout SCM) }',
    'Commit message: "feat: add real-time pipeline stage view"',
    '[Pipeline] End of Checkout SCM',
  ],
  'Install Dependencies': [
    '[Pipeline] { (Install Dependencies) }',
    'Using NodeJS 20.11.1',
    '$ npm ci',
    'npm warn deprecated some-package@1.2.3',
    'added 1248 packages in 18s',
    '148 packages are looking for funding',
    '[Pipeline] End of Install Dependencies',
  ],
  'Build': [
    '[Pipeline] { (Build) }',
    '$ npm run build',
    '> frontend-dashboard@1.4.2 build',
    '> vite build',
    'vite v8.2.0 building for production...',
    'transforming 312 modules...',
    '✓ 312 modules transformed',
    'dist/assets/index-9f2a.js    412.55 kB │ gzip: 130.2 kB',
    'dist/assets/style-c81d.css    88.10 kB │ gzip: 14.2 kB',
    '✓ built in 4.21s',
    '[Pipeline] End of Build',
  ],
  'Test': [
    '[Pipeline] { (Test) }',
    '$ npm run test -- --coverage',
    'PASS  src/__tests__/auth.test.ts',
    'PASS  src/__tests__/pipeline.test.ts',
    'PASS  src/__tests__/api.test.ts',
    'Tests: 42 passed, 42 total',
    'Coverage: 87.4% statements',
    '[Pipeline] End of Test',
  ],
  'Package': [
    '[Pipeline] { (Package) }',
    '$ tar -czf frontend-dashboard-1.4.2.tar.gz dist/',
    'Archiving 48 files...',
    'Uploading artifact to S3: s3://devops-artifacts/frontend-dashboard-1.4.2.tar.gz',
    'upload: ./frontend-dashboard-1.4.2.tar.gz to s3://devops-artifacts/frontend-dashboard-1.4.2.tar.gz',
    '[Pipeline] End of Package',
  ],
  'Deploy to EC2': [
    '[Pipeline] { (Deploy to EC2) }',
    'SSH connecting to ec2-user@10.0.3.42 (prod-web-01)',
    'Downloading artifact from S3...',
    'Extracting to /var/www/html/',
    'Backing up previous release to /var/www/releases/1.4.1/',
    'Restarting Apache: sudo systemctl restart httpd',
    '✔ httpd.service - The Apache HTTP Server  active (running)',
    'Health check: GET https://app.devops-platform.io/health -> 200 OK',
    '[Pipeline] End of Deploy to EC2',
    '[Pipeline] End of Pipeline',
    'Finished: SUCCESS',
  ],
};

const DURATIONS = ['6s', '18s', '42s', '12s', '8s', '1m 12s'];

export interface LiveBuildState {
  build: BuildRecord | null;
  isRunning: boolean;
  start: (pipelineName: string) => void;
  stop: () => void;
  stageProgress: number;
}

export function useLiveBuild(): LiveBuildState {
  const [build, setBuild] = useState<BuildRecord | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const stop = useCallback(() => {
    clearTimers();
    setIsRunning(false);
    setBuild((prev) => {
      if (!prev) return prev;
      const stages = prev.stages.map((s) =>
        s.status === 'running' ? { ...s, status: 'failed' as StageStatus } : s,
      );
      return { ...prev, status: 'aborted', stages, duration: '0m ' + Math.floor(Math.random() * 50) + 's' };
    });
  }, []);

  const start = useCallback((pipelineName: string) => {
    clearTimers();
    const number = 188 + Math.floor(Math.random() * 10);
    const newBuild: BuildRecord = {
      id: 'live-' + Date.now(),
      number,
      pipeline: pipelineName,
      status: 'running',
      branch: 'main',
      commit: Math.random().toString(16).slice(2, 9),
      author: 'You',
      message: 'Triggered from DevOps Platform dashboard',
      duration: 'running',
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
      triggeredBy: 'manual',
      stages: PIPELINE_STAGES_TEMPLATE('queued'),
    };
    setBuild(newBuild);
    setIsRunning(true);

    const stages = newBuild.stages;
    let elapsed = 0;
    const stepDelay = 2200;

    stages.forEach((stage, idx) => {
      const t = setTimeout(() => {
        setBuild((prev) => {
          if (!prev) return prev;
          const updated = prev.stages.map((s, i) => {
            if (i === idx) return { ...s, status: 'running' as StageStatus };
            return s;
          });
          return { ...prev, stages: updated };
        });

        const logLines = STAGE_LOG_TEMPLATES[stage.name] || ['Running ' + stage.name];
        const lineDelay = Math.max(180, stepDelay / logLines.length);
        logLines.forEach((line, li) => {
          const lt = setTimeout(() => {
            setBuild((prev) => {
              if (!prev) return prev;
              const updated = prev.stages.map((s, i) => {
                if (i === idx) return { ...s, logs: [...s.logs, line] };
                return s;
              });
              return { ...prev, stages: updated };
            });
          }, li * lineDelay);
          timers.current.push(lt);
        });

        const finishDelay = logLines.length * lineDelay + 600;
        const ft = setTimeout(() => {
          setBuild((prev) => {
            if (!prev) return prev;
            const updated = prev.stages.map((s, i) =>
              i === idx ? { ...s, status: 'success' as StageStatus, duration: DURATIONS[idx] || '10s' } : s,
            );
            elapsed += stepDelay;
            const done = updated.every((s) => s.status === 'success');
            return {
              ...prev,
              stages: updated,
              status: done ? 'success' : 'running',
              duration: done ? '2m ' + Math.floor(Math.random() * 30) + 's' : 'running',
            };
          });
        }, finishDelay);
        timers.current.push(ft);
      }, elapsed);
      timers.current.push(t);
      elapsed += stepDelay;
    });
  }, []);

  useEffect(() => () => clearTimers(), []);

  const stageProgress = build
    ? Math.round((build.stages.filter((s) => s.status === 'success').length / build.stages.length) * 100)
    : 0;

  return { build, isRunning, start, stop, stageProgress };
}
