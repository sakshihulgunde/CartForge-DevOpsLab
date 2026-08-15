export type ModuleKey =
  | 'dashboard'
  | 'aws'
  | 'linux'
  | 'github'
  | 'jenkins'
  | 'automation'
  | 'apache'
  | 'monitoring'
  | 'reports'
  | 'documentation'
  | 'settings';

export type BuildStatus = 'success' | 'failed' | 'running' | 'queued' | 'aborted' | 'unstable';
export type StageStatus = 'success' | 'running' | 'pending' | 'failed' | 'skipped';
export type AgentStatus = 'online' | 'offline' | 'connecting';
export type DeployStatus = 'deployed' | 'failed' | 'in-progress' | 'pending';

export interface User {
  name: string;
  email: string;
  role: string;
  avatar: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  status: StageStatus;
  duration: string;
  logs: string[];
}

export interface BuildRecord {
  id: string;
  number: number;
  pipeline: string;
  status: BuildStatus;
  branch: string;
  commit: string;
  author: string;
  message: string;
  duration: string;
  timestamp: string;
  stages: PipelineStage[];
  triggeredBy: 'manual' | 'webhook' | 'scheduled';
}

export interface JenkinsPipeline {
  id: string;
  name: string;
  description: string;
  repository: string;
  branch: string;
  jenkinsfilePath: string;
  enabled: boolean;
  lastBuild: BuildRecord | null;
  successRate: number;
  totalBuilds: number;
  createdAt: string;
  schedule: string;
}

export interface JenkinsAgent {
  id: string;
  name: string;
  status: AgentStatus;
  executorCount: number;
  busyExecutors: number;
  idleExecutors: number;
  remoteRoot: string;
  labels: string[];
  connection: string;
  launchMethod: string;
  uptime: string;
  lastConnected: string;
  nodeType: 'permanent' | 'ephemeral';
}

export interface JenkinsPlugin {
  id: string;
  name: string;
  version: string;
  enabled: boolean;
  category: string;
  hasUpdate: boolean;
}

export interface JenkinsCredential {
  id: string;
  name: string;
  kind: 'username-password' | 'ssh-private-key' | 'secret-text' | 'aws-credentials';
  scope: 'global' | 'system';
  description: string;
  lastUsed: string;
}

export interface WebhookConfig {
  id: string;
  repository: string;
  url: string;
  events: string[];
  active: boolean;
  lastTriggered: string;
  lastDeliveryStatus: 'success' | 'failed' | 'pending';
  secretConfigured: boolean;
}

export interface Artifact {
  id: string;
  name: string;
  pipeline: string;
  buildNumber: number;
  size: string;
  type: 'jar' | 'war' | 'docker-image' | 'npm-package' | 'zip';
  checksum: string;
  createdAt: string;
  stored: 's3' | 'nexus' | 'local';
}

export interface DeploymentRecord {
  id: string;
  pipeline: string;
  buildNumber: number;
  environment: 'production' | 'staging' | 'development';
  ec2Instance: string;
  status: DeployStatus;
  deployedAt: string;
  duration: string;
  version: string;
  rollbackAvailable: boolean;
}

export interface TroubleshootIssue {
  id: string;
  title: string;
  severity: 'critical' | 'warning' | 'info';
  category: string;
  symptom: string;
  detected: boolean;
  cause: string;
  fixes: string[];
  logSnippet?: string;
}
