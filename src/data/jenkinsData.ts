import type {
  BuildRecord,
  JenkinsPipeline,
  JenkinsAgent,
  JenkinsPlugin,
  JenkinsCredential,
  WebhookConfig,
  Artifact,
  DeploymentRecord,
  TroubleshootIssue,
  PipelineStage,
} from '@/types';

export const SERVER_INFO = {
  status: 'running' as const,
  version: '2.452.1 LTS',
  url: 'https://jenkins.devops-platform.io',
  uptime: '14d 6h 32m',
  nodeVersion: 'Node 20.11.1',
  javaVersion: 'OpenJDK 17.0.10',
  jobsCount: 24,
  executorsOnline: 6,
  executorsBusy: 2,
  diskUsage: '41%',
  heapUsage: '38%',
  restartRequired: false,
};

export const PIPELINE_STAGES_TEMPLATE = (status: BuildRecord['status']): PipelineStage[] => {
  const base: PipelineStage[] = [
    { id: 's1', name: 'Checkout SCM', status: 'pending', duration: '', logs: [] },
    { id: 's2', name: 'Install Dependencies', status: 'pending', duration: '', logs: [] },
    { id: 's3', name: 'Build', status: 'pending', duration: '', logs: [] },
    { id: 's4', name: 'Test', status: 'pending', duration: '', logs: [] },
    { id: 's5', name: 'Package', status: 'pending', duration: '', logs: [] },
    { id: 's6', name: 'Deploy to EC2', status: 'pending', duration: '', logs: [] },
  ];
  if (status === 'success') {
    return base.map((s) => ({ ...s, status: 'success' as const, duration: '12s' }));
  }
  if (status === 'failed') {
    return [
      { ...base[0], status: 'success' as const, duration: '8s' },
      { ...base[1], status: 'success' as const, duration: '34s' },
      { ...base[2], status: 'success' as const, duration: '52s' },
      { ...base[3], status: 'failed' as const, duration: '6s' },
      { ...base[4], status: 'skipped' as const },
      { ...base[5], status: 'skipped' as const },
    ];
  }
  if (status === 'aborted') {
    return [
      { ...base[0], status: 'success' as const, duration: '7s' },
      { ...base[1], status: 'success' as const, duration: '31s' },
      { ...base[2], status: 'aborted' as const, duration: '14s' },
      ...base.slice(3),
    ] as PipelineStage[];
  }
  return base;
};

export const PIPELINES: JenkinsPipeline[] = [
  {
    id: 'p1',
    name: 'frontend-react-app',
    description: 'Production build & deploy pipeline for the React dashboard',
    repository: 'devops-platform/frontend-dashboard',
    branch: 'main',
    jenkinsfilePath: 'Jenkinsfile',
    enabled: true,
    lastBuild: null,
    successRate: 94,
    totalBuilds: 187,
    createdAt: '2025-03-12',
    schedule: 'H/30 * * * *',
  },
  {
    id: 'p2',
    name: 'backend-api-service',
    description: 'Node.js API - build, test, package, deploy to EC2',
    repository: 'devops-platform/backend-api',
    branch: 'develop',
    jenkinsfilePath: 'deploy/Jenkinsfile',
    enabled: true,
    lastBuild: null,
    successRate: 88,
    totalBuilds: 312,
    createdAt: '2025-02-28',
    schedule: 'H * * * *',
  },
  {
    id: 'p3',
    name: 'infrastructure-terraform',
    description: 'Terraform plan & apply for staging environment',
    repository: 'devops-platform/infrastructure',
    branch: 'main',
    jenkinsfilePath: 'pipelines/tf.Jenkinsfile',
    enabled: true,
    lastBuild: null,
    successRate: 97,
    totalBuilds: 64,
    createdAt: '2025-04-02',
    schedule: '@daily',
  },
  {
    id: 'p4',
    name: 'docker-image-build',
    description: 'Build & push Docker images to ECR',
    repository: 'devops-platform/container-images',
    branch: 'main',
    jenkinsfilePath: 'Jenkinsfile',
    enabled: false,
    lastBuild: null,
    successRate: 100,
    totalBuilds: 42,
    createdAt: '2025-05-10',
    schedule: 'manual',
  },
];

