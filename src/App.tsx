import { useCallback, useState } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import JenkinsPage from '@/pages/jenkins/JenkinsPage';
import ComingSoon, { DocumentationPage, SettingsPage } from '@/pages/Placeholder';
import { Reports } from '@/pages/Reports';
import { Troubleshooting } from '@/pages/Troubleshooting';
import { BUILDS, PIPELINES } from '@/data/jenkinsData';
import type { ModuleKey } from '@/types';

function Shell() {
  const { user } = useAuth();
  const [module, setModule] = useState<ModuleKey>('dashboard');
  const [jenkinsTab, setJenkinsTab] = useState('overview');
  const [buildTrigger, setBuildTrigger] = useState<{ name: string; n: number } | null>(null);

  const navigate = useCallback((k: ModuleKey, tab?: string, build?: string) => {
    setModule(k);
    if (k === 'jenkins' && tab) {
      setJenkinsTab(tab);
      if (tab === 'execution' && build) {
        setBuildTrigger({ name: build, n: Date.now() });
      }
    } else if (k === 'jenkins') {
      setJenkinsTab('overview');
    }
  }, []);

  if (!user) return <Login />;

  return (
    <div className="flex h-screen overflow-hidden bg-ink-950">
      <Sidebar current={module} onNavigate={navigate} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar current={module} />
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <div className="mx-auto max-w-7xl">
            {module === 'dashboard' && <Dashboard onNavigate={navigate} />}
            {module === 'jenkins' && (
              <JenkinsPage initialTab={jenkinsTab} buildTrigger={buildTrigger} onNavigate={navigate} />
            )}
            {module === 'reports' && <Reports builds={BUILDS} pipelines={PIPELINES} />}
            {module === 'documentation' && <DocumentationPage />}
            {module === 'settings' && <SettingsPage />}
            {(module === 'aws' || module === 'linux' || module === 'github' || module === 'docker' || module === 'kubernetes' || module === 'terraform' || module === 'monitoring') && (
              <ComingSoon module={module} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
