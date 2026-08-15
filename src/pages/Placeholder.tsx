import { Card, PageHeader, Badge } from '@/components/ui';
import type { ModuleKey } from '@/types';
import {
  Cloud,
  Terminal,
  GitBranch,
  Activity,
  Construction,
  CheckCircle2,
  Clock,
  Server,
  Workflow,
  FileCode2,
  Globe,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

/*
 * These are the modules that are actually part of the
 * current CartForge DevOps project.
 *
 * Docker, Kubernetes and Terraform have intentionally been removed.
 */

const MODULE_INFO: Partial<
  Record<
    ModuleKey,
    {
      icon: typeof Cloud;
      title: string;
      description: string;
      features: string[];
    }
  >
> = {
  aws: {
    icon: Cloud,
    title: 'AWS Infrastructure',
    description:
      'AWS infrastructure used to host and deploy the CartForge application.',
    features: [
      'EC2 instance hosting',
      'Security group configuration',
      'Public IP based application access',
      'Apache web server deployment',
    ],
  },

  linux: {
  icon: Terminal,
  title: 'Linux Server',
  description:
    'Ubuntu Linux server used to host, manage, monitor and deploy the CartForge application.',
  features: [
    'Ubuntu 26.04 LTS EC2 server',
    'Linux command-line administration',
    'Git, Node.js and npm installation',
    'Apache2 service management',
    'Server health monitoring',
    'Log monitoring and troubleshooting',
    'Website backup automation',
  ],
},
  github: {
    icon: GitBranch,
    title: 'GitHub Repository',
    description:
      'Git and GitHub are used for source-code management and CI/CD triggering.',
    features: [
      'CartForge source repository',
      'Git version control',
      'Main branch integration',
      'GitHub webhook integration',
    ],
  },

  monitoring: {
    icon: Activity,
    title: 'Monitoring',
    description:
      'Basic monitoring and troubleshooting of the application server and Jenkins builds.',
    features: [
      'Jenkins build status',
      'Apache service status',
      'Server health checks',
      'Build and deployment troubleshooting',
    ],
  },
};

/* -------------------------------------------------------
 * Module placeholder / overview page
 * ----------------------------------------------------- */

export default function ComingSoon({ module }: { module: ModuleKey }) {
  const info = MODULE_INFO[module];

  if (!info) return null;

  const Icon = info.icon;

  return (
    <div className="space-y-6">
      <PageHeader
        title={info.title}
        description={info.description}
      />

      <Card className="overflow-hidden">
        <div className="relative p-12 text-center">
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />

          <div className="relative">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-gradient-to-br from-primary-500/20 to-accent-500/20">
              <Icon size={32} className="text-primary-400" />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-white">
              {info.title}
            </h2>

            <p className="mx-auto mt-1 max-w-md text-sm text-ink-400">
              {info.description}
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-lg border border-success-500/30 bg-success-500/10 px-4 py-2 text-sm text-success-400">
              <CheckCircle2 size={16} />
              Project module configured
            </div>
          </div>
        </div>
      </Card>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-ink-400">
          Implemented Features
        </h3>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {info.features.map((feature, index) => (
            <Card
              key={feature}
              className="flex items-center gap-3 p-4"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-800 text-success-400">
                {index === 0 ? (
                  <Clock size={16} />
                ) : (
                  <CheckCircle2 size={16} />
                )}
              </div>

              <span className="text-sm text-ink-300">
                {feature}
              </span>

              <Badge
                variant="neutral"
                className="ml-auto"
              >
                Active
              </Badge>
            </Card>
          ))}
        </div>
      </div>

      <Card className="p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary-500/10 p-2.5 text-primary-400">
            <Activity size={18} />
          </div>

          <div>
            <p className="text-sm font-medium text-ink-100">
              CartForge DevOps Project
            </p>

            <p className="text-xs text-ink-400">
              This module represents the technologies currently used in
              the CartForge project: AWS, Linux, GitHub, Jenkins and
              Apache deployment.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* -------------------------------------------------------
 * Documentation
 * ----------------------------------------------------- */

export function DocumentationPage(): ReactNode {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Documentation"
        description="CartForge DevOps project architecture, workflow and deployment documentation."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

        {/* Architecture */}
        <Card className="p-5">
          <h3 className="mb-3 text-sm font-semibold text-white">
            CartForge CI/CD Architecture
          </h3>

          <pre className="overflow-x-auto rounded-lg bg-ink-950/80 p-4 font-mono text-[11px] leading-relaxed text-ink-400">
{`Developer
   |
   | git push
   v
GitHub Repository
Cartforge-jenkins
   |
   | GitHub Webhook
   v
Jenkins
Freestyle Job
   |
   +----------------------+
   |                      |
   v                      v
Checkout Git          Build Process
                       |
                       +-- npm install
                       |
                       +-- npm run build
                       |
                       v
                    dist/
                       |
                       v
                  Apache Server
                       |
                       v
                    AWS EC2
                       |
                       v
               Live CartForge
                  Website`}
          </pre>
        </Card>

        {/* Technologies */}
        <Card className="p-5">
          <h3 className="mb-4 text-sm font-semibold text-white">
            Technologies Used
          </h3>

          <div className="space-y-3">

           <TechRow
  		icon={<GitBranch size={17} />}
 		 name="GitHub"
  		description="Source code repository"
		/>
            <TechRow
              icon={<Workflow size={17} />}
              name="Jenkins"
              description="CI/CD automation server"
            />

            <TechRow
              icon={<Cloud size={17} />}
              name="AWS EC2"
              description="Cloud server hosting"
            />

            <TechRow
              icon={<Terminal size={17} />}
              name="Ubuntu Linux"
              description="Server operating system"
            />

            <TechRow
              icon={<Server size={17} />}
              name="Apache"
              description="Web server"
            />

            <TechRow
              icon={<FileCode2 size={17} />}
              name="React + TypeScript"
              description="CartForge frontend"
            />

            <TechRow
              icon={<Globe size={17} />}
              name="Vite"
              description="Frontend build tool"
            />
          </div>
        </Card>

        {/* Jenkins build process */}
        <Card className="p-5">
          <h3 className="mb-3 text-sm font-semibold text-white">
            Jenkins Build Process
          </h3>

          <pre className="overflow-x-auto rounded-lg bg-ink-950/80 p-4 font-mono text-[11px] leading-relaxed text-ink-300">
{`echo "===== CartForge Jenkins Build ====="

echo "Git version:"
git --version

echo "Node version:"
node --version

echo "npm version:"
npm --version

echo "===== Installing dependencies ====="
npm install

echo "===== Building CartForge ====="
npm run build

echo "===== Build completed successfully ====="`}
          </pre>
        </Card>

        {/* Deployment */}
        <Card className="p-5">
          <h3 className="mb-3 text-sm font-semibold text-white">
            Deployment Flow
          </h3>

          <div className="space-y-3 text-sm">

            <FlowStep
              number="01"
              title="GitHub Push"
              description="Developer pushes the latest CartForge code to the main branch."
            />

            <FlowStep
              number="02"
              title="Webhook Trigger"
              description="GitHub sends a push event to Jenkins."
            />

            <FlowStep
              number="03"
              title="Jenkins Checkout"
              description="Jenkins clones the latest commit from GitHub."
            />

            <FlowStep
              number="04"
              title="Install Dependencies"
              description="npm install installs the project dependencies."
            />

            <FlowStep
              number="05"
              title="Production Build"
              description="npm run build creates the Vite production build."
            />

            <FlowStep
              number="06"
              title="Apache Deployment"
              description="The generated website is served from /var/www/html on EC2."
            />

            <FlowStep
              number="07"
              title="Live Website"
              description="Users access the CartForge website through the EC2 public IP."
            />

          </div>
        </Card>

        {/* Project structure */}
        <Card className="p-5">
          <h3 className="mb-3 text-sm font-semibold text-white">
            CartForge Project Structure
          </h3>

          <pre className="overflow-x-auto rounded-lg bg-ink-950/80 p-4 font-mono text-[11px] leading-relaxed text-ink-400">
{`Cartforge-jenkins/
|
+-- project/
|   |
|   +-- src/
|   |   +-- components/
|   |   +-- pages/
|   |   +-- context/
|   |   +-- data/
|   |   +-- hooks/
|   |   +-- lib/
|   |   +-- types/
|   |   +-- App.tsx
|   |   +-- main.tsx
|   |   +-- index.css
|   |
|   +-- public/
|   |
|   +-- package.json
|   +-- package-lock.json
|   +-- vite.config.*
|   +-- tsconfig*.json
|   |
|   +-- dist/
|       Production build
|
+-- Jenkinsfile
+-- README.md`}
          </pre>
        </Card>

        {/* Commands */}
        <Card className="p-5">
          <h3 className="mb-3 text-sm font-semibold text-white">
            Important Commands
          </h3>

          <div className="space-y-2">

            <CommandRow
              command="git --version"
              description="Verify Git installation"
            />

            <CommandRow
              command="node --version"
              description="Verify Node.js"
            />

            <CommandRow
              command="npm --version"
              description="Verify npm"
            />

            <CommandRow
              command="npm install"
              description="Install project dependencies"
            />

            <CommandRow
              command="npm run build"
              description="Create production build"
            />

            <CommandRow
              command="sudo systemctl status apache2"
              description="Check Apache service"
            />

            <CommandRow
              command="ls -la /var/www/html"
              description="Check deployed website files"
            />

          </div>
        </Card>

      </div>
    </div>
  );
}

/* -------------------------------------------------------
 * Settings
 * ----------------------------------------------------- */

export function SettingsPage() {
  return (
    <div className="space-y-6">

      <PageHeader
        title="Settings"
        description="CartForge DevOps project configuration and environment information."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

        <Card className="p-5">
          <h3 className="mb-4 text-sm font-semibold text-white">
            Jenkins Configuration
          </h3>

          <div className="space-y-3 text-sm">
            <SettingRow
              label="Job"
              value="Cartforge-Freestyle"
            />

            <SettingRow
              label="Repository"
              value="Cartforge-jenkins"
            />

            <SettingRow
              label="Branch"
              value="main"
            />

            <SettingRow
              label="Trigger"
              value="GitHub Webhook"
              highlight="success"
            />

            <SettingRow
              label="Build Status"
              value="Success"
              highlight="success"
            />
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 text-sm font-semibold text-white">
            Build Environment
          </h3>

          <div className="space-y-3 text-sm">

            <SettingRow
              label="Git"
              value="2.53.0"
            />

            <SettingRow
              label="Node.js"
              value="22.22.1"
            />

            <SettingRow
              label="npm"
              value="9.2.0"
            />

            <SettingRow
              label="Build Tool"
              value="Vite 8.2.0"
            />

            <SettingRow
              label="Application"
              value="React + TypeScript"
            />

          </div>
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 text-sm font-semibold text-white">
            AWS / Apache Deployment
          </h3>

          <div className="space-y-3 text-sm">

            <SettingRow
              label="Server"
              value="AWS EC2"
            />

            <SettingRow
              label="Operating System"
              value="Ubuntu Linux"
            />

            <SettingRow
              label="Web Server"
              value="Apache2"
            />

            <SettingRow
              label="Document Root"
              value="/var/www/html"
            />

            <SettingRow
              label="Status"
              value="Website Live"
              highlight="success"
            />

          </div>
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 text-sm font-semibold text-white">
            GitHub Webhook
          </h3>

          <div className="space-y-3 text-sm">

            <SettingRow
              label="Event"
              value="Push"
            />

            <SettingRow
              label="Target"
              value="/github-webhook/"
            />

            <SettingRow
              label="Jenkins Trigger"
              value="Enabled"
              highlight="success"
            />

            <SettingRow
              label="Repository"
              value="Cartforge-jenkins"
            />

          </div>
        </Card>

      </div>
    </div>
  );
}

/* -------------------------------------------------------
 * Small reusable components
 * ----------------------------------------------------- */

function TechRow({
  icon,
  name,
  description,
}: {
  icon: ReactNode;
  name: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-ink-900/40 p-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-500/10 text-primary-400">
        {icon}
      </div>

      <div>
        <p className="text-sm font-medium text-ink-100">
          {name}
        </p>

        <p className="text-xs text-ink-500">
          {description}
        </p>
      </div>

      <Badge
        variant="neutral"
        className="ml-auto"
      >
        Used
      </Badge>
    </div>
  );
}

function FlowStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3 rounded-lg border border-border bg-ink-900/40 p-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary-500/10 text-[10px] font-bold text-primary-400">
        {number}
      </div>

      <div>
        <p className="text-sm font-medium text-ink-200">
          {title}
        </p>

        <p className="mt-0.5 text-xs text-ink-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function CommandRow({
  command,
  description,
}: {
  command: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-ink-900/40 p-3">
      <code className="font-mono text-xs text-primary-300">
        {command}
      </code>

      <p className="mt-1 text-[11px] text-ink-500">
        {description}
      </p>
    </div>
  );
}

function SettingRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: 'success';
}) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2 last:border-0">
      <span className="text-ink-400">
        {label}
      </span>

      <span
        className={cn(
          'max-w-[60%] truncate text-right font-medium',
          highlight === 'success'
            ? 'text-success-400'
            : 'text-ink-200',
        )}
      >
        {value}
      </span>
    </div>
  );
}