export const BUILDS: BuildRecord[] = [
  {
    id: 'b1', number: 187, pipeline: 'frontend-react-app', status: 'success',
    branch: 'main', commit: 'a3f9c21', author: 'Sarah Chen', message: 'feat: add real-time pipeline stage view',
    duration: '2m 18s', timestamp: '2026-08-06 09:14', triggeredBy: 'webhook', stages: [],
  },
  {
    id: 'b2', number: 186, pipeline: 'backend-api-service', status: 'failed',
    branch: 'develop', commit: '7e2b840', author: 'Marcus Webb', message: 'refactor: update auth middleware',
    duration: '1m 42s', timestamp: '2026-08-06 08:51', triggeredBy: 'webhook', stages: [],
  },
  {
    id: 'b3', number: 312, pipeline: 'backend-api-service', status: 'success',
    branch: 'develop', commit: 'c1d5e09', author: 'Priya Nair', message: 'fix: resolve race condition in queue worker',
    duration: '2m 04s', timestamp: '2026-08-06 08:30', triggeredBy: 'scheduled', stages: [],
  },
  {
    id: 'b4', number: 64, pipeline: 'infrastructure-terraform', status: 'success',
    branch: 'main', commit: '9f0a221', author: 'Sarah Chen', message: 'tf: add NAT gateway for staging VPC',
    duration: '4m 51s', timestamp: '2026-08-06 07:00', triggeredBy: 'scheduled', stages: [],
  },
  {
    id: 'b5', number: 185, pipeline: 'frontend-react-app', status: 'aborted',
    branch: 'feature/login-ui', commit: 'b8c4f12', author: 'Tom Alvarez', message: 'wip: login redesign',
    duration: '0m 52s', timestamp: '2026-08-05 22:10', triggeredBy: 'manual', stages: [],
  },
  {
    id: 'b6', number: 184, pipeline: 'frontend-react-app', status: 'success',
    branch: 'main', commit: 'd2e7a55', author: 'Priya Nair', message: 'chore: bump dependencies',
    duration: '2m 11s', timestamp: '2026-08-05 18:44', triggeredBy: 'webhook', stages: [],
  },
  {
    id: 'b7', number: 311, pipeline: 'backend-api-service', status: 'failed',
    branch: 'develop', commit: 'e5f1c30', author: 'Marcus Webb', message: 'feat: add billing endpoints',
    duration: '0m 38s', timestamp: '2026-08-05 15:20', triggeredBy: 'webhook', stages: [],
  },
  {
    id: 'b8', number: 63, pipeline: 'infrastructure-terraform', status: 'success',
    branch: 'main', commit: '1a2b3c4', author: 'Sarah Chen', message: 'tf: enable flow logs',
    duration: '3m 27s', timestamp: '2026-08-05 07:00', triggeredBy: 'scheduled', stages: [],
  },
];

export const AGENTS: JenkinsAgent[] = [
  {
    id: 'a1', name: 'built-in', status: 'online', executorCount: 2, busyExecutors: 1, idleExecutors: 1,
    remoteRoot: '/var/jenkins/workspace', labels: ['master', 'built-in'], connection: 'JNLP4',
    launchMethod: 'Built-in', uptime: '14d 6h', lastConnected: '2026-08-05', nodeType: 'permanent',
  },
  {
    id: 'a2', name: 'ubuntu-builder-01', status: 'online', executorCount: 4, busyExecutors: 1, idleExecutors: 3,
    remoteRoot: '/home/jenkins/agent', labels: ['linux', 'ubuntu', 'docker', 'node20'], connection: 'SSH',
    launchMethod: 'SSH', uptime: '9d 2h', lastConnected: '2026-08-06', nodeType: 'permanent',
  },
  {
    id: 'a3', name: 'ubuntu-builder-02', status: 'online', executorCount: 4, busyExecutors: 0, idleExecutors: 4,
    remoteRoot: '/home/jenkins/agent', labels: ['linux', 'ubuntu', 'docker', 'node20'], connection: 'SSH',
    launchMethod: 'SSH', uptime: '9d 2h', lastConnected: '2026-08-06', nodeType: 'permanent',
  },
  {
    id: 'a4', name: 'aws-deploy-agent', status: 'offline', executorCount: 2, busyExecutors: 0, idleExecutors: 0,
    remoteRoot: '/opt/jenkins', labels: ['aws', 'deploy', 'terraform'], connection: 'SSH',
    launchMethod: 'SSH', uptime: '0m', lastConnected: '2026-08-04', nodeType: 'permanent',
  },
  {
    id: 'a5', name: 'windows-builder', status: 'offline', executorCount: 2, busyExecutors: 0, idleExecutors: 0,
    remoteRoot: 'C:\\jenkins', labels: ['windows', 'dotnet'], connection: 'JNLP4',
    launchMethod: 'Launch agent via Java Web Start', uptime: '0m', lastConnected: '2026-08-03', nodeType: 'permanent',
  },
];

