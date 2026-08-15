import { useState } from 'react';
import { Card, StatusBadge, Button, Badge, PageHeader, EmptyState } from '@/components/ui';
import { AGENTS, WEBHOOKS, PLUGINS, CREDENTIALS, ARTIFACTS, DEPLOYMENTS, PIPELINES } from '@/data/jenkinsData';
import {
  Server, Plus, X, Cpu, Wifi, WifiOff, Terminal, Trash2, Power,
  GitBranch, Webhook, CheckCircle2, XCircle, Clock, ExternalLink,
  Plug, Download, ShieldCheck, Key, Database, Cloud,
  Rocket, RotateCcw, Settings2, Activity, Box, Package, Archive, ChevronRight,
} from 'lucide-react';
import type { JenkinsAgent, ModuleKey } from '@/types';
import { cn } from '@/lib/utils';

/* ============================ AGENTS ============================ */
export function JenkinsAgents() {
  const [agents, setAgents] = useState<JenkinsAgent[]>(AGENTS);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', host: '', remoteRoot: '/home/jenkins/agent', labels: 'linux, ubuntu', executors: '2' });

  const handleCreate = () => {
    const newAgent: JenkinsAgent = {
      id: 'a' + Date.now(),
      name: form.name || 'new-agent',
      status: 'connecting',
      executorCount: parseInt(form.executors) || 2,
      busyExecutors: 0,
      idleExecutors: parseInt(form.executors) || 2,
      remoteRoot: form.remoteRoot,
      labels: form.labels.split(',').map((l) => l.trim()).filter(Boolean),
      connection: 'SSH',
      launchMethod: 'SSH',
      uptime: '0m',
      lastConnected: new Date().toISOString().slice(0, 10),
      nodeType: 'permanent',
    };
    setAgents((prev) => [...prev, newAgent]);
    setShowCreate(false);
    setForm({ name: '', host: '', remoteRoot: '/home/jenkins/agent', labels: 'linux, ubuntu', executors: '2' });
    setTimeout(() => {
      setAgents((prev) => prev.map((a) => (a.id === newAgent.id ? { ...a, status: 'online', uptime: '1m' } : a)));
    }, 2500);
  };

  const launchAgent = (id: string) => {
    setAgents((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'connecting' } : a)));
    setTimeout(() => {
      setAgents((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'online', uptime: '1m', lastConnected: new Date().toISOString().slice(0, 10) } : a)));
    }, 2000);
  };

  const disconnect = (id: string) => {
    setAgents((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'offline', busyExecutors: 0, idleExecutors: 0, uptime: '0m' } : a)));
  };

  const removeAgent = (id: string) => setAgents((prev) => prev.filter((a) => a.id !== id));

  return (
    <div className="space-y-5">
      <PageHeader
        title="Jenkins Build Agents"
        description="Distributed build executors connected via SSH and JNLP."
        actions={<Button onClick={() => setShowCreate(true)}><Plus size={16} /> Create Agent</Button>}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MiniStat label="Total Agents" value={agents.length} icon={<Server size={18} />} />
        <MiniStat label="Online" value={agents.filter((a) => a.status === 'online').length} icon={<Wifi size={18} />} accent="success" />
        <MiniStat label="Offline" value={agents.filter((a) => a.status === 'offline').length} icon={<WifiOff size={18} />} accent="error" />
        <MiniStat label="Total Executors" value={agents.reduce((s, a) => s + a.executorCount, 0)} icon={<Cpu size={18} />} accent="accent" />
      </div>

      <div className="space-y-3">
        {agents.map((a) => (
          <Card key={a.id} className="p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', a.status === 'online' ? 'bg-success-500/10 text-success-400' : a.status === 'connecting' ? 'bg-accent-500/10 text-accent-400' : 'bg-error-500/10 text-error-400')}>
                  {a.status === 'connecting' ? <Activity size={18} className="animate-spin" /> : a.status === 'online' ? <Server size={18} /> : <WifiOff size={18} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white">{a.name}</h3>
                    <StatusBadge status={a.status} />
                  </div>
                  <p className="mt-0.5 text-xs text-ink-400">{a.remoteRoot} · {a.launchMethod} · {a.connection}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {a.labels.map((l) => <Badge key={l} variant="neutral">{l}</Badge>)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-lg font-semibold text-white">{a.executorCount}</p>
                  <p className="text-[10px] uppercase text-ink-500">Executors</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-success-400">{a.idleExecutors}</p>
                  <p className="text-[10px] uppercase text-ink-500">Idle</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-warning-400">{a.busyExecutors}</p>
                  <p className="text-[10px] uppercase text-ink-500">Busy</p>
                </div>
                <div className="hidden text-center md:block">
                  <p className="text-xs font-medium text-ink-200">{a.uptime}</p>
                  <p className="text-[10px] uppercase text-ink-500">Uptime</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {a.status === 'offline' ? (
                  <Button size="sm" variant="success" onClick={() => launchAgent(a.id)}>
                    <Power size={14} /> Launch
                  </Button>
                ) : (
                  <Button size="sm" variant="secondary" onClick={() => disconnect(a.id)} disabled={a.status === 'connecting'}>
                    <WifiOff size={14} /> Disconnect
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => removeAgent(a.id)}>
                  <Trash2 size={14} className="text-error-400" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {showCreate && (
        <Modal title="Create Build Agent" onClose={() => setShowCreate(false)} onSubmit={handleCreate} submitLabel="Create & Connect">
          <AgentForm form={form} setForm={setForm} />
        </Modal>
      )}
    </div>
  );
}

function AgentForm({ form, setForm }: { form: { name: string; host: string; remoteRoot: string; labels: string; executors: string }; setForm: (f: typeof form) => void }) {
  return (
    <div className="space-y-4">
      <FormField label="Agent Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="ubuntu-builder-03" />
      <FormField label="SSH Host" value={form.host} onChange={(v) => setForm({ ...form, host: v })} placeholder="10.0.3.50" />
      <FormField label="Remote Root Directory" value={form.remoteRoot} onChange={(v) => setForm({ ...form, remoteRoot: v })} />
      <FormField label="Labels (comma-separated)" value={form.labels} onChange={(v) => setForm({ ...form, labels: v })} />
      <FormField label="Number of Executors" value={form.executors} onChange={(v) => setForm({ ...form, executors: v })} />
      <div className="rounded-lg border border-border bg-ink-900/40 p-3 text-xs text-ink-400">
        <p className="flex items-center gap-2"><Terminal size={14} className="text-primary-400" /> Connection uses the "ec2-ssh-key" credential. Ensure port 22 is open in the security group.</p>
      </div>
    </div>
  );
}

 /* ============================ WEBHOOKS ============================ */
export function JenkinsWebhooks() {
  const [webhooks, setWebhooks] = useState(WEBHOOKS);
  const [showAddWebhook, setShowAddWebhook] = useState(false);

  const [form, setForm] = useState({
    repository: '',
    url: '',
    events: 'push',
  });

  const addWebhook = () => {
    if (!form.repository.trim() || !form.url.trim()) return;

    const newWebhook = {
      id: 'wh-' + Date.now(),
      repository: form.repository,
      url: form.url,
      events: form.events.split(','),
      lastTriggered: 'Never',
      lastDeliveryStatus: 'pending' as const,
      secretConfigured: false,
      active: true,
    };

    setWebhooks((prev) => [...prev, newWebhook]);

    setShowAddWebhook(false);

    setForm({
      repository: '',
      url: '',
      events: 'push',
    });
  };

  const deleteWebhook = (id: string) => {
    setWebhooks((prev) => prev.filter((w) => w.id !== id));
  };

  return (
    <div className="space-y-5">

      <PageHeader
        title="GitHub Webhooks"
        description="Webhook integrations triggering Jenkins pipelines on repository events."
        actions={
          <Button onClick={() => setShowAddWebhook(true)}>
            <Plus size={16} />
            Add Webhook
          </Button>
        }
      />

      <Card className="border-primary-500/20 bg-primary-500/5 p-4">
        <div className="flex items-start gap-3">
          <GitBranch
            size={18}
            className="mt-0.5 shrink-0 text-primary-400"
          />

          <div className="text-sm">
            <p className="font-medium text-ink-100">
              GitHub Webhook Configuration
            </p>

            <p className="mt-1 text-xs text-ink-400">
              Jenkins webhook endpoint:
            </p>

            <code className="mt-1 inline-block rounded bg-ink-900/60 px-2 py-1 text-xs text-primary-300">
              http://YOUR_JENKINS_PUBLIC_IP:8080/github-webhook/
            </code>

            <p className="mt-2 text-xs text-ink-500">
              Recommended event: push
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-3">

        {webhooks.map((w) => (
          <Card key={w.id} className="p-5">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-4">

                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg',
                    w.active
                      ? 'bg-primary-500/10 text-primary-400'
                      : 'bg-ink-800 text-ink-500'
                  )}
                >
                  <Webhook size={18} />
                </div>

                <div>

                  <h3 className="text-sm font-semibold text-white">
                    {w.repository}
                  </h3>

                  <p className="mt-0.5 truncate text-xs text-ink-400">
                    {w.url}
                  </p>

                  <div className="mt-1.5 flex flex-wrap gap-1">

                    {w.events.map((event) => (
                      <Badge key={event} variant="info">
                        {event}
                      </Badge>
                    ))}

                  </div>

                </div>

              </div>

              <div className="flex flex-wrap items-center gap-3">

                <div className="text-right">
                  <p className="text-xs text-ink-500">
                    Last triggered
                  </p>

                  <p className="text-sm font-medium text-ink-200">
                    {w.lastTriggered}
                  </p>
                </div>

                {w.lastDeliveryStatus === 'success' ? (
                  <Badge variant="success">
                    <CheckCircle2 size={12} />
                    Delivered
                  </Badge>
                ) : w.lastDeliveryStatus === 'failed' ? (
                  <Badge variant="error">
                    <XCircle size={12} />
                    Failed
                  </Badge>
                ) : (
                  <Badge variant="warning">
                    <Clock size={12} />
                    Pending
                  </Badge>
                )}

                <Badge
                  variant={
                    w.secretConfigured
                      ? 'success'
                      : 'warning'
                  }
                >
                  {w.secretConfigured
                    ? 'Secret set'
                    : 'No secret'}
                </Badge>

                <Badge
                  variant={
                    w.active
                      ? 'success'
                      : 'neutral'
                  }
                >
                  {w.active
                    ? 'Active'
                    : 'Inactive'}
                </Badge>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteWebhook(w.id)}
                >
                  <Trash2
                    size={14}
                    className="text-error-400"
                  />
                </Button>

              </div>

            </div>

          </Card>
        ))}

      </div>

      {showAddWebhook && (
        <Modal
          title="Add GitHub Webhook"
          onClose={() => setShowAddWebhook(false)}
          onSubmit={addWebhook}
          submitLabel="Add Webhook"
        >

          <div className="space-y-4">

            <FormField
              label="GitHub Repository"
              value={form.repository}
              onChange={(v) =>
                setForm({
                  ...form,
                  repository: v,
                })
              }
              placeholder="Cartforge-jenkins"
            />

            <FormField
              label="Jenkins Payload URL"
              value={form.url}
              onChange={(v) =>
                setForm({
                  ...form,
                  url: v,
                })
              }
              placeholder="http://YOUR-JENKINS-IP:8080/github-webhook/"
            />

            <div>

              <label className="mb-1.5 block text-xs font-medium text-ink-300">
                Events
              </label>

              <select
                value={form.events}
                onChange={(e) =>
                  setForm({
                    ...form,
                    events: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-border bg-ink-900/60 px-3 py-2.5 text-sm text-white outline-none"
              >
                <option value="push">
                  Push
                </option>

                <option value="pull_request">
                  Pull Request
                </option>

                <option value="push,pull_request">
                  Push + Pull Request
                </option>
              </select>

            </div>

            <div className="rounded-lg border border-primary-500/20 bg-primary-500/5 p-3 text-xs text-ink-400">

              <p className="font-medium text-primary-300">
                Important
              </p>

              <p className="mt-1">
                This adds the webhook to the dashboard.
                You must also configure the actual webhook
                in GitHub under Settings → Webhooks.
              </p>

            </div>

          </div>

        </Modal>
      )}

    </div>
  );
}
/* ============================ PLUGINS ============================ */
export function JenkinsPlugins() {
  const [plugins, setPlugins] = useState(PLUGINS);
  const updates = plugins.filter((p) => p.hasUpdate).length;

  return (
    <div className="space-y-5">
      <PageHeader title="Installed Plugins" description={`${plugins.length} plugins installed · ${updates} updates available`} actions={updates > 0 ? <Button><Download size={16} /> Update All</Button> : undefined} />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {plugins.map((p) => (
          <Card key={p.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-800 text-primary-400">
                  <Plug size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{p.name}</h3>
                  <p className="text-xs text-ink-400">{p.category} · v{p.version}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {p.hasUpdate && <Badge variant="warning"><Download size={11} /> Update</Badge>}
                <Badge variant={p.enabled ? 'success' : 'neutral'}>{p.enabled ? 'Enabled' : 'Disabled'}</Badge>
                <button
                  onClick={() => setPlugins((prev) => prev.map((x) => (x.id === p.id ? { ...x, enabled: !x.enabled } : x)))}
                  className="rounded-md p-1.5 text-ink-500 hover:bg-ink-800 hover:text-ink-300"
                >
                  <Settings2 size={14} />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ============================ CREDENTIALS ============================ */
export function JenkinsCredentials() {
  const kindIcon: Record<string, typeof Key> = {
    'username-password': Key,
    'ssh-private-key': Terminal,
    'secret-text': ShieldCheck,
    'aws-credentials': Cloud,
  };
  return (
    <div className="space-y-5">
      <PageHeader title="Credentials" description="Securely stored secrets used by pipelines via withCredentials()." actions={<Button><Plus size={16} /> Add Credential</Button>} />

      <Card className="border-warning-500/20 bg-warning-500/5 p-4">
        <div className="flex items-start gap-3 text-sm">
          <ShieldCheck size={18} className="mt-0.5 shrink-0 text-warning-400" />
          <p className="text-xs text-ink-300">Credentials are encrypted at rest and injected into builds using the Credentials Binding plugin. Never echo secrets in console output.</p>
        </div>
      </Card>

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-ink-900/60 text-xs uppercase text-ink-500">
            <tr>
              <th className="px-4 py-3 text-left font-medium">ID</th>
              <th className="px-4 py-3 text-left font-medium">Kind</th>
              <th className="px-4 py-3 text-left font-medium">Scope</th>
              <th className="px-4 py-3 text-left font-medium">Description</th>
              <th className="px-4 py-3 text-left font-medium">Last Used</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {CREDENTIALS.map((c) => {
              const Icon = kindIcon[c.kind] || Key;
              return (
                <tr key={c.id} className="hover:bg-ink-900/30">
                  <td className="px-4 py-3 font-mono text-xs text-primary-300">{c.name}</td>
                  <td className="px-4 py-3"><span className="flex items-center gap-2 text-ink-200"><Icon size={14} className="text-ink-400" /> {c.kind}</span></td>
                  <td className="px-4 py-3"><Badge variant="info">{c.scope}</Badge></td>
                  <td className="px-4 py-3 text-ink-400">{c.description}</td>
                  <td className="px-4 py-3 text-ink-400">{c.lastUsed}</td>
                  <td className="px-4 py-3 text-right"><Button size="sm" variant="ghost"><Settings2 size={14} /></Button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============================ ARTIFACTS ============================ */
export function JenkinsArtifacts() {
  const typeIcon: Record<string, typeof Database> = { jar: Database, war: Database, 'docker-image': Box, 'npm-package': Package, zip: Archive };
  return (
    <div className="space-y-5">
      <PageHeader title="Build Artifacts" description="Versioned build outputs stored in S3 and Nexus." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MiniStat label="Total Artifacts" value={ARTIFACTS.length} icon={<Database size={18} />} />
        <MiniStat label="In S3" value={ARTIFACTS.filter((a) => a.stored === 's3').length} icon={<Cloud size={18} />} accent="accent" />
        <MiniStat label="In Nexus" value={ARTIFACTS.filter((a) => a.stored === 'nexus').length} icon={<Database size={18} />} accent="primary" />
        <MiniStat label="Total Size" value="385 MB" icon={<Archive size={18} />} />
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-ink-900/60 text-xs uppercase text-ink-500">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Artifact</th>
              <th className="px-4 py-3 text-left font-medium">Pipeline</th>
              <th className="px-4 py-3 text-left font-medium">Build</th>
              <th className="px-4 py-3 text-left font-medium">Size</th>
              <th className="px-4 py-3 text-left font-medium">Checksum</th>
              <th className="px-4 py-3 text-left font-medium">Storage</th>
              <th className="px-4 py-3 text-left font-medium">Created</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {ARTIFACTS.map((a) => {
              const Icon = typeIcon[a.type] || Database;
              return (
                <tr key={a.id} className="hover:bg-ink-900/30">
                  <td className="px-4 py-3"><span className="flex items-center gap-2 font-medium text-ink-100"><Icon size={15} className="text-primary-400" /> {a.name}</span></td>
                  <td className="px-4 py-3 text-ink-400">{a.pipeline}</td>
                  <td className="px-4 py-3 font-mono text-xs text-primary-300">#{a.buildNumber}</td>
                  <td className="px-4 py-3 text-ink-400">{a.size}</td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-500">{a.checksum}</td>
                  <td className="px-4 py-3"><Badge variant={a.stored === 's3' ? 'info' : 'success'}>{a.stored}</Badge></td>
                  <td className="px-4 py-3 text-ink-400">{a.createdAt}</td>
                  <td className="px-4 py-3 text-right"><Button size="sm" variant="ghost"><Download size={14} /></Button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============================ AWS DEPLOYMENT ============================ */
export function JenkinsAwsDeploy({ onNavigate }: { onNavigate: (k: ModuleKey) => void }) {
  return (
    <div className="space-y-5">
      <PageHeader title="AWS Deployment" description="Automated EC2 deployments with Apache restart and health checks." actions={<Button variant="secondary" onClick={() => onNavigate('aws')}><Cloud size={16} /> View AWS Module</Button>} />

      <Card className="overflow-hidden">
        <div className="border-b border-border bg-ink-900/40 px-5 py-3">
          <h3 className="text-sm font-semibold text-white">Deployment Pipeline Flow</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2 p-6 text-xs">
          {['Package Artifact', 'Upload to S3', 'SSH to EC2', 'Download & Extract', 'Backup Current', 'Restart Apache', 'Health Check'].map((step, i, arr) => (
            <div key={step} className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-lg border border-success-500/30 bg-success-500/10 px-3 py-2 text-success-400">
                <CheckCircle2 size={14} /> {step}
              </div>
              {i < arr.length - 1 && <ChevronRight size={16} className="text-ink-600" />}
            </div>
          ))}
        </div>
      </Card>

      <div className="space-y-3">
        {DEPLOYMENTS.map((d) => (
          <Card key={d.id} className="p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', d.status === 'deployed' ? 'bg-success-500/10 text-success-400' : d.status === 'failed' ? 'bg-error-500/10 text-error-400' : 'bg-accent-500/10 text-accent-400')}>
                  <Rocket size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white">{d.pipeline}</h3>
                    <Badge variant="info">v{d.version}</Badge>
                    <StatusBadge status={d.status} />
                  </div>
                  <p className="mt-0.5 text-xs text-ink-400">{d.ec2Instance} · {d.environment}</p>
                  <p className="text-xs text-ink-500">Deployed {d.deployedAt} · {d.duration}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="secondary"><Activity size={14} /> Health Check</Button>
                {d.rollbackAvailable && <Button size="sm" variant="danger"><RotateCcw size={14} /> Rollback</Button>}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <h3 className="mb-3 text-sm font-semibold text-white">Deploy Script (deploy-to-ec2.sh)</h3>
        <pre className="overflow-x-auto rounded-lg bg-ink-950/80 p-4 font-mono text-xs leading-relaxed text-ink-300">
{`#!/bin/bash
set -euo pipefail

EC2_HOST="ec2-user@10.0.3.42"
APP_DIR="/var/www/html"
BACKUP_DIR="/var/www/releases"
VERSION=$1

echo "Downloading artifact v$VERSION from S3..."
aws s3 cp s3://devops-artifacts/frontend-dashboard-$VERSION.tar.gz /tmp/

echo "Backing up current release..."
ssh $EC2_HOST "sudo cp -r $APP_DIR $BACKUP_DIR/$(date +%s)"

echo "Deploying new release..."
scp /tmp/frontend-dashboard-$VERSION.tar.gz $EC2_HOST:/tmp/
ssh $EC2_HOST "sudo tar -xzf /tmp/frontend-dashboard-$VERSION.tar.gz -C $APP_DIR"

echo "Restarting Apache..."
ssh $EC2_HOST "sudo systemctl restart httpd"

echo "Health check..."
curl -sf https://app.devops-platform.io/health || exit 1
echo "Deployment successful."`}
        </pre>
      </Card>
    </div>
  );
}

/* ============================ SHARED ============================ */
function MiniStat({ label, value, icon, accent = 'primary' }: { label: string; value: string | number; icon: React.ReactNode; accent?: 'primary' | 'success' | 'error' | 'accent' }) {
  const colors: Record<string, string> = { primary: 'text-primary-400', success: 'text-success-400', error: 'text-error-400', accent: 'text-accent-400' };
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className={cn('rounded-lg bg-ink-800/60 p-2', colors[accent])}>{icon}</div>
        <div>
          <p className="text-xl font-semibold text-white">{value}</p>
          <p className="text-xs text-ink-500">{label}</p>
        </div>
      </div>
    </Card>
  );
}

function Modal({ title, onClose, onSubmit, submitLabel, children }: { title: string; onClose: () => void; onSubmit: () => void; submitLabel: string; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-border bg-panel p-6 shadow-2xl slide-in" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-800 hover:text-ink-200"><X size={18} /></button>
        </div>
        {children}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={onSubmit}>{submitLabel}</Button>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-ink-300">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-lg border border-border bg-ink-900/60 px-3 py-2.5 text-sm text-white placeholder:text-ink-500 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" />
    </div>
  );
}
