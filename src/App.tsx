
import { useCallback, useState } from 'react';
import {
  AuthProvider,
  useAuth,
} from '@/context/AuthContext';

import Sidebar from '@/components/layout/Sidebar';

import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';

import JenkinsPage from '@/pages/jenkins/JenkinsPage';
import GitHubPage from '@/pages/GitHubPage';

import ApachePage from '@/pages/ApachePage';
import BashAutomationPage from '@/pages/BashAutomationPage';
import MonitoringPage from '@/pages/MonitoringPage';

/*
 * ============================
 * DOCKER PAGE
 * ============================
 */
import DockerPage from '@/pages/DockerPage';
import KubernetesPage from '@/pages/KubernetesPage';
/*
 * ============================
 * AWS EC2 PAGE
 * ============================
 */
import AWSPage from '@/pages/AWSPage';

import ComingSoon, {
  DocumentationPage,
  SettingsPage,
} from '@/pages/Placeholder';

import { Reports } from '@/pages/Reports';

import {
  BUILDS,
  PIPELINES,
} from '@/data/jenkinsData';

import type { ModuleKey } from '@/types';

function Shell() {
  const { user } = useAuth();

  const [module, setModule] =
    useState<ModuleKey>('dashboard');

  const [jenkinsTab, setJenkinsTab] =
    useState('overview');

  const [buildTrigger, setBuildTrigger] =
    useState<{
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

        if (
          tab === 'execution' &&
          build
        ) {
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
      <Sidebar
        current={module}
        onNavigate={navigate}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl">
            {/* ============================
                DASHBOARD
               ============================ */}

            {module === 'dashboard' && (
              <Dashboard
                onNavigate={navigate}
              />
            )}

            {/* ============================
                AWS EC2
               ============================ */}

            {module === 'aws' && (
              <AWSPage />
            )}

            {/* ============================
                JENKINS
               ============================ */}

            {module === 'jenkins' && (
              <JenkinsPage
                initialTab={jenkinsTab}
                buildTrigger={buildTrigger}
                onNavigate={navigate}
              />
            )}

            {/* ============================
                GITHUB
               ============================ */}

            {module === 'github' && (
              <GitHubPage />
            )}

            {/* ============================
                APACHE
               ============================ */}

            {module === 'apache' && (
              <ApachePage />
            )}

            {/* ============================
                AUTOMATION
               ============================ */}

            {module === 'automation' && (
              <BashAutomationPage />
            )}

            {/* ============================
                MONITORING
               ============================ */}

            {module === 'monitoring' && (
              <MonitoringPage />
            )}

            {/* ============================
                DOCKER
               ============================ */}

            {module === 'docker' && (
              <DockerPage />
            )}

            {/* ============================
                REPORTS
               ============================ */}

            {module === 'reports' && (
              <Reports
                builds={BUILDS}
                pipelines={PIPELINES}
              />
            )}

            {/* ============================
                DOCUMENTATION
               ============================ */}

            {module === 'documentation' && (
              <DocumentationPage />
            )}

            {/* ============================
                SETTINGS
               ============================ */}

            {module === 'settings' && (
              <SettingsPage />
            )}

            {/* ============================
                UPCOMING MODULES
               ============================ */}

            {(module === 'linux' ||
              module === 'terraform') && (
                <ComingSoon module={module} />
              )}

            {module === 'kubernetes' && (
              <KubernetesPage />
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