export const PLUGINS: JenkinsPlugin[] = [
  { id: 'pl1', name: 'Git', version: '5.2.2', enabled: true, category: 'Source Code Management', hasUpdate: false },
  { id: 'pl2', name: 'Pipeline', version: '2.901.vdogceda_f472a_', enabled: true, category: 'Pipeline', hasUpdate: false },
  { id: 'pl3', name: 'GitHub Integration', version: '1.39.0', enabled: true, category: 'Source Code Management', hasUpdate: true },
  { id: 'pl4', name: 'Credentials Binding', version: '642.v737fca_55ca_98', enabled: true, category: 'Security', hasUpdate: false },
  { id: 'pl5', name: 'SSH Build Agents', version: '2.977.v05d5fc820d3e', enabled: true, category: 'Distributed Builds', hasUpdate: false },
  { id: 'pl6', name: 'Docker Pipeline', version: '572.v970f2cd3a_96a', enabled: true, category: 'Docker', hasUpdate: true },
  { id: 'pl7', name: 'AWS Credentials', version: '231.v46a_38b_9d8f16', enabled: true, category: 'Cloud', hasUpdate: false },
  { id: 'pl8', name: 'Pipeline Stage View', version: '2.33', enabled: true, category: 'Pipeline', hasUpdate: false },
  { id: 'pl9', name: 'Timestamper', version: '1.26', enabled: true, category: 'Build Tools', hasUpdate: false },
  { id: 'pl10', name: 'Blue Ocean', version: '1.27.13', enabled: false, category: 'UI', hasUpdate: false },
  { id: 'pl11', name: 'Job DSL', version: '1.88', enabled: true, category: 'Configuration', hasUpdate: false },
  { id: 'pl12', name: 'NodeJS', version: '1.6.2', enabled: true, category: 'Build Tools', hasUpdate: true },
];

export const CREDENTIALS: JenkinsCredential[] = [
  { id: 'cr1', name: 'github-credentials', kind: 'username-password', scope: 'global', description: 'GitHub PAT for webhook + SCM', lastUsed: '2026-08-06' },
  { id: 'cr2', name: 'aws-deployer', kind: 'aws-credentials', scope: 'global', description: 'IAM user for EC2 deploy + S3 artifacts', lastUsed: '2026-08-06' },
  { id: 'cr3', name: 'ec2-ssh-key', kind: 'ssh-private-key', scope: 'global', description: 'SSH key for build agent connection', lastUsed: '2026-08-06' },
  { id: 'cr4', name: 'npm-publish-token', kind: 'secret-text', scope: 'global', description: 'npm registry publish token', lastUsed: '2026-08-05' },
  { id: 'cr5', name: 'sonarqube-token', kind: 'secret-text', scope: 'global', description: 'SonarQube analysis token', lastUsed: '2026-08-04' },
];

export const WEBHOOKS: WebhookConfig[] = [
  { id: 'w1', repository: 'devops-platform/frontend-dashboard', url: 'https://jenkins.devops-platform.io/github-webhook/', events: ['push', 'pull_request'], active: true, lastTriggered: '2026-08-06 09:14', lastDeliveryStatus: 'success', secretConfigured: true },
  { id: 'w2', repository: 'devops-platform/backend-api', url: 'https://jenkins.devops-platform.io/github-webhook/', events: ['push'], active: true, lastTriggered: '2026-08-06 08:51', lastDeliveryStatus: 'success', secretConfigured: true },
  { id: 'w3', repository: 'devops-platform/infrastructure', url: 'https://jenkins.devops-platform.io/github-webhook/', events: ['push', 'pull_request'], active: true, lastTriggered: '2026-08-06 07:00', lastDeliveryStatus: 'failed', secretConfigured: false },
  { id: 'w4', repository: 'devops-platform/container-images', url: 'https://jenkins.devops-platform.io/github-webhook/', events: ['push'], active: false, lastTriggered: '2026-08-04 12:20', lastDeliveryStatus: 'pending', secretConfigured: true },
];

