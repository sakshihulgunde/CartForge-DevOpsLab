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
    name: 'Cartforge-Freestyle',
    description: 'CartForge frontend build and deployment job',
    repository: 'CartForge GitHub Repository',
    branch: 'main',
    jenkinsfilePath: 'Freestyle Project',
    enabled: true,
    lastBuild: null,
    successRate: 100,
    totalBuilds: 3,
    createdAt: '2026-08-15',
    schedule: 'Manual / GitHub Webhook',
  },
];
export const BUILDS: BuildRecord[] = [
  {
    id: 'b1',
    number: 3,
    pipeline: 'Cartforge-Freestyle',
    status: 'success',
    branch: 'main',
    commit: 'cartforge3',
    author: 'Sakshi',
    message: 'Build and deploy CartForge application',
    duration: '1m 24s',
    timestamp: '2026-08-15 11:00',
    triggeredBy: 'manual',
    stages: [],
  },
  {
    id: 'b2',
    number: 2,
    pipeline: 'Cartforge-Freestyle',
    status: 'success',
    branch: 'main',
    commit: 'cartforge2',
    author: 'Sakshi',
    message: 'Update CartForge dashboard',
    duration: '1m 18s',
    timestamp: '2026-08-15 10:45',
    triggeredBy: 'webhook',
    stages: [],
  },
  {
    id: 'b3',
    number: 1,
    pipeline: 'Cartforge-Freestyle',
    status: 'success',
    branch: 'main',
    commit: 'cartforge1',
    author: 'Sakshi',
    message: 'Initial CartForge Jenkins build',
    duration: '1m 20s',
    timestamp: '2026-08-15 10:30',
    triggeredBy: 'manual',
    stages: [],
  },
];

export const AGENTS: JenkinsAgent[] = [
  {
    id: 'a1',
    name: 'built-in',
    status: 'online',
    executorCount: 2,
    busyExecutors: 1,
    idleExecutors: 1,
    remoteRoot: '/var/lib/jenkins',
    labels: ['built-in', 'linux', 'cartforge'],
    connection: 'Built-in',
    launchMethod: 'Built-in',
    uptime: 'Active',
    lastConnected: '2026-08-15',
    nodeType: 'permanent',
  },
];
export const PLUGINS: JenkinsPlugin[] = [
  {
    id: 'pl1',
    name: 'Git',
    version: '5.2.2',
    enabled: true,
    category: 'Source Code Management',
    hasUpdate: false,
  },
  {
    id: 'pl2',
    name: 'Pipeline',
    version: '2.901',
    enabled: true,
    category: 'Pipeline',
    hasUpdate: false,
  },
  {
    id: 'pl3',
    name: 'GitHub Integration',
    version: '1.39.0',
    enabled: true,
    category: 'Source Code Management',
    hasUpdate: false,
  },
  {
    id: 'pl4',
    name: 'Credentials Binding',
    version: '642',
    enabled: true,
    category: 'Security',
    hasUpdate: false,
  },
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
  {
    id: 'ar1',
    name: 'cartforge-dist.zip',
    pipeline: 'Cartforge-Freestyle',
    buildNumber: 1,
    size: '315 KB',
    type: 'zip',
    checksum: 'sha256:cartforge...001',
    createdAt: '2026-08-15 10:30',
    stored: 'jenkins',
  },
  {
    id: 'ar2',
    name: 'cartforge-dist.zip',
    pipeline: 'Cartforge-Freestyle',
    buildNumber: 2,
    size: '315 KB',
    type: 'zip',
    checksum: 'sha256:cartforge...002',
    createdAt: '2026-08-15 10:45',
    stored: 'ec2',
  },
  {
    id: 'ar3',
    name: 'cartforge-build.zip',
    pipeline: 'Cartforge-Freestyle',
    buildNumber: 3,
    size: '316 KB',
    type: 'zip',
    checksum: 'sha256:cartforge...003',
    createdAt: '2026-08-15 11:00',
    stored: 'jenkins',
  },
];

export const DEPLOYMENTS: DeploymentRecord[] = [
  {
    id: 'd1',
    pipeline: 'Cartforge-Freestyle',
    buildNumber: 1,
    environment: 'production',
    ec2Instance: 'CartForge EC2',
    status: 'deployed',
    deployedAt: '2026-08-15 10:30',
    duration: '1m 12s',
    version: 'Build #1',
    rollbackAvailable: true,
  },
  {
    id: 'd2',
    pipeline: 'Cartforge-Freestyle',
    buildNumber: 2,
    environment: 'production',
    ec2Instance: 'CartForge EC2',
    status: 'deployed',
    deployedAt: '2026-08-15 10:45',
    duration: '1m 08s',
    version: 'Build #2',
    rollbackAvailable: true,
  },
  {
    id: 'd3',
    pipeline: 'Cartforge-Freestyle',
    buildNumber: 3,
    environment: 'production',
    ec2Instance: 'CartForge EC2',
    status: 'deployed',
    deployedAt: '2026-08-15 11:00',
    duration: '1m 10s',
    version: 'Build #3',
    rollbackAvailable: true,
  },
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
