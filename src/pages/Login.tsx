import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui';
import {
  GitBranch,
  Server,
  Play,
  CheckCircle2,
  Lock,
  Mail,
  ArrowRight,
  Activity,
  Terminal,
} from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('sakshihulgunde28@gmail.com');
  const [password, setPassword] = useState('Sakshi_2806');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const ok = login(email, password);

      if (!ok) {
        setError('Invalid email or password.');
      }

      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">

        {/* LEFT SIDE */}
        <div className="hidden w-1/2 bg-white lg:flex lg:flex-col lg:justify-between border-r border-slate-200">

          {/* Brand */}
          <div className="px-12 pt-10">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 shadow-sm">
                <Terminal size={22} className="text-white" />
              </div>

              <div>
                <h1 className="text-lg font-bold tracking-tight text-slate-900">
                  CartForge
                </h1>
                <p className="text-xs text-slate-500">
                  DevOps Deployment Portal
                </p>
              </div>
            </div>

            {/* Main heading */}
            <div className="mt-20 max-w-lg">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700">
                <Activity size={13} />
                CI/CD System Online
              </div>

              <h2 className="text-4xl font-bold leading-tight tracking-tight text-slate-900">
                Build, deploy and
                <span className="block text-blue-600">
                  monitor with confidence.
                </span>
              </h2>

              <p className="mt-5 max-w-md text-sm leading-6 text-slate-500">
                Manage your CartForge application through a centralized
                DevOps workspace connected to GitHub, Jenkins and AWS.
              </p>
            </div>

            {/* Pipeline */}
            <div className="mt-12 max-w-lg">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Deployment pipeline
              </p>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">

                <div className="flex items-center justify-between">

                  {/* GitHub */}
                  <PipelineStep
                    icon={<GitBranch size={17} />}
                    label="GitHub"
                    color="blue"
                  />

                  <PipelineLine />

                  {/* Jenkins */}
                  <PipelineStep
                    icon={<Play size={17} />}
                    label="Jenkins"
                    color="blue"
                  />

                  <PipelineLine />

                  {/* Build */}
                  <PipelineStep
                    icon={<Terminal size={17} />}
                    label="Build"
                    color="teal"
                  />

                  <PipelineLine />

                  {/* Deploy */}
                  <PipelineStep
                    icon={<Server size={17} />}
                    label="Deploy"
                    color="emerald"
                  />

                </div>

                <div className="mt-5 flex items-center gap-2 border-t border-slate-200 pt-4">
                  <CheckCircle2
                    size={15}
                    className="text-emerald-600"
                  />

                  <span className="text-xs font-medium text-slate-600">
                    Pipeline ready for deployment
                  </span>

                  <span className="ml-auto text-xs text-slate-400">
                    Jenkins
                  </span>
                </div>

              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-12 pb-8">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Infrastructure operational
            </div>

            <p className="mt-2 text-xs text-slate-400">
              CartForge DevOps Project · 2026
            </p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">

          <div className="w-full max-w-md">

            {/* Mobile branding */}
            <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
                <Terminal size={20} className="text-white" />
              </div>

              <div>
                <h1 className="font-bold text-slate-900">
                  CartForge
                </h1>
                <p className="text-xs text-slate-500">
                  DevOps Deployment Portal
                </p>
              </div>
            </div>

            {/* Login card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-8">

              {/* Header */}
              <div>
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                  <Lock size={20} className="text-blue-600" />
                </div>

                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  Welcome back
                </h2>

                <p className="mt-2 text-sm leading-5 text-slate-500">
                  Sign in to manage your CartForge CI/CD environment.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="mt-7 space-y-5">

                {/* Email */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Email address
                  </label>

                  <div className="relative">
                    <Mail
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="
                        w-full rounded-lg border border-slate-200
                        bg-white py-2.5 pl-10 pr-3
                        text-sm text-slate-900
                        outline-none
                        transition
                        placeholder:text-slate-400
                        hover:border-slate-300
                        focus:border-blue-500
                        focus:ring-4
                        focus:ring-blue-500/10
                      "
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-700">
                      Password
                    </label>

                    <span className="text-xs font-medium text-blue-600">
                      Demo environment
                    </span>
                  </div>

                  <div className="relative">
                    <Lock
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="
                        w-full rounded-lg border border-slate-200
                        bg-white py-2.5 pl-10 pr-3
                        text-sm text-slate-900
                        outline-none
                        transition
                        placeholder:text-slate-400
                        hover:border-slate-300
                        focus:border-blue-500
                        focus:ring-4
                        focus:ring-blue-500/10
                      "
                    />
                  </div>
                </div>

                {/* Remember */}
                <div className="flex items-center justify-between">

                  <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-500">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 rounded border-slate-300 accent-blue-600"
                    />

                    Remember me
                  </label>

                  <span className="cursor-pointer text-xs font-medium text-blue-600 hover:text-blue-700">
                    Forgot password?
                  </span>

                </div>

                {/* Error */}
                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                {/* Submit */}
                <Button
                  type="submit"
                  size="lg"
                  disabled={loading}
                  className="
                    w-full
                    bg-blue-600
                    text-white
                    shadow-sm
                    hover:bg-blue-700
                  "
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in to CartForge
                      <ArrowRight size={17} />
                    </>
                  )}
                </Button>

              </form>

              {/* Demo credentials */}
              <div className="mt-6 rounded-lg border border-blue-100 bg-blue-50/60 px-4 py-3.5">

                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-100">
                    <Terminal size={13} className="text-blue-600" />
                  </div>

                  <p className="text-xs font-semibold text-blue-900">
                    Demo credentials
                  </p>
                </div>

                <div className="mt-2 space-y-1 font-mono text-xs text-blue-800">
                  <p>admin@devops-platform.io</p>
                  <p>demo1234</p>
                </div>

              </div>

            </div>

            {/* Bottom status */}
            <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-400">
              <CheckCircle2 size={13} className="text-emerald-500" />
              CartForge services are ready
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

/* ---------------- Pipeline Components ---------------- */

function PipelineStep({
  icon,
  label,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  color: 'blue' | 'teal' | 'emerald';
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    teal: 'bg-teal-50 text-teal-600 border-teal-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-lg border ${colors[color]}`}
      >
        {icon}
      </div>

      <span className="text-[11px] font-medium text-slate-500">
        {label}
      </span>
    </div>
  );
}

function PipelineLine() {
  return (
    <div className="mb-5 h-px w-7 bg-slate-200 sm:w-10">
      <div className="h-px w-1/2 bg-blue-300" />
    </div>
  );
}