export const ARTIFACTS: Artifact[] = [
  { id: 'ar1', name: 'frontend-dashboard-1.4.2.tar.gz', pipeline: 'frontend-react-app', buildNumber: 187, size: '8.2 MB', type: 'zip', checksum: 'sha256:9f2a...c81d', createdAt: '2026-08-06 09:16', stored: 's3' },
  { id: 'ar2', name: 'backend-api-2.1.0.jar', pipeline: 'backend-api-service', buildNumber: 312, size: '24.6 MB', type: 'jar', checksum: 'sha256:3b7e...f022', createdAt: '2026-08-06 08:33', stored: 's3' },
  { id: 'ar3', name: 'frontend-dashboard:1.4.2', pipeline: 'docker-image-build', buildNumber: 42, size: '146 MB', type: 'docker-image', checksum: 'sha256:7a1f...e9c4', createdAt: '2026-08-05 21:10', stored: 'nexus' },
  { id: 'ar4', name: 'backend-api:2.1.0', pipeline: 'docker-image-build', buildNumber: 41, size: '198 MB', type: 'docker-image', checksum: 'sha256:4d2c...1ab8', createdAt: '2026-08-05 20:55', stored: 'nexus' },
  { id: 'ar5', name: 'frontend-dashboard-1.4.1.tar.gz', pipeline: 'frontend-react-app', buildNumber: 184, size: '8.1 MB', type: 'zip', checksum: 'sha256:1c5a...77df', createdAt: '2026-08-05 18:46', stored: 's3' },
];

export const DEPLOYMENTS: DeploymentRecord[] = [
  { id: 'd1', pipeline: 'frontend-react-app', buildNumber: 187, environment: 'production', ec2Instance: 'i-0a12bc34def5 (prod-web-01)', status: 'deployed', deployedAt: '2026-08-06 09:18', duration: '1m 12s', version: '1.4.2', rollbackAvailable: true },
  { id: 'd2', pipeline: 'backend-api-service', buildNumber: 312, environment: 'production', ec2Instance: 'i-0b34cd56ef78 (prod-api-01)', status: 'deployed', deployedAt: '2026-08-06 08:35', duration: '1m 48s', version: '2.1.0', rollbackAvailable: true },
  { id: 'd3', pipeline: 'frontend-react-app', buildNumber: 184, environment: 'staging', ec2Instance: 'i-0c56ef78ab90 (stg-web-01)', status: 'deployed', deployedAt: '2026-08-05 18:48', duration: '1m 04s', version: '1.4.1', rollbackAvailable: false },
  { id: 'd4', pipeline: 'backend-api-service', buildNumber: 311, environment: 'production', ec2Instance: 'i-0b34cd56ef78 (prod-api-01)', status: 'failed', deployedAt: '2026-08-05 15:22', duration: '0m 38s', version: '2.0.9', rollbackAvailable: false },
];

