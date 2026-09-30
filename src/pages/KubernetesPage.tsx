import React, { useEffect, useState } from 'react';

const API_BASE =
    import.meta.env.VITE_API_BASE_URL ||
    'http://localhost:5000';

type Tab =
    | 'dashboard'
    | 'pods'
    | 'deployments'
    | 'services'
    | 'namespaces'
    | 'yaml';

interface KubernetesPageProps { }

const KubernetesPage: React.FC<KubernetesPageProps> = () => {
    const [activeTab, setActiveTab] =
        useState<Tab>('dashboard');

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState('');

    const [nodes, setNodes] =
        useState<any[]>([]);

    const [pods, setPods] =
        useState<any[]>([]);

    const [deployments, setDeployments] =
        useState<any[]>([]);

    const [services, setServices] =
        useState<any[]>([]);

    const [namespaces, setNamespaces] =
        useState<any[]>([]);

    const [namespace, setNamespace] =
        useState('default');

    const [yaml, setYaml] =
        useState(`apiVersion: apps/v1
kind: Deployment
metadata:
  name: cartforge-demo
spec:
  replicas: 2
  selector:
    matchLabels:
      app: cartforge-demo
  template:
    metadata:
      labels:
        app: cartforge-demo
    spec:
      containers:
        - name: nginx
          image: nginx:alpine
          ports:
            - containerPort: 80`);

    const [logs, setLogs] =
        useState('');

    const [selectedPod, setSelectedPod] =
        useState('');

    const [message, setMessage] =
        useState('');

    // ============================================================
    // API HELPER
    // ============================================================

    const apiRequest = async (
        url: string,
        options?: RequestInit
    ) => {
        const response = await fetch(
            `${API_BASE}${url}`,
            {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...(options?.headers || {})
                }
            }
        );

        const data = await response.json();

        if (!response.ok || data.success === false) {
            throw new Error(
                data.error || 'Request failed'
            );
        }

        return data;
    };

    // ============================================================
    // LOAD NODES
    // ============================================================

    const loadNodes = async () => {
        const result =
            await apiRequest(
                '/api/kubernetes/nodes'
            );

        setNodes(
            result.data?.items || []
        );
    };

    // ============================================================
    // LOAD PODS
    // ============================================================

    const loadPods = async () => {
        const result =
            await apiRequest(
                `/api/kubernetes/pods?namespace=${encodeURIComponent(
                    namespace
                )}`
            );

        setPods(
            result.data?.items || []
        );
    };

    // ============================================================
    // LOAD DEPLOYMENTS
    // ============================================================

    const loadDeployments = async () => {
        const result =
            await apiRequest(
                `/api/kubernetes/deployments?namespace=${encodeURIComponent(
                    namespace
                )}`
            );

        setDeployments(
            result.data?.items || []
        );
    };

    // ============================================================
    // LOAD SERVICES
    // ============================================================

    const loadServices = async () => {
        const result =
            await apiRequest(
                `/api/kubernetes/services?namespace=${encodeURIComponent(
                    namespace
                )}`
            );

        setServices(
            result.data?.items || []
        );
    };

    // ============================================================
    // LOAD NAMESPACES
    // ============================================================

    const loadNamespaces = async () => {
        const result =
            await apiRequest(
                '/api/kubernetes/namespaces'
            );

        setNamespaces(
            result.data?.items || []
        );
    };

    // ============================================================
    // LOAD ALL
    // ============================================================

    const loadAll = async () => {
        try {
            setLoading(true);
            setError('');

            await Promise.all([
                loadNodes(),
                loadPods(),
                loadDeployments(),
                loadServices(),
                loadNamespaces()
            ]);
        } catch (err: any) {
            setError(
                err?.message ||
                'Failed to load Kubernetes data'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAll();
    }, [namespace]);

    // ============================================================
    // DELETE POD
    // ============================================================

    const handleDeletePod = async (
        podName: string
    ) => {
        if (
            !window.confirm(
                `Delete pod "${podName}"?`
            )
        ) {
            return;
        }

        try {
            setError('');
            setMessage('');

            await apiRequest(
                `/api/kubernetes/pods/${encodeURIComponent(
                    podName
                )}?namespace=${encodeURIComponent(
                    namespace
                )}`,
                {
                    method: 'DELETE'
                }
            );

            setMessage(
                `Pod "${podName}" deleted successfully.`
            );

            await loadPods();
        } catch (err: any) {
            setError(err.message);
        }
    };

    // ============================================================
    // POD LOGS
    // ============================================================

    const handleLogs = async (
        podName: string
    ) => {
        try {
            setSelectedPod(podName);
            setLogs('');
            setError('');

            const result =
                await apiRequest(
                    `/api/kubernetes/pods/${encodeURIComponent(
                        podName
                    )}/logs?namespace=${encodeURIComponent(
                        namespace
                    )}`
                );

            setLogs(result.data || 'No logs available.');
        } catch (err: any) {
            setError(err.message);
        }
    };

    // ============================================================
    // SCALE
    // ============================================================

    const handleScale = async (
        deploymentName: string
    ) => {
        const value = window.prompt(
            'Enter number of replicas:',
            '2'
        );

        if (value === null) return;

        const replicas =
            Number(value);

        if (
            !Number.isInteger(replicas) ||
            replicas < 0 ||
            replicas > 20
        ) {
            setError(
                'Replicas must be between 0 and 20.'
            );
            return;
        }

        try {
            setError('');
            setMessage('');

            await apiRequest(
                `/api/kubernetes/deployments/${encodeURIComponent(
                    deploymentName
                )}/scale`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        namespace,
                        replicas
                    })
                }
            );

            setMessage(
                `Deployment "${deploymentName}" scaled to ${replicas} replicas.`
            );

            await loadDeployments();
            await loadPods();
        } catch (err: any) {
            setError(err.message);
        }
    };

    // ============================================================
    // RESTART
    // ============================================================

    const handleRestart = async (
        deploymentName: string
    ) => {
        try {
            setError('');
            setMessage('');

            await apiRequest(
                `/api/kubernetes/deployments/${encodeURIComponent(
                    deploymentName
                )}/restart`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        namespace
                    })
                }
            );

            setMessage(
                `Deployment "${deploymentName}" restarted.`
            );

            await loadDeployments();
            await loadPods();
        } catch (err: any) {
            setError(err.message);
        }
    };

    // ============================================================
    // DELETE DEPLOYMENT
    // ============================================================

    const handleDeleteDeployment = async (
        deploymentName: string
    ) => {
        if (
            !window.confirm(
                `Delete deployment "${deploymentName}"?`
            )
        ) {
            return;
        }

        try {
            setError('');
            setMessage('');

            await apiRequest(
                `/api/kubernetes/deployments/${encodeURIComponent(
                    deploymentName
                )}?namespace=${encodeURIComponent(
                    namespace
                )}`,
                {
                    method: 'DELETE'
                }
            );

            setMessage(
                `Deployment "${deploymentName}" deleted.`
            );

            await loadDeployments();
            await loadPods();
        } catch (err: any) {
            setError(err.message);
        }
    };

    // ============================================================
    // APPLY YAML
    // ============================================================

    const handleApplyYaml = async () => {
        if (!yaml.trim()) {
            setError(
                'Please enter Kubernetes YAML.'
            );
            return;
        }

        try {
            setError('');
            setMessage('');

            const result =
                await apiRequest(
                    '/api/kubernetes/apply',
                    {
                        method: 'POST',
                        body: JSON.stringify({
                            yaml
                        })
                    }
                );

            setMessage(
                result.data ||
                'Kubernetes YAML applied successfully.'
            );

            await loadAll();
        } catch (err: any) {
            setError(err.message);
        }
    };

    // ============================================================
    // STATS
    // ============================================================

    const readyNodes =
        nodes.filter(
            (node) =>
                node.status?.conditions?.some(
                    (condition: any) =>
                        condition.type === 'Ready' &&
                        condition.status === 'True'
                )
        ).length;

    const runningPods =
        pods.filter(
            (pod) =>
                pod.status?.phase === 'Running'
        ).length;

    // ============================================================
    // UI
    // ============================================================

    const tabs = [
        ['dashboard', 'Dashboard'],
        ['pods', 'Pods'],
        ['deployments', 'Deployments'],
        ['services', 'Services'],
        ['namespaces', 'Namespaces'],
        ['yaml', 'YAML']
    ] as const;

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            {/* HEADER */}

            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Kubernetes
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage your real Kubernetes cluster through CartForge.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <select
                        value={namespace}
                        onChange={(e) =>
                            setNamespace(e.target.value)
                        }
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
                    >
                        {namespaces.length === 0 ? (
                            <option value="default">
                                default
                            </option>
                        ) : (
                            namespaces.map((item) => (
                                <option
                                    key={item.metadata?.name}
                                    value={item.metadata?.name}
                                >
                                    {item.metadata?.name}
                                </option>
                            ))
                        )}
                    </select>

                    <button
                        onClick={loadAll}
                        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                    >
                        {loading ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>
            </div>

            {/* MESSAGES */}

            {error && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {message && (
                <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {message}
                </div>
            )}

            {/* TABS */}

            <div className="mb-6 flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-2">
                {tabs.map(([key, label]) => (
                    <button
                        key={key}
                        onClick={() =>
                            setActiveTab(key)
                        }
                        className={`rounded-lg px-4 py-2 text-sm font-medium ${activeTab === key
                            ? 'bg-slate-900 text-white'
                            : 'text-slate-600 hover:bg-slate-100'
                            }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* ====================================================== */}
            {/* DASHBOARD */}
            {/* ====================================================== */}

            {activeTab === 'dashboard' && (
                <div>
                    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                        <div className="rounded-xl border border-slate-200 bg-white p-5">
                            <p className="text-sm text-slate-500">
                                Cluster
                            </p>

                            <p className="mt-2 text-xl font-bold text-green-600">
                                Connected
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                                Minikube
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-5">
                            <p className="text-sm text-slate-500">
                                Nodes
                            </p>

                            <p className="mt-2 text-2xl font-bold text-slate-900">
                                {readyNodes}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                                Ready
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-5">
                            <p className="text-sm text-slate-500">
                                Pods
                            </p>

                            <p className="mt-2 text-2xl font-bold text-slate-900">
                                {pods.length}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                                {runningPods} running
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-5">
                            <p className="text-sm text-slate-500">
                                Deployments
                            </p>

                            <p className="mt-2 text-2xl font-bold text-slate-900">
                                {deployments.length}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                                Namespace: {namespace}
                            </p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-6">
                        <h2 className="mb-4 text-lg font-semibold text-slate-900">
                            Cluster Nodes
                        </h2>

                        {nodes.map((node) => {
                            const ready =
                                node.status?.conditions?.some(
                                    (condition: any) =>
                                        condition.type === 'Ready' &&
                                        condition.status === 'True'
                                );

                            return (
                                <div
                                    key={node.metadata?.name}
                                    className="flex items-center justify-between border-b border-slate-100 py-4 last:border-0"
                                >
                                    <div>
                                        <p className="font-medium text-slate-900">
                                            {node.metadata?.name}
                                        </p>

                                        <p className="text-sm text-slate-500">
                                            {node.status?.nodeInfo?.kubeletVersion}
                                        </p>
                                    </div>

                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-medium ${ready
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                            }`}
                                    >
                                        {ready
                                            ? 'Ready'
                                            : 'Not Ready'}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ====================================================== */}
            {/* PODS */}
            {/* ====================================================== */}

            {activeTab === 'pods' && (
                <div className="rounded-xl border border-slate-200 bg-white">
                    <div className="border-b border-slate-200 p-5">
                        <h2 className="text-lg font-semibold text-slate-900">
                            Pods
                        </h2>

                        <p className="text-sm text-slate-500">
                            Namespace: {namespace}
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-5 py-3">
                                        Name
                                    </th>
                                    <th className="px-5 py-3">
                                        Status
                                    </th>
                                    <th className="px-5 py-3">
                                        Restarts
                                    </th>
                                    <th className="px-5 py-3">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {pods.map((pod) => (
                                    <tr
                                        key={pod.metadata?.name}
                                        className="border-t border-slate-100"
                                    >
                                        <td className="px-5 py-4 font-medium text-slate-900">
                                            {pod.metadata?.name}
                                        </td>

                                        <td className="px-5 py-4">
                                            {pod.status?.phase}
                                        </td>

                                        <td className="px-5 py-4">
                                            {pod.status?.containerStatuses?.reduce(
                                                (
                                                    total: number,
                                                    container: any
                                                ) =>
                                                    total +
                                                    (container.restartCount || 0),
                                                0
                                            ) || 0}
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    onClick={() =>
                                                        handleLogs(
                                                            pod.metadata?.name
                                                        )
                                                    }
                                                    className="rounded-md bg-slate-100 px-3 py-1.5 text-xs text-slate-700"
                                                >
                                                    Logs
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        handleDeletePod(
                                                            pod.metadata?.name
                                                        )
                                                    }
                                                    className="rounded-md bg-red-100 px-3 py-1.5 text-xs text-red-700"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {pods.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="px-5 py-10 text-center text-slate-400"
                                        >
                                            No pods found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ====================================================== */}
            {/* LOGS */}
            {/* ====================================================== */}

            {activeTab === 'pods' &&
                selectedPod && (
                    <div className="mt-5 rounded-xl border border-slate-200 bg-slate-950 p-5">
                        <div className="mb-3 flex items-center justify-between">
                            <h2 className="font-semibold text-white">
                                Logs: {selectedPod}
                            </h2>

                            <button
                                onClick={() => {
                                    setSelectedPod('');
                                    setLogs('');
                                }}
                                className="text-xs text-slate-400 hover:text-white"
                            >
                                Close
                            </button>
                        </div>

                        <pre className="max-h-96 overflow-auto whitespace-pre-wrap text-xs text-green-400">
                            {logs}
                        </pre>
                    </div>
                )}

            {/* ====================================================== */}
            {/* DEPLOYMENTS */}
            {/* ====================================================== */}

            {activeTab === 'deployments' && (
                <div className="rounded-xl border border-slate-200 bg-white">
                    <div className="border-b border-slate-200 p-5">
                        <h2 className="text-lg font-semibold text-slate-900">
                            Deployments
                        </h2>

                        <p className="text-sm text-slate-500">
                            Namespace: {namespace}
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-5 py-3">
                                        Name
                                    </th>
                                    <th className="px-5 py-3">
                                        Desired
                                    </th>
                                    <th className="px-5 py-3">
                                        Ready
                                    </th>
                                    <th className="px-5 py-3">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {deployments.map((deployment) => (
                                    <tr
                                        key={deployment.metadata?.name}
                                        className="border-t border-slate-100"
                                    >
                                        <td className="px-5 py-4 font-medium text-slate-900">
                                            {deployment.metadata?.name}
                                        </td>

                                        <td className="px-5 py-4">
                                            {deployment.spec?.replicas ?? 0}
                                        </td>

                                        <td className="px-5 py-4">
                                            {deployment.status?.readyReplicas || 0}
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    onClick={() =>
                                                        handleScale(
                                                            deployment.metadata?.name
                                                        )
                                                    }
                                                    className="rounded-md bg-blue-100 px-3 py-1.5 text-xs text-blue-700"
                                                >
                                                    Scale
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        handleRestart(
                                                            deployment.metadata?.name
                                                        )
                                                    }
                                                    className="rounded-md bg-slate-100 px-3 py-1.5 text-xs text-slate-700"
                                                >
                                                    Restart
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        handleDeleteDeployment(
                                                            deployment.metadata?.name
                                                        )
                                                    }
                                                    className="rounded-md bg-red-100 px-3 py-1.5 text-xs text-red-700"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {deployments.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="px-5 py-10 text-center text-slate-400"
                                        >
                                            No deployments found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ====================================================== */}
            {/* SERVICES */}
            {/* ====================================================== */}

            {activeTab === 'services' && (
                <div className="rounded-xl border border-slate-200 bg-white">
                    <div className="border-b border-slate-200 p-5">
                        <h2 className="text-lg font-semibold text-slate-900">
                            Services
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-5 py-3">
                                        Name
                                    </th>
                                    <th className="px-5 py-3">
                                        Type
                                    </th>
                                    <th className="px-5 py-3">
                                        Cluster IP
                                    </th>
                                    <th className="px-5 py-3">
                                        Ports
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {services.map((service) => (
                                    <tr
                                        key={service.metadata?.name}
                                        className="border-t border-slate-100"
                                    >
                                        <td className="px-5 py-4 font-medium text-slate-900">
                                            {service.metadata?.name}
                                        </td>

                                        <td className="px-5 py-4">
                                            {service.spec?.type}
                                        </td>

                                        <td className="px-5 py-4">
                                            {service.spec?.clusterIP}
                                        </td>

                                        <td className="px-5 py-4">
                                            {service.spec?.ports
                                                ?.map(
                                                    (port: any) =>
                                                        `${port.port}:${port.targetPort}`
                                                )
                                                .join(', ') || '-'}
                                        </td>
                                    </tr>
                                ))}

                                {services.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="px-5 py-10 text-center text-slate-400"
                                        >
                                            No services found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ====================================================== */}
            {/* NAMESPACES */}
            {/* ====================================================== */}

            {activeTab === 'namespaces' && (
                <div className="rounded-xl border border-slate-200 bg-white">
                    <div className="border-b border-slate-200 p-5">
                        <h2 className="text-lg font-semibold text-slate-900">
                            Namespaces
                        </h2>
                    </div>

                    <div className="grid gap-3 p-5 md:grid-cols-2 lg:grid-cols-3">
                        {namespaces.map((item) => (
                            <div
                                key={item.metadata?.name}
                                className="rounded-lg border border-slate-200 p-4"
                            >
                                <p className="font-medium text-slate-900">
                                    {item.metadata?.name}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Status:{' '}
                                    {item.status?.phase || 'Unknown'}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ====================================================== */}
            {/* YAML */}
            {/* ====================================================== */}

            {activeTab === 'yaml' && (
                <div className="rounded-xl border border-slate-200 bg-white">
                    <div className="border-b border-slate-200 p-5">
                        <h2 className="text-lg font-semibold text-slate-900">
                            Kubernetes YAML
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Apply real Kubernetes manifests to the connected cluster.
                        </p>
                    </div>

                    <div className="p-5">
                        <textarea
                            value={yaml}
                            onChange={(e) =>
                                setYaml(e.target.value)
                            }
                            className="h-96 w-full rounded-lg border border-slate-300 bg-slate-950 p-4 font-mono text-sm text-green-400 outline-none"
                            spellCheck={false}
                        />

                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={handleApplyYaml}
                                className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
                            >
                                Apply YAML
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KubernetesPage;