import { useCallback, useState } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';

import Sidebar from '@/components/layout/Sidebar';

import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';

import JenkinsPage from '@/pages/jenkins/JenkinsPage';
import GitHubPage from '@/pages/GitHubPage';

import ApachePage from '@/pages/ApachePage';
import BashAutomationPage from '@/pages/BashAutomationPage';
import MonitoringPage from '@/pages/MonitoringPage';

import ComingSoon, {
  DocumentationPage,
  SettingsPage,
} from '@/pages/Placeholder';

import { Reports } from '@/pages/Reports';

import { BUILDS, PIPELINES } from '@/data/jenkinsData';

import type { ModuleKey } from '@/types';

function Shell() {
  const { user } = useAuth();

  const [module, setModule] =
    useState<ModuleKey>('dashboard');

  const [jenkinsTab, setJenkinsTab] =
    useState('overview');

  const [buildTrigger, setBuildTrigger] = useState<{
    name: string;
    n: number;
  } | null>(null);

  const navigate = useCallback(
    (
      k: ModuleKey,
      tab?: string,
      build?: string,
    ) => {
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

  /*
   * ------------------------------------------------
   * LOGIN
   * ------------------------------------------------
   */

  if (!user) {
    return <Login />;
  }

  /*
   * ------------------------------------------------
   * MAIN APPLICATION
   * ------------------------------------------------
   */

  return (
    <div className="flex h-screen overflow-hidden bg-ink-950">

      {/* ================= SIDEBAR ================= */}

      <Sidebar
        current={module}
        onNavigate={navigate}
      />

      {/* ================= MAIN AREA ================= */}

      <div className="flex flex-1 flex-col overflow-hidden">

        <main className="flex-1 overflow-y-auto">

          <div className="mx-auto max-w-7xl">

            {/* ================= DASHBOARD ================= */}

            {module === 'dashboard' && (
              <Dashboard
                onNavigate={navigate}
              />
            )}

            {/* ================= JENKINS ================= */}

            {module === 'jenkins' && (
              <JenkinsPage
                initialTab={jenkinsTab}
                buildTrigger={buildTrigger}
                onNavigate={navigate}
              />
            )}

            {/* ================= APACHE ================= */}

                            {/* Git & GitHub */}
                {module === 'github' && (
                  <GitHubPage />
                )}

                {/* Apache */}
                {module === 'apache' && (
                  <ApachePage />
                )}

                {/* Bash Automation */}
                {module === 'automation' && (
                  <BashAutomationPage />
                )}

                {/* Monitoring */}
                {module === 'monitoring' && (
                  <MonitoringPage />
                )}

            {/* ================= REPORTS ================= */}

            {module === 'reports' && (
              <Reports
                builds={BUILDS}
                pipelines={PIPELINES}
              />
            )}

            {/* ================= DOCUMENTATION ================= */}

            {module === 'documentation' && (
              <DocumentationPage />
            )}

            {/* ================= SETTINGS ================= */}

            {module === 'settings' && (
              <SettingsPage />
            )}

            {/* ================= OTHER DEVOPS MODULES ================= */}

            {(module === 'aws' ||
              module === 'linux' ||
              module === 'github' ||
              module === 'docker' ||
              module === 'kubernetes' ||
              module === 'terraform') && (
              <ComingSoon module={module} />
            )}

          </div>

        </main>

      </div>

    </div>
  );
}

/*
 * ==================================================
 * APP ROOT
 * ==================================================
 */

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}