export const TROUBLESHEET_ISSUES: TroubleshootIssue[] = [
  {
    id: 't1', title: 'Build Agent Offline', severity: 'critical', category: 'Agents',
    symptom: 'Agent aws-deploy-agent is offline and cannot accept builds.', detected: true,
    cause: 'SSH connection to the EC2 instance failed - likely the instance is stopped or the security group blocks port 22.',
    fixes: [
      'Verify the EC2 instance is running: aws ec2 describe-instances --instance-ids i-0a12bc34def5',
      'Check the security group allows inbound SSH (port 22) from the Jenkins controller IP',
      'Confirm the SSH private key in the "ec2-ssh-key" credential matches the instance key pair',
      'Restart the agent node and reconnect from Jenkins > Node > aws-deploy-agent > Relaunch agent',
    ],
    logSnippet: 'ERROR: Slave aws-deploy-agent failed to connect. java.net.ConnectException: Connection refused',
  },
  {
    id: 't2', title: 'Git Authentication Failed', severity: 'critical', category: 'Source Control',
    symptom: 'Pipeline fails at the Checkout SCM stage with 401 Unauthorized.', detected: true,
    cause: 'The GitHub Personal Access Token expired or lacks the repo scope.',
    fixes: [
      'Generate a new PAT at github.com/settings/tokens with "repo" and "admin:repo_hook" scopes',
      'Update the "github-credentials" credential in Jenkins > Manage Credentials',
      'Ensure the pipeline uses withCredentials([usernamePassword(credentialsId: "github-credentials", ...)])',
      'Test with: git ls-remote https://<token>@github.com/devops-platform/frontend-dashboard.git',
    ],
    logSnippet: 'fatal: Authentication failed for https://github.com/devops-platform/frontend-dashboard.git',
  },
  {
    id: 't3', title: 'Webhook Delivery Failed', severity: 'warning', category: 'Webhooks',
    symptom: 'GitHub push events are not triggering Jenkins builds.', detected: true,
    cause: 'The webhook secret is not configured, so Jenkins rejects the payload signature.',
    fixes: [
      'In GitHub: Repository > Settings > Webhooks > edit the Jenkins webhook',
      'Set the Secret to match the value configured in Jenkins > Manage Jenkins > GitHub Plugin',
      'Ensure the payload URL is https://jenkins.devops-platform.io/github-webhook/',
      'Verify Content-Type is application/json and the SSL verification is enabled',
      'Use "Recent Deliveries" in GitHub to inspect the response code and re-deliver',
    ],
    logSnippet: 'Webhook delivery returned 403. Signature does not match configured secret.',
  },
  {
    id: 't4', title: 'Pipeline Syntax Error', severity: 'warning', category: 'Pipeline',
    symptom: 'Build fails immediately with "expected to call .pipeline but instead called .foo".', detected: false,
    cause: 'A step inside the Jenkinsfile is misspelled or used outside an allowed block.',
    fixes: [
      'Use the Jenkins Pipeline Linter: Jenkins > [Job] > Replay > check "Use declarative linter"',
      'Validate the Jenkinsfile locally: curl -X POST -u <user> -F "jenkinsfile=<Jenkinsfile" $JENKINS_URL/pipeline-model-converter/validate',
      'Check every stage is nested under stages { } and every step under steps { }',
    ],
  },
  {
    id: 't5', title: 'Permission Denied on EC2 Deploy', severity: 'critical', category: 'AWS',
    symptom: 'Deploy stage fails: permission denied (publickey) when SSHing to the EC2 host.', detected: false,
    cause: 'The IAM user or SSH key lacks permission to connect to the target instance.',
    fixes: [
      'Verify the EC2 instance key pair matches the "ec2-ssh-key" Jenkins credential',
      'Ensure the ec2-user / ubuntu user is the SSH target (not root)',
      'Check the instance security group allows SSH from the Jenkins agent subnet',
      'Confirm ~/.ssh/authorized_keys on the EC2 host contains the public key',
    ],
    logSnippet: 'Permission denied (publickey). Connection closed by 10.0.3.42',
  },
  {
    id: 't6', title: 'Docker Not Installed on Agent', severity: 'warning', category: 'Docker',
    symptom: 'docker build command not found during pipeline execution.', detected: false,
    cause: 'Docker Engine is not installed on the build agent or the jenkins user is not in the docker group.',
    fixes: [
      'Install Docker: sudo apt-get update && sudo apt-get install -y docker.io',
      'Add jenkins user to docker group: sudo usermod -aG docker jenkins && sudo systemctl restart docker',
      'Label the agent with "docker" so pipelines use agent { label "docker" }',
      'Verify with: docker info on the agent host',
    ],
    logSnippet: 'line 12: docker: command not found',
  },
  {
    id: 't7', title: 'NodeJS Missing on Agent', severity: 'warning', category: 'Build Tools',
    symptom: 'npm: command not found during the Install Dependencies stage.', detected: false,
    cause: 'NodeJS is not installed on the agent or the NodeJS Jenkins plugin tool is not configured.',
    fixes: [
      'Install NodeJS via the NodeJS plugin: Manage Jenkins > Tools > NodeJS installations > Add',
      'Or install on the agent: nvm install 20 && nvm use 20',
      'Reference it in the pipeline: tools { nodejs "Node 20" }',
      'Verify: node --version && npm --version',
    ],
    logSnippet: '/var/jenkins/workspace/.../script.sh: line 5: npm: command not found',
  },
];
