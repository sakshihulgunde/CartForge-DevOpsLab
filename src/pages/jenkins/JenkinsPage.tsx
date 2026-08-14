import { Tabs, type TabItem } from '@/components/ui/Tabs';
import { PageHeader } from '@/components/ui';
import {
  Workflow, Server, GitBranch, Plug, ShieldCheck, Database, Rocket, Activity, ListTree, Settings2,
} from 'lucide-react';
import { useState } from 'react';
import type { ModuleKey } from '@/types';
import JenkinsOverview from './JenkinsOverview';
import JenkinsPipelines from './JenkinsPipelines';
import PipelineExecution from './PipelineExecution';
import {
  JenkinsAgents,
  JenkinsWebhooks,
  JenkinsPlugins,
  JenkinsCredentials,
  JenkinsArtifacts,
  JenkinsAwsDeploy,
} from './JenkinsSubTabs';
import { AGENTS, TROUBLESHEET_ISSUES, BUILDS, PIPELINES } from '@/data/jenkinsData';
import { Reports } from '@/pages/Reports';
import { Troubleshooting } from '@/pages/Troubleshooting';

const TABS: TabItem[] = [
  { key: 'overview', label: 'Overview', icon: Activity },
  { key: 'pipelines', label: 'Pipelines', icon: Workflow, badge: PIPELINES.length },
  { key: 'execution', label: 'Pipeline Execution', icon: ListTree },
  { key: 'agents', label: 'Agents', icon: Server, badge: AGENTS.length },
  { key: 'webhooks', label: 'Webhooks', icon: GitBranch, badge: 4 },
  { key: 'plugins', label: 'Plugins', icon: Plug, badge: 12 },
  { key: 'credentials', label: 'Credentials', icon: ShieldCheck },
  { key: 'artifacts', label: 'Artifacts', icon: Database },
  { key: 'aws-deploy', label: 'AWS Deploy', icon: Rocket },
  { key: 'reports', label: 'Reports', icon: Workflow },
  { key: 'troubleshoot', label: 'Troubleshooting', icon: Settings2, badge: TROUBLESHEET_ISSUES.filter((t) => t.detected).length },
];

export default function JenkinsPage({
  initialTab,
  buildTrigger,
  onNavigate,
}: {
  initialTab: string;
  buildTrigger: { name: string; n: number } | null;
  onNavigate: (k: ModuleKey, tab?: string, build?: string) => void;
}) {
  const [tab, setTab] = useState(initialTab || 'overview');

  const handleBuildNow = (pipelineName: string) => {
    setTab('execution');
    onNavigate('jenkins', 'execution', pipelineName);
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Jenkins" description="CI/CD server - pipelines, agents, webhooks, plugins, credentials, artifacts, and deployments." />

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      <div className="pt-2">
        {tab === 'overview' && <JenkinsOverview onNavigate={(k, t) => { if (t) setTab(t); else onNavigate(k); }} />}
        {tab === 'pipelines' && <JenkinsPipelines onNavigate={(k, t) => { if (t) setTab(t); else onNavigate(k); }} onBuild={handleBuildNow} />}
        {tab === 'execution' && <PipelineExecution triggerBuild={buildTrigger} onNavigate={onNavigate} />}
        {tab === 'agents' && <JenkinsAgents />}
        {tab === 'webhooks' && <JenkinsWebhooks />}
        {tab === 'plugins' && <JenkinsPlugins />}
        {tab === 'credentials' && <JenkinsCredentials />}
        {tab === 'artifacts' && <JenkinsArtifacts />}
        {tab === 'aws-deploy' && <JenkinsAwsDeploy onNavigate={onNavigate} />}
        {tab === 'reports' && <Reports builds={BUILDS} pipelines={PIPELINES} />}
        {tab === 'troubleshoot' && <Troubleshooting />}
      </div>
    </div>
  );
}
