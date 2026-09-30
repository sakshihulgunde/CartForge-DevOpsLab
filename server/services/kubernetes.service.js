'use strict';

const { spawn } = require('child_process');

// ============================================================
// KUBECTL RUNNER
// ============================================================

function runKubectl(args = []) {
    return new Promise((resolve, reject) => {
        const kubectl = spawn('kubectl', args, {
            windowsHide: true,
            shell: false
        });

        let stdout = '';
        let stderr = '';

        kubectl.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        kubectl.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        kubectl.on('error', (error) => {
            reject(error);
        });

        kubectl.on('close', (code) => {
            if (code === 0) {
                resolve(stdout.trim());
            } else {
                reject(
                    new Error(
                        stderr.trim() ||
                        stdout.trim() ||
                        `kubectl exited with code ${code}`
                    )
                );
            }
        });
    });
}

// ============================================================
// CLUSTER
// ============================================================

async function getClusterInfo() {
    return runKubectl(['cluster-info']);
}

async function getNodes() {
    return runKubectl([
        'get',
        'nodes',
        '-o',
        'json'
    ]);
}

// ============================================================
// PODS
// ============================================================

async function getPods(namespace = 'default') {
    return runKubectl([
        'get',
        'pods',
        '-n',
        namespace,
        '-o',
        'json'
    ]);
}

async function getPodLogs(
    podName,
    namespace = 'default'
) {
    return runKubectl([
        'logs',
        podName,
        '-n',
        namespace
    ]);
}

async function deletePod(
    podName,
    namespace = 'default'
) {
    return runKubectl([
        'delete',
        'pod',
        podName,
        '-n',
        namespace
    ]);
}

// ============================================================
// DEPLOYMENTS
// ============================================================

async function getDeployments(
    namespace = 'default'
) {
    return runKubectl([
        'get',
        'deployments',
        '-n',
        namespace,
        '-o',
        'json'
    ]);
}

async function scaleDeployment(
    name,
    replicas,
    namespace = 'default'
) {
    return runKubectl([
        'scale',
        'deployment',
        name,
        '-n',
        namespace,
        `--replicas=${replicas}`
    ]);
}

async function restartDeployment(
    name,
    namespace = 'default'
) {
    return runKubectl([
        'rollout',
        'restart',
        'deployment',
        name,
        '-n',
        namespace
    ]);
}

async function deleteDeployment(
    name,
    namespace = 'default'
) {
    return runKubectl([
        'delete',
        'deployment',
        name,
        '-n',
        namespace
    ]);
}

// ============================================================
// SERVICES
// ============================================================

async function getServices(
    namespace = 'default'
) {
    return runKubectl([
        'get',
        'services',
        '-n',
        namespace,
        '-o',
        'json'
    ]);
}

// ============================================================
// NAMESPACES
// ============================================================

async function getNamespaces() {
    return runKubectl([
        'get',
        'namespaces',
        '-o',
        'json'
    ]);
}

async function createNamespace(name) {
    return runKubectl([
        'create',
        'namespace',
        name
    ]);
}

async function deleteNamespace(name) {
    return runKubectl([
        'delete',
        'namespace',
        name
    ]);
}

// ============================================================
// YAML
// ============================================================

async function applyYaml(yamlContent) {
    return new Promise((resolve, reject) => {
        const kubectl = spawn(
            'kubectl',
            ['apply', '-f', '-'],
            {
                windowsHide: true,
                shell: false
            }
        );

        let stdout = '';
        let stderr = '';

        kubectl.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        kubectl.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        kubectl.on('error', reject);

        kubectl.on('close', (code) => {
            if (code === 0) {
                resolve(stdout.trim());
            } else {
                reject(
                    new Error(
                        stderr.trim() ||
                        stdout.trim() ||
                        `kubectl apply failed with code ${code}`
                    )
                );
            }
        });

        kubectl.stdin.write(yamlContent);
        kubectl.stdin.end();
    });
}

// ============================================================
// KUBERNETES TERMINAL
// ============================================================

async function executeKubernetesCommand(
    command,
    namespace = 'default'
) {
    if (
        typeof command !== 'string' ||
        !command.trim()
    ) {
        throw new Error('Kubernetes command is required');
    }

    const input = command.trim();

    // Remove optional "$" prompt
    const cleanCommand = input.startsWith('$ ')
        ? input.substring(2).trim()
        : input;

    // --------------------------------------------------------
    // GET COMMANDS
    // --------------------------------------------------------

    if (cleanCommand === 'kubectl get pods') {
        return runKubectl([
            'get',
            'pods',
            '-n',
            namespace
        ]);
    }

    if (cleanCommand === 'kubectl get deployments') {
        return runKubectl([
            'get',
            'deployments',
            '-n',
            namespace
        ]);
    }

    if (cleanCommand === 'kubectl get services') {
        return runKubectl([
            'get',
            'services',
            '-n',
            namespace
        ]);
    }

    if (cleanCommand === 'kubectl get namespaces') {
        return runKubectl([
            'get',
            'namespaces'
        ]);
    }

    if (cleanCommand === 'kubectl get nodes') {
        return runKubectl([
            'get',
            'nodes'
        ]);
    }

    // --------------------------------------------------------
    // DESCRIBE POD
    // --------------------------------------------------------

    const describeMatch = cleanCommand.match(
        /^kubectl describe pod ([a-z0-9]([-a-z0-9]*[a-z0-9])?)$/
    );

    if (describeMatch) {
        return runKubectl([
            'describe',
            'pod',
            describeMatch[1],
            '-n',
            namespace
        ]);
    }

    // --------------------------------------------------------
    // POD LOGS
    // --------------------------------------------------------

    const logsMatch = cleanCommand.match(
        /^kubectl logs ([a-z0-9]([-a-z0-9]*[a-z0-9])?)$/
    );

    if (logsMatch) {
        return runKubectl([
            'logs',
            logsMatch[1],
            '-n',
            namespace
        ]);
    }

    // --------------------------------------------------------
    // SCALE DEPLOYMENT
    // --------------------------------------------------------

    const scaleMatch = cleanCommand.match(
        /^kubectl scale deployment ([a-z0-9]([-a-z0-9]*[a-z0-9])?) --replicas=([0-9]+)$/
    );

    if (scaleMatch) {
        const deploymentName = scaleMatch[1];
        const replicas = Number(scaleMatch[3]);

        if (replicas < 0 || replicas > 20) {
            throw new Error(
                'Replicas must be between 0 and 20'
            );
        }

        return runKubectl([
            'scale',
            'deployment',
            deploymentName,
            '-n',
            namespace,
            `--replicas=${replicas}`
        ]);
    }

    // --------------------------------------------------------
    // UNKNOWN COMMAND
    // --------------------------------------------------------

    throw new Error(
        'Command not allowed. Supported commands: ' +
        'kubectl get pods, ' +
        'kubectl get deployments, ' +
        'kubectl get services, ' +
        'kubectl get namespaces, ' +
        'kubectl get nodes, ' +
        'kubectl describe pod <pod-name>, ' +
        'kubectl logs <pod-name>, ' +
        'kubectl scale deployment <name> --replicas=<number>'
    );
}

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
    runKubectl,
    getClusterInfo,
    getNodes,
    getPods,
    getPodLogs,
    deletePod,
    getDeployments,
    scaleDeployment,
    restartDeployment,
    deleteDeployment,
    getServices,
    getNamespaces,
    createNamespace,
    deleteNamespace,
    applyYaml,
    executeKubernetesCommand
};