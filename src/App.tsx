import { useCallback, useState } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import JenkinsPage from '@/pages/jenkins/JenkinsPage';
import ComingSoon, {
  DocumentationPage,
  SettingsPage,
} from '@/pages/Placeholder';
import { Reports } from '@/pages/Reports';
import { BUILDS, PIPELINES } from '@/data/jenkinsData';
import type { ModuleKey } from '@/types';

function Shell() {
  const { user } = useAuth();

  const [module, setModule] = useState<ModuleKey>('dashboard');
  const [jenkinsTab, setJenkinsTab] = useState('overview');
  const [buildTrigger, setBuildTrigger] = useState<{
    name: string;
    n: number;
  } | null>(null);

  const navigate = useCallback(
    (k: ModuleKey, tab?: string, build?: string) => {
      setModule(k);

      if (k === 'jenkins' && tab) {
        setJenkinsTab(tab);

        if (tab === 'execution' && build) {
          setBuildTrigger({
            name: build,
            n: Date.now(),
          });
        }
      } else if (k === 'jenkins') {
        setJenkinsTab('overview');
      }
    },
    [],
  );

  if (!user) {
    return <Login />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-ink-950">
      {/* Sidebar */}
      <Sidebar current={module} onNavigate={navigate} />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl">

            {/* Dashboard */}
            {module === 'dashboard' && (
              <Dashboard onNavigate={navigate} />
            )}

            {/* Jenkins */}
            {module === 'jenkins' && (
              <JenkinsPage
                initialTab={jenkinsTab}
                buildTrigger={buildTrigger}
                onNavigate={navigate}
              />
            )}

            {/* Reports */}
            {module === 'reports' && (
              <Reports
                builds={BUILDS}
                pipelines={PIPELINES}
              />
            )}

            {/* Documentation */}
            {module === 'documentation' && (
              <DocumentationPage />
            )}

            {/* Settings */}
            {module === 'settings' && (
              <SettingsPage />
            )}

            {/* Existing DevOps Modules */}
            {(module === 'aws' ||
              module === 'linux' ||
              module === 'github' ||
              module === 'automation' ||
              module === 'apache' ||
              module === 'monitoring') && (
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