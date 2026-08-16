import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui';
import {
  Lock,
  Mail,
  ArrowRight,
  CheckCircle2,
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
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10 text-slate-900">

      {/* Login Container */}
      <div className="w-full max-w-md">

        {/* Brand */}
        <div className="mb-8 text-center">

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 shadow-sm">
            <Terminal size={23} className="text-white" />
          </div>

          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
            CartForge
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            DevOps Deployment Portal
          </p>

        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-lg sm:p-8">

          {/* Header */}
          <div className="text-center">

            <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
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
                    outline-none transition
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

              <div className="mb-2">
                <label className="text-sm font-medium text-slate-700">
                  Password
                </label>
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
                    outline-none transition
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

        </div>

        {/* Bottom Status */}
        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-400">

          <CheckCircle2
            size={13}
            className="text-emerald-500"
          />

          CartForge services are ready

        </div>

        {/* Footer */}
        <p className="mt-4 text-center text-xs text-slate-400">
          CartForge DevOps Project · 2026
        </p>

      </div>

    </div>
  );
}