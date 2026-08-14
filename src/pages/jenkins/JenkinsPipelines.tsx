import { useState } from 'react';
import { Card, StatusBadge, Button, Badge, PageHeader, EmptyState } from '@/components/ui';
import { PIPELINES } from '@/data/jenkinsData';
import type { JenkinsPipeline, ModuleKey } from '@/types';
import {
  Workflow, Play, Square, RotateCcw, Plus, Pencil, Trash2, GitBranch,
  Clock, CheckCircle2, X, Settings2, Search,
} from 'lucide-react';

export default function JenkinsPipelines({
  onNavigate,
  onBuild,
}: {
  onNavigate: (k: ModuleKey, tab?: string, build?: string) => void;
  onBuild: (pipelineName: string) => void;
}) {
  const [pipelines, setPipelines] = useState<JenkinsPipeline[]>(PIPELINES);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<JenkinsPipeline | null>(null);
  const [query, setQuery] = useState('');
  const [form, setForm] = useState({ name: '', description: '', repository: '', branch: 'main', jenkinsfilePath: 'Jenkinsfile', schedule: 'manual' });

  const filtered = pipelines.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()) || p.repository.toLowerCase().includes(query.toLowerCase()));

  const handleDelete = (id: string) => {
    setPipelines((prev) => prev.filter((p) => p.id !== id));
  };

  const handleToggle = (id: string) => {
    setPipelines((prev) => prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p)));
  };

  const handleSave = () => {
    if (editing) {
      setPipelines((prev) => prev.map((p) => (p.id === editing.id ? { ...editing, ...form } : p)));
    } else {
      const newP: JenkinsPipeline = {
        id: 'p' + Date.now(),
        name: form.name || 'new-pipeline',
        description: form.description,
        repository: form.repository,
        branch: form.branch,
        jenkinsfilePath: form.jenkinsfilePath,
        enabled: true,
        lastBuild: null,
        successRate: 100,
        totalBuilds: 0,
        createdAt: new Date().toISOString().slice(0, 10),
        schedule: form.schedule,
      };
      setPipelines((prev) => [newP, ...prev]);
    }
    setShowCreate(false);
    setEditing(null);
    setForm({ name: '', description: '', repository: '', branch: 'main', jenkinsfilePath: 'Jenkinsfile', schedule: 'manual' });
  };

  const openEdit = (p: JenkinsPipeline) => {
    setEditing(p);
    setForm({ name: p.name, description: p.description, repository: p.repository, branch: p.branch, jenkinsfilePath: p.jenkinsfilePath, schedule: p.schedule });
    setShowCreate(true);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', description: '', repository: '', branch: 'main', jenkinsfilePath: 'Jenkinsfile', schedule: 'manual' });
    setShowCreate(true);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Pipeline Management"
        description="Create, configure, and execute Jenkins declarative pipelines."
        actions={
          <>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pipelines..."
                className="w-56 rounded-lg border border-border bg-ink-900/60 py-2 pl-9 pr-3 text-sm text-white placeholder:text-ink-500 outline-none focus:border-primary-500"
              />
            </div>
            <Button onClick={openCreate}>
              <Plus size={16} /> Create Pipeline
            </Button>
          </>
        }
      />

      {filtered.length === 0 ? (
        <EmptyState icon={<Workflow size={28} />} title="No pipelines found" description="Create your first Jenkins pipeline to start automating builds and deployments." action={<Button onClick={openCreate}><Plus size={16} /> Create Pipeline</Button>} />
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <Card key={p.id} className="p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-500/10 text-primary-400">
                      <Workflow size={18} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-white">{p.name}</h3>
                      <p className="truncate text-xs text-ink-400">{p.description}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-ink-400">
                    <span className="flex items-center gap-1"><GitBranch size={12} /> {p.repository}</span>
                    <Badge variant="info">{p.branch}</Badge>
                    <span className="flex items-center gap-1"><Settings2 size={12} /> {p.jenkinsfilePath}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {p.schedule}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-white">{p.totalBuilds}</p>
                    <p className="text-[10px] uppercase text-ink-500">Builds</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-success-400">{p.successRate}%</p>
                    <p className="text-[10px] uppercase text-ink-500">Success</p>
                  </div>
                  <Badge variant={p.enabled ? 'success' : 'neutral'}>{p.enabled ? 'Enabled' : 'Disabled'}</Badge>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <Button size="sm" variant="success" disabled={!p.enabled} onClick={() => onBuild(p.name)}>
                    <Play size={14} /> Build Now
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => onNavigate('jenkins', 'execution', p.name)}>
                    <Workflow size={14} /> Stages
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => openEdit(p)}>
                    <Pencil size={14} />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleToggle(p.id)}>
                    <Square size={14} />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(p.id)}>
                    <Trash2 size={14} className="text-error-400" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setShowCreate(false)}>
          <div className="w-full max-w-lg rounded-2xl border border-border bg-panel p-6 shadow-2xl slide-in" onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">{editing ? 'Edit Pipeline' : 'Create Pipeline'}</h2>
              <button onClick={() => setShowCreate(false)} className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-800 hover:text-ink-200">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <Field label="Pipeline Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="e.g. frontend-react-app" />
              <Field label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} placeholder="What does this pipeline do?" />
              <Field label="GitHub Repository" value={form.repository} onChange={(v) => setForm({ ...form, repository: v })} placeholder="org/repo-name" />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Branch" value={form.branch} onChange={(v) => setForm({ ...form, branch: v })} placeholder="main" />
                <Field label="Jenkinsfile Path" value={form.jenkinsfilePath} onChange={(v) => setForm({ ...form, jenkinsfilePath: v })} placeholder="Jenkinsfile" />
              </div>
              <Field label="Schedule (cron)" value={form.schedule} onChange={(v) => setForm({ ...form, schedule: v })} placeholder="H/30 * * * * or manual" />
            </div>

            <div className="mt-6 flex items-center justify-between rounded-lg border border-border bg-ink-900/40 p-3 text-xs text-ink-400">
              <span className="flex items-center gap-2"><CheckCircle2 size={14} className="text-success-400" /> Pipeline uses declarative Jenkinsfile syntax</span>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={!form.name || !form.repository}>
                {editing ? <><RotateCcw size={16} /> Update</> : <><Plus size={16} /> Create Pipeline</>}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-ink-300">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-ink-900/60 px-3 py-2.5 text-sm text-white placeholder:text-ink-500 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
      />
    </div>
  );
}
