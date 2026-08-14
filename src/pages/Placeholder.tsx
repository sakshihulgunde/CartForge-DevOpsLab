import { Card, PageHeader, Badge } from '@/components/ui';
import type { ModuleKey } from '@/types';
import {
  Cloud, Terminal, GitBranch, Box, Ship, Layers, Activity, Construction, CheckCircle2, Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

const MODULE_INFO: Partial<Record<ModuleKey, { icon: typeof Cloud; title: string; description: string; features: string[] }>> = {
  aws: {
    icon: Cloud,
    title: 'AWS Infrastructure',
    description: 'Manage EC2 instances, VPCs, security groups, and IAM resources.',
    features: ['EC2 instance dashboard', 'VPC & subnet visualization', 'Security group manager', 'IAM role browser'],
  },
  linux: {
    icon: Terminal,
    title: 'Linux Servers',
    description: 'Monitor and manage your fleet of Linux servers via SSH.',
    features: ['Server health metrics', 'SSH terminal access', 'Package management', 'Service control'],
  },
  github: {
    icon: GitBranch,
    title: 'GitHub Repositories',
    description: 'Browse repositories, branches, commits, and webhook configurations.',
    features: ['Repository browser', 'Branch & commit history', 'Pull request status', 'Webhook management'],
  },
  docker: {
    icon: Box,
    title: 'Docker',
    description: 'Build, tag, and push container images. Manage registries.',
    features: ['Image build pipelines', 'Registry browser (ECR/Nexus)', 'Container lifecycle', 'Dockerfile management'],
  },
  kubernetes: {
    icon: Ship,
    title: 'Kubernetes',
    description: 'Deploy and manage workloads on Kubernetes clusters.',
    features: ['Cluster overview', 'Pod & deployment status', 'Service & ingress management', 'kubectl integration'],
  },
  terraform: {
    icon: Layers,
    title: 'Terraform',
    description: 'Infrastructure as Code - plan, apply, and manage state.',
    features: ['Workspace management', 'Plan & apply workflows', 'State file browser', 'Module registry'],
  },
  monitoring: {
    icon: Activity,
    title: 'Monitoring',
    description: 'Prometheus metrics and Grafana dashboards unified.',
    features: ['Prometheus targets', 'Grafana dashboard embeds', 'Alert manager rules', 'Log aggregation'],
  },
};

export default function ComingSoon({ module }: { module: ModuleKey }) {
  const info = MODULE_INFO[module];
  if (!info) return null;
  const Icon = info.icon;

  return (
    <div className="space-y-6">
      <PageHeader title={info.title} description={info.description} />

      <Card className="overflow-hidden">
        <div className="relative p-12 text-center">
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />
          <div className="relative">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 border border-border">
              <Icon size={32} className="text-primary-400" />
            </div>
            <h2 className="mt-5 text-lg font-semibold text-white">{info.title}</h2>
            <p className="mt-1 max-w-md mx-auto text-sm text-ink-400">{info.description}</p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-lg border border-warning-500/30 bg-warning-500/10 px-4 py-2 text-sm text-warning-400">
              <Construction size={16} />
              Coming in a future module
            </div>
          </div>
        </div>
      </Card>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-ink-400">Planned Features</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {info.features.map((f, i) => (
            <Card key={f} className="flex items-center gap-3 p-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-800 text-ink-500">
                {i === 0 ? <Clock size={16} /> : <CheckCircle2 size={16} className="text-ink-600" />}
              </div>
              <span className="text-sm text-ink-300">{f}</span>
              <Badge variant="neutral" className="ml-auto">Planned</Badge>
            </Card>
          ))}
        </div>
      </div>

      <Card className="p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary-500/10 p-2.5 text-primary-400"><Activity size={18} /></div>
          <div>
            <p className="text-sm font-medium text-ink-100">Module Roadmap</p>
            <p className="text-xs text-ink-400">This module will be implemented as you progress through your DevOps training. The Jenkins module is the current focus.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export function DocumentationPage(): ReactNode {
  return (
    <div className="space-y-6">
      <PageHeader title="Documentation" description="Architecture, API reference, and operational guides." />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-3 text-sm font-semibold text-white">Architecture Overview</h3>
          <pre className="overflow-x-auto rounded-lg bg-ink-950/80 p-4 font-mono text-[11px] leading-relaxed text-ink-400">
{`┌─────────────────────────────────────────────────┐
│              React + TypeScript + Tailwind       │
│                   Frontend (SPA)                 │
└───────────────────┬─────────────────────────────┘
                    │ REST API (JWT Auth)
┌───────────────────▼─────────────────────────────┐
│           Node.js + Express (MVC)                │
│                    Backend                       │
├─────────┬───────────┬───────────┬───────────────┤
│ Jenkins │   AWS     │  GitHub   │   Monitoring  │
│   API   │   SDK     │   API     │    (Prom)     │
└────┬────┴─────┬─────┴─────┬─────┴───────┬───────┘
     │          │           │             │
┌────▼────┐ ┌───▼───┐ ┌─────▼─────┐ ┌────▼─────┐
│ Jenkins │ │  EC2  │ │  GitHub   │ │Prometheus│
│ Server  │ │  S3   │ │  Repos    │ │ Grafana  │
└─────────┘ └───────┘ └───────────┘ └──────────┘
     │
┌────▼────────────────┐
│   MongoDB (Atlas)   │
│   Users, Pipelines, │
│   Builds, Artifacts │
└─────────────────────┘`}
          </pre>
        </Card>

        <Card className="p-5">
          <h3 className="mb-3 text-sm font-semibold text-white">REST API Endpoints</h3>
          <div className="space-y-2 text-xs">
            {[
              { m: 'POST', e: '/api/auth/login', d: 'Authenticate user, returns JWT' },
              { m: 'GET', e: '/api/jenkins/status', d: 'Jenkins server status' },
              { m: 'GET', e: '/api/jenkins/pipelines', d: 'List all pipelines' },
              { m: 'POST', e: '/api/jenkins/pipelines', d: 'Create a pipeline' },
              { m: 'POST', e: '/api/jenkins/build/:name', d: 'Trigger a build' },
              { m: 'GET', e: '/api/jenkins/build/:id/logs', d: 'Console output (SSE)' },
              { m: 'GET', e: '/api/jenkins/agents', d: 'List build agents' },
              { m: 'GET', e: '/api/jenkins/plugins', d: 'Installed plugins' },
              { m: 'GET', e: '/api/jenkins/credentials', d: 'Credentials (masked)' },
              { m: 'GET', e: '/api/jenkins/artifacts', d: 'Build artifacts' },
              { m: 'GET', e: '/api/deployments', d: 'AWS deployment history' },
              { m: 'GET', e: '/api/reports/pipelines', d: 'Pipeline analytics' },
            ].map((r) => (
              <div key={r.e} className="flex items-center gap-3 rounded-lg border border-border bg-ink-900/40 p-2.5">
                <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-bold', r.m === 'GET' ? 'bg-primary-500/15 text-primary-300' : 'bg-success-500/15 text-success-300')}>{r.m}</span>
                <code className="font-mono text-ink-200">{r.e}</code>
                <span className="ml-auto text-ink-500">{r.d}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="mb-3 text-sm font-semibold text-white">Jenkinsfile (Declarative)</h3>
          <pre className="overflow-x-auto rounded-lg bg-ink-950/80 p-4 font-mono text-[11px] leading-relaxed text-ink-300">
{`pipeline {
  agent { label 'docker' }
  tools { nodejs 'Node 20' }

  environment {
    AWS_REGION = 'us-east-1'
    S3_BUCKET  = 'devops-artifacts'
  }

  stages {
    stage('Checkout SCM') {
      steps { checkout scm }
    }
    stage('Install Dependencies') {
      steps { sh 'npm ci' }
    }
    stage('Build') {
      steps { sh 'npm run build' }
    }
    stage('Test') {
      steps { sh 'npm run test -- --coverage' }
    }
    stage('Package') {
      steps {
        sh 'tar -czf app-\${BUILD_NUMBER}.tar.gz dist/'
        s3Upload(bucket: S3_BUCKET, path: "app-\${BUILD_NUMBER}.tar.gz", file: "app-\${BUILD_NUMBER}.tar.gz")
      }
    }
    stage('Deploy to EC2') {
      steps {
        sshAgent(['ec2-ssh-key']) {
          sh './scripts/deploy-to-ec2.sh \${BUILD_NUMBER}'
        }
      }
    }
  }
  post {
    success { slackSend channel: '#deploys', message: "Build #\${BUILD_NUMBER} deployed" }
    failure { slackSend channel: '#alerts', message: "Build #\${BUILD_NUMBER} failed" }
  }
}`}
          </pre>
        </Card>

        <Card className="p-5">
          <h3 className="mb-3 text-sm font-semibold text-white">Folder Structure</h3>
          <pre className="overflow-x-auto rounded-lg bg-ink-950/80 p-4 font-mono text-[11px] leading-relaxed text-ink-400">
{`devops-platform/
├── frontend/              # React + TS + Tailwind
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Module views
│   │   ├── context/       # Auth & global state
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # Utilities
│   │   └── types/         # TypeScript types
│   └── package.json
├── backend/               # Node.js + Express (MVC)
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── models/        # MongoDB schemas
│   │   ├── routes/        # Express routes
│   │   ├── middleware/    # JWT auth, errors
│   │   └── services/      # Jenkins/AWS/GitHub
│   └── package.json
├── jenkins/               # Jenkinsfiles
│   ├── Jenkinsfile
│   └── deploy/Jenkinsfile
├── scripts/               # Shell scripts
│   └── deploy-to-ec2.sh
├── docker/                # (upcoming)
├── k8s/                   # (upcoming)
├── terraform/             # (upcoming)
└── README.md`}
          </pre>
        </Card>
      </div>
    </div>
  );
}

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Platform configuration and preferences." />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-4 text-sm font-semibold text-white">Jenkins Connection</h3>
          <div className="space-y-3 text-sm">
            <SettingRow label="Controller URL" value="https://jenkins.devops-platform.io" />
            <SettingRow label="Username" value="admin" />
            <SettingRow label="API Token" value="••••••••••••••••" />
            <SettingRow label="Connection Status" value="Connected" highlight="success" />
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 text-sm font-semibold text-white">AWS Configuration</h3>
          <div className="space-y-3 text-sm">
            <SettingRow label="Region" value="us-east-1" />
            <SettingRow label="Access Key" value="AKIA••••••••••" />
            <SettingRow label="Secret Key" value="••••••••••••••••" />
            <SettingRow label="S3 Artifact Bucket" value="devops-artifacts" />
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 text-sm font-semibold text-white">GitHub Integration</h3>
          <div className="space-y-3 text-sm">
            <SettingRow label="Organization" value="devops-platform" />
            <SettingRow label="Token Type" value="Personal Access Token" />
            <SettingRow label="Scopes" value="repo, admin:repo_hook" />
            <SettingRow label="Webhook Secret" value="Configured" highlight="success" />
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 text-sm font-semibold text-white">Notifications</h3>
          <div className="space-y-3 text-sm">
            <ToggleRow label="Build failure alerts" enabled />
            <ToggleRow label="Deployment notifications" enabled />
            <ToggleRow label="Agent offline warnings" enabled />
            <ToggleRow label="Daily reports digest" enabled={false} />
          </div>
        </Card>
      </div>
    </div>
  );
}

function SettingRow({ label, value, highlight }: { label: string; value: string; highlight?: 'success' }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2 last:border-0">
      <span className="text-ink-400">{label}</span>
      <span className={cn('font-medium', highlight === 'success' ? 'text-success-400' : 'text-ink-200')}>{value}</span>
    </div>
  );
}

function ToggleRow({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2 last:border-0">
      <span className="text-ink-400">{label}</span>
      <span className={cn('relative h-5 w-9 rounded-full transition-colors', enabled ? 'bg-primary-600' : 'bg-ink-700')}>
        <span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform', enabled ? 'left-4' : 'left-0.5')} />
      </span>
    </div>
  );
}
