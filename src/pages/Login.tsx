import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui';
import { Shield, Lock, Mail, ArrowRight, GitBranch, Server, Cpu } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@devops-platform.io');
  const [password, setPassword] = useState('demo1234');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const ok = login(email, password);
      if (!ok) setError('Invalid email or password.');
      setLoading(false);
    }, 600);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink-950">
      {/* ambient background */}
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-60" />
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-primary-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-accent-500/10 blur-3xl" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8">
        <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-2 lg:items-center">
          {/* Left - branding */}
          <div className="hidden flex-col justify-between lg:flex">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 shadow-lg shadow-primary-600/30">
                  <Shield size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-white">DevOps Automation Platform</h1>
                  <p className="text-xs text-ink-400">End-to-end delivery, one dashboard</p>
                </div>
              </div>

              <h2 className="mt-12 max-w-md text-3xl font-semibold leading-tight text-white">
                Manage your entire{' '}
                <span className="gradient-text">software delivery lifecycle</span> from a single pane of glass.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-400">
                Orchestrate AWS infrastructure, Jenkins pipelines, GitHub repositories, Docker, Kubernetes, and
                monitoring - all unified into one enterprise control plane.
              </p>

              <div className="mt-10 space-y-3">
                {[
                  { icon: GitBranch, label: 'GitHub-integrated CI/CD pipelines' },
                  { icon: Server, label: 'AWS EC2 deployment automation' },
                  { icon: Cpu, label: 'Jenkins agent fleet management' },
                ].map((f) => (
                  <div key={f.label} className="flex items-center gap-3 text-sm text-ink-300">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-800/60 text-primary-400">
                      <f.icon size={16} />
                    </div>
                    {f.label}
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-12 text-xs text-ink-500">
              Enterprise-grade. JWT-secured. Built for production demonstrations.
            </p>
          </div>

          {/* Right - login form */}
          <div className="mx-auto w-full max-w-md">
            <div className="rounded-2xl border border-border bg-panel/70 p-8 shadow-2xl backdrop-blur-xl">
              <div className="mb-8 flex items-center gap-3 lg:hidden">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-500">
                  <Shield size={20} className="text-white" />
                </div>
                <h1 className="text-base font-semibold text-white">DevOps Automation Platform</h1>
              </div>

              <h2 className="text-xl font-semibold text-white">Sign in to your workspace</h2>
              <p className="mt-1 text-sm text-ink-400">Enter your credentials to access the control plane.</p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ink-300">Email address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-lg border border-border bg-ink-900/60 py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-ink-500 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                      placeholder="you@company.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ink-300">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-lg border border-border bg-ink-900/60 py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-ink-500 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 text-ink-400">
                    <input type="checkbox" defaultChecked className="rounded border-border bg-ink-900 accent-primary-500" />
                    Remember me
                  </label>
                  <span className="cursor-pointer text-primary-400 hover:text-primary-300">Forgot password?</span>
                </div>

                {error && (
                  <div className="rounded-lg border border-error-500/30 bg-error-500/10 px-3 py-2 text-xs text-error-400">
                    {error}
                  </div>
                )}

                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight size={18} />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 rounded-lg border border-border bg-ink-900/40 px-4 py-3 text-xs text-ink-400">
                <p className="font-medium text-ink-300">Demo credentials (pre-filled):</p>
                <p className="mt-1">admin@devops-platform.io · demo1234</p>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-ink-500">
              Protected by JWT authentication. © 2026 DevOps Automation Platform.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
