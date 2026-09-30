
const Docker = require("dockerode");
const { execFile } = require("child_process");
const fs = require("fs/promises");
const path = require("path");
const os = require("os");

const docker = new Docker();

// ==================================================
// CARTFORGE LEARNER LAB CONFIGURATION
// ==================================================

const LEARNER_IMAGE =
    process.env.CARTFORGE_LAB_IMAGE ||
    "cartforge-learner-lab:latest";

const LEARNER_NETWORK = "cartforge-labs";

const DEFAULT_MEMORY = 512 * 1024 * 1024; // 512 MB
const DEFAULT_CPUS = 500000000; // 0.5 CPU

const LAB_LABELS = {
    project: "cartforge",
    environment: "learner-lab",
    managedBy: "cartforge",
};

// ==================================================
// DOCKER COMPOSE CONFIGURATION
// ==================================================

const COMPOSE_BASE_DIR = path.join(
    __dirname,
    "..",
    "docker-compose-projects"
);

// ==================================================
// HELPERS
// ==================================================

function sanitizeName(value, fallback = "user") {
    const cleaned = String(value || fallback)
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-_]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

    return cleaned || fallback;
}

function sanitizeComposeProjectName(
    value,
    fallback = "cartforge-project"
) {
    const cleaned = String(value || fallback)
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-_]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

    return cleaned || fallback;
}

function isCartForgeLearnerLab(containerInfo) {
    const labels =
        containerInfo?.Config?.Labels || {};

    return (
        labels[`${LAB_LABELS.project}.project`] ===
        LAB_LABELS.project &&
        labels[`${LAB_LABELS.project}.environment`] ===
        LAB_LABELS.environment &&
        labels[`${LAB_LABELS.project}.managedBy`] ===
        LAB_LABELS.managedBy
    );
}

function getLabLabels(learnerId, labName) {
    return {
        [`${LAB_LABELS.project}.project`]:
            LAB_LABELS.project,

        [`${LAB_LABELS.project}.environment`]:
            LAB_LABELS.environment,

        [`${LAB_LABELS.project}.managedBy`]:
            LAB_LABELS.managedBy,

        [`${LAB_LABELS.project}.learnerId`]:
            sanitizeName(learnerId, "user"),

        [`${LAB_LABELS.project}.labName`]:
            sanitizeName(
                labName,
                "devops-lab"
            ),
    };
}

// ==================================================
// DOCKER ENGINE INFO
// ==================================================

async function getDockerInfo() {
    return await docker.info();
}

// ==================================================
// LEARNER LAB NETWORK
// ==================================================

async function ensureLearnerLabNetwork() {
    const networks =
        await docker.listNetworks({
            filters: JSON.stringify({
                name: [LEARNER_NETWORK],
            }),
        });

    const existing = networks.find(
        (network) =>
            network.Name === LEARNER_NETWORK
    );

    if (existing) {
        return docker.getNetwork(
            existing.Id
        );
    }

    return await docker.createNetwork({
        Name: LEARNER_NETWORK,

        Driver: "bridge",

        Labels: {
            [`${LAB_LABELS.project}.project`]:
                LAB_LABELS.project,

            [`${LAB_LABELS.project}.environment`]:
                LAB_LABELS.environment,

            [`${LAB_LABELS.project}.managedBy`]:
                LAB_LABELS.managedBy,
        },
    });
}

// ==================================================
// LEARNER LAB IMAGE
// ==================================================

async function ensureLearnerLabImage() {
    const image =
        docker.getImage(LEARNER_IMAGE);

    try {
        await image.inspect();

        return image;
    } catch (error) {
        if (error.statusCode === 404) {
            throw new Error(
                `Learner lab image "${LEARNER_IMAGE}" was not found. ` +
                `Build it first with: docker build - t ${LEARNER_IMAGE} .`
            );
        }

        throw error;
    }
}

// ==================================================
// CREATE LEARNER DOCKER LAB
// ==================================================

async function createLearnerDockerLab({
    learnerId = "user",
    labName = "devops-lab",
    memory = DEFAULT_MEMORY,
    nanoCpus = DEFAULT_CPUS,
} = {}) {
    await ensureLearnerLabImage();

    await ensureLearnerLabNetwork();

    const safeLearnerId =
        sanitizeName(
            learnerId,
            "user"
        );

    const safeLabName =
        sanitizeName(
            labName,
            "devops-lab"
        );

    const uniqueSuffix =
        Date.now().toString(36);

    const containerName =
        `cartforge-lab-${safeLearnerId}-${safeLabName}-${uniqueSuffix}`.substring(0, 63);

    const labels =
        getLabLabels(
            safeLearnerId,
            safeLabName
        );

    const container =
        await docker.createContainer({
            name: containerName,

            Image: LEARNER_IMAGE,

            Labels: labels,

            Tty: true,

            OpenStdin: true,

            StdinOnce: false,

            WorkingDir: "/workspace",

            Cmd: [
                "/bin/bash",
                "-lc",
                "while true; do sleep 3600; done",
            ],

            HostConfig: {
                Memory:
                    Number(memory) ||
                    DEFAULT_MEMORY,

                NanoCpus:
                    Number(nanoCpus) ||
                    DEFAULT_CPUS,

                NetworkMode:
                    LEARNER_NETWORK,

                AutoRemove: false,

                Binds: [],
            },
        });

    await container.start();

    const info =
        await container.inspect();

    return formatLearnerLab(info);
}

// ==================================================
// GET SINGLE LEARNER LAB
// ==================================================

async function getLearnerDockerLab(
    containerId
) {
    if (!containerId) {
        throw new Error(
            "Learner lab container ID is required"
        );
    }

    const container =
        docker.getContainer(
            containerId
        );

    let info;

    try {
        info =
            await container.inspect();
    } catch (error) {
        if (error.statusCode === 404) {
            throw new Error(
                "Learner lab container was not found"
            );
        }

        throw error;
    }

    if (
        !isCartForgeLearnerLab(info)
    ) {
        throw new Error(
            "Access denied: this container is not a CartForge learner lab"
        );
    }

    return formatLearnerLab(info);
}

// ==================================================
// LIST LEARNER LABS
// ==================================================

async function listLearnerDockerLabs() {
    const containers =
        await docker.listContainers({
            all: true,

            filters: {
                label: [
                    `${LAB_LABELS.project}.project = ${LAB_LABELS.project} `,
                    `${LAB_LABELS.project}.environment = ${LAB_LABELS.environment} `,
                    `${LAB_LABELS.project}.managedBy = ${LAB_LABELS.managedBy} `,
                ],
            },
        });

    return containers.map(
        (container) => ({
            containerId:
                container.Id,

            name:
                container.Names?.[0]
                    ? container.Names[0].replace(
                        /^\//,
                        ""
                    )
                    : null,

            image:
                container.Image,

            state:
                container.State,

            status:
                container.Status,

            labels:
                container.Labels || {},
        })
    );
}

// ==================================================
// FORMAT LEARNER LAB RESPONSE
// ==================================================

function formatLearnerLab(info) {
    const labels =
        info.Config?.Labels || {};

    return {
        containerId:
            info.Id,

        labName:
            labels[
            `${LAB_LABELS.project}.labName`
            ] ||
            "devops-lab",

        learnerId:
            labels[
            `${LAB_LABELS.project}.learnerId`
            ] ||
            "user",

        name:
            info.Name
                ? info.Name.replace(
                    /^\//,
                    ""
                )
                : null,

        image:
            info.Config?.Image ||
            LEARNER_IMAGE,

        state: {
            Status:
                info.State?.Status ||
                "unknown",

            Running:
                Boolean(
                    info.State?.Running
                ),

            Paused:
                Boolean(
                    info.State?.Paused
                ),

            Restarting:
                Boolean(
                    info.State?.Restarting
                ),

            StartedAt:
                info.State?.StartedAt ||
                null,

            FinishedAt:
                info.State?.FinishedAt ||
                null,
        },

        createdAt:
            info.Created,

        labels,
    };
}

// ==================================================
// EXECUTE COMMAND INSIDE LEARNER LAB
// ==================================================

async function executeLearnerDockerCommand(
    containerId,
    command
) {
    if (!containerId) {
        throw new Error(
            "Learner lab container ID is required"
        );
    }

    if (
        !command ||
        !String(command).trim()
    ) {
        throw new Error(
            "Command is required"
        );
    }

    const container =
        docker.getContainer(
            containerId
        );

    const info =
        await container.inspect();

    if (
        !isCartForgeLearnerLab(info)
    ) {
        throw new Error(
            "Access denied: this container is not a CartForge learner lab"
        );
    }

    if (!info.State?.Running) {
        throw new Error(
            "Learner lab is not running"
        );
    }

    const exec =
        await container.exec({
            Cmd: [
                "/bin/bash",
                "-lc",
                String(command),
            ],

            AttachStdout: true,

            AttachStderr: true,

            Tty: false,

            User: "learner",

            WorkingDir: "/workspace",
        });

    const stream =
        await exec.start({
            hijack: true,

            stdin: false,

            Tty: false,
        });

    return await new Promise(
        (resolve, reject) => {
            let output = "";

            docker.modem.demuxStream(
                stream,

                {
                    write: (data) => {
                        output +=
                            data.toString();
                    },
                },

                {
                    write: (data) => {
                        output +=
                            data.toString();
                    },
                }
            );

            stream.on(
                "end",
                async () => {
                    try {
                        const result =
                            await exec.inspect();

                        resolve({
                            command:
                                String(
                                    command
                                ),

                            output,

                            exitCode:
                                result.ExitCode ??
                                0,
                        });
                    } catch (
                    error
                    ) {
                        reject(
                            error
                        );
                    }
                }
            );

            stream.on(
                "error",
                reject
            );
        }
    );
}

// ==================================================
// STOP LEARNER LAB
// ==================================================

async function stopLearnerDockerLab(
    containerId
) {
    if (!containerId) {
        throw new Error(
            "Learner lab container ID is required"
        );
    }

    const container =
        docker.getContainer(
            containerId
        );

    const info =
        await container.inspect();

    if (
        !isCartForgeLearnerLab(info)
    ) {
        throw new Error(
            "Access denied: this container is not a CartForge learner lab"
        );
    }

    if (info.State?.Running) {
        await container.stop({
            t: 5,
        });
    }

    const updatedInfo =
        await container.inspect();

    return formatLearnerLab(
        updatedInfo
    );
}

// ==================================================
// DESTROY LEARNER LAB
// ==================================================

async function destroyLearnerDockerLab(
    containerId
) {
    if (!containerId) {
        throw new Error(
            "Learner lab container ID is required"
        );
    }

    const container =
        docker.getContainer(
            containerId
        );

    const info =
        await container.inspect();

    if (
        !isCartForgeLearnerLab(info)
    ) {
        throw new Error(
            "Access denied: this container is not a CartForge learner lab"
        );
    }

    await container.remove({
        force: true,
        v: true,
    });

    return {
        success: true,

        containerId,

        message:
            "CartForge learner lab destroyed",
    };
}

// ==================================================
// CONTAINERS
// ==================================================

async function getContainers(
    all = true
) {
    return await docker.listContainers({
        all,
    });
}

// ==================================================
// GET SINGLE CONTAINER
// ==================================================

function getContainer(containerId) {
    return docker.getContainer(
        containerId
    );
}

// ==================================================
// CREATE GENERIC CONTAINER
// ==================================================

async function createContainer({
    image,
    name,
    hostPort,
    containerPort,
    start = false,
}) {
    if (!image) {
        throw new Error(
            "Docker image is required"
        );
    }

    const containerName =
        name?.trim() || undefined;

    const portNumber =
        Number(containerPort || 80);

    const hostPortNumber =
        Number(hostPort || 8080);

    const createOptions = {
        Image: image,

        ...(containerName
            ? {
                name: containerName,
            }
            : {}),

        ExposedPorts: {
            [`${portNumber}/tcp`]: {},
        },

        HostConfig: {
            PortBindings: {
                [`${portNumber}/tcp`]: [
                    {
                        HostPort:
                            String(
                                hostPortNumber
                            ),
                    },
                ],
            },
        },
    };

    const container =
        await docker.createContainer(
            createOptions
        );

    if (start) {
        await container.start();
    }

    return {
        container,

        started: start,
    };
}

// ==================================================
// CONTAINER LOGS
// ==================================================

async function getContainerLogs(
    containerId
) {
    if (!containerId) {
        throw new Error(
            "Container ID is required"
        );
    }

    const container =
        docker.getContainer(
            containerId
        );

    const logs =
        await container.logs({
            stdout: true,

            stderr: true,

            tail: "all",
        });

    const buffer =
        Buffer.isBuffer(logs)
            ? logs
            : Buffer.from(logs);

    let offset = 0;

    let output = "";

    while (
        offset + 8 <=
        buffer.length
    ) {
        const streamType =
            buffer[offset];

        if (
            streamType !== 1 &&
            streamType !== 2
        ) {
            break;
        }

        const size =
            buffer.readUInt32BE(
                offset + 4
            );

        if (
            offset + 8 + size >
            buffer.length
        ) {
            break;
        }

        output += buffer
            .subarray(
                offset + 8,
                offset + 8 + size
            )
            .toString("utf8");

        offset +=
            8 + size;
    }

    if (!output) {
        output =
            buffer.toString(
                "utf8"
            );
    }

    return output;
}

// ==================================================
// IMAGES
// ==================================================

async function getImages() {
    return await docker.listImages();
}

// ==================================================
// PULL IMAGE
// ==================================================

async function pullImage(
    imageName
) {
    if (
        !imageName ||
        !imageName.trim()
    ) {
        throw new Error(
            "Docker image name is required"
        );
    }

    const image =
        imageName.trim();

    return new Promise(
        (resolve, reject) => {
            docker.pull(
                image,
                (
                    error,
                    stream
                ) => {
                    if (error) {
                        return reject(
                            error
                        );
                    }

                    docker.modem.followProgress(
                        stream,

                        (
                            progressError,
                            output
                        ) => {
                            if (
                                progressError
                            ) {
                                return reject(
                                    progressError
                                );
                            }

                            resolve({
                                image,

                                output,
                            });
                        }
                    );
                }
            );
        }
    );
}

// ==================================================
// INSPECT IMAGE
// ==================================================

async function inspectImage(
    imageId
) {
    if (!imageId) {
        throw new Error(
            "Image ID is required"
        );
    }

    const image =
        docker.getImage(
            imageId
        );

    return await image.inspect();
}

// ==================================================
// REMOVE IMAGE
// ==================================================

async function removeImage(
    imageId,
    force = false
) {
    if (!imageId) {
        throw new Error(
            "Image ID is required"
        );
    }

    const image =
        docker.getImage(
            imageId
        );

    return await image.remove({
        force,
    });
}

// ==================================================
// VOLUMES
// ==================================================

async function getVolumes() {
    return await docker.listVolumes();
}

// ==================================================
// CREATE VOLUME
// ==================================================

async function createVolume({
    name,
    driver = "local",
}) {
    if (
        !name ||
        !name.trim()
    ) {
        throw new Error(
            "Docker volume name is required"
        );
    }

    const volumeName =
        name.trim();

    const volumeDriver =
        driver?.trim() ||
        "local";

    return await docker.createVolume({
        Name: volumeName,

        Driver: volumeDriver,
    });
}

// ==================================================
// INSPECT VOLUME
// ==================================================

async function inspectVolume(
    volumeName
) {
    if (
        !volumeName ||
        !volumeName.trim()
    ) {
        throw new Error(
            "Docker volume name is required"
        );
    }

    const volume =
        docker.getVolume(
            volumeName.trim()
        );

    return await volume.inspect();
}

// ==================================================
// REMOVE VOLUME
// ==================================================

async function removeVolume(
    volumeName,
    force = false
) {
    if (
        !volumeName ||
        !volumeName.trim()
    ) {
        throw new Error(
            "Docker volume name is required"
        );
    }

    const volume =
        docker.getVolume(
            volumeName.trim()
        );

    return await volume.remove({
        force,
    });
}

// ==================================================
// NETWORKS
// ==================================================

async function getNetworks() {
    return await docker.listNetworks();
}

// ==================================================
// DOCKER MONITORING
// ==================================================

function calculateCpuPercent(
    stats
) {
    const cpuDelta =
        (stats.cpu_stats?.cpu_usage
            ?.total_usage || 0) -
        (stats.precpu_stats
            ?.cpu_usage
            ?.total_usage || 0);

    const systemDelta =
        (stats.cpu_stats
            ?.system_cpu_usage || 0) -
        (stats.precpu_stats
            ?.system_cpu_usage || 0);

    const onlineCpus =
        stats.cpu_stats
            ?.online_cpus ||
        stats.cpu_stats
            ?.cpu_usage
            ?.percpu_usage
            ?.length ||
        1;

    if (
        cpuDelta <= 0 ||
        systemDelta <= 0
    ) {
        return 0;
    }

    return Number(
        (
            (cpuDelta /
                systemDelta) *
            onlineCpus *
            100
        ).toFixed(2)
    );
}

function calculateMemoryStats(
    stats
) {
    const usage =
        stats.memory_stats
            ?.usage || 0;

    const cache =
        stats.memory_stats
            ?.stats?.cache ||
        stats.memory_stats
            ?.stats
            ?.inactive_file ||
        0;

    const actualUsage =
        Math.max(
            usage - cache,
            0
        );

    const limit =
        stats.memory_stats
            ?.limit || 0;

    const percent =
        limit > 0
            ? Number(
                (
                    (actualUsage /
                        limit) *
                    100
                ).toFixed(2)
            )
            : 0;

    return {
        usage:
            actualUsage,

        limit,

        percent,
    };
}

function calculateNetworkStats(
    stats
) {
    let rxBytes = 0;

    let txBytes = 0;

    const networks =
        stats.networks || {};

    Object.values(
        networks
    ).forEach(
        (network) => {
            rxBytes +=
                network.rx_bytes ||
                0;

            txBytes +=
                network.tx_bytes ||
                0;
        }
    );

    return {
        rxBytes,

        txBytes,
    };
}

async function getContainerStats(
    containerId
) {
    const container =
        docker.getContainer(
            containerId
        );

    const containerInfo =
        await container.inspect();

    if (!containerInfo) {
        throw new Error(
            "Container not found"
        );
    }

    const stats =
        await container.stats({
            stream: false,
        });

    const memory =
        calculateMemoryStats(
            stats
        );

    const network =
        calculateNetworkStats(
            stats
        );

    return {
        id:
            containerInfo.Id,

        name:
            (
                containerInfo.Name ||
                ""
            ).replace(
                /^\//,
                ""
            ),

        status:
            containerInfo.State
                ?.Status ||
            "unknown",

        running:
            Boolean(
                containerInfo.State
                    ?.Running
            ),

        restartCount:
            containerInfo.RestartCount ||
            0,

        cpu: {
            percent:
                calculateCpuPercent(
                    stats
                ),
        },

        memory,

        network,

        timestamp:
            new Date().toISOString(),
    };
}

async function getDockerMonitoring() {
    const [
        info,
        containers,
    ] = await Promise.all([
        docker.info(),

        docker.listContainers({
            all: true,
        }),
    ]);

    const containerStats = [];

    for (
        const container of containers
    ) {
        try {
            const stats =
                await getContainerStats(
                    container.Id
                );

            containerStats.push(
                stats
            );
        } catch (error) {
            containerStats.push({
                id:
                    container.Id,

                name:
                    (
                        container.Names?.[0] ||
                        ""
                    ).replace(
                        /^\//,
                        ""
                    ),

                status:
                    container.State ||
                    "unknown",

                running:
                    container.State ===
                    "running",

                restartCount:
                    container.RestartCount ||
                    0,

                cpu: {
                    percent: 0,
                },

                memory: {
                    usage: 0,
                    limit: 0,
                    percent: 0,
                },

                network: {
                    rxBytes: 0,
                    txBytes: 0,
                },

                error:
                    error.message,

                timestamp:
                    new Date().toISOString(),
            });
        }
    }

    return {
        engine: {
            containers:
                info.Containers ||
                0,

            running:
                info.ContainersRunning ||
                0,

            paused:
                info.ContainersPaused ||
                0,

            stopped:
                info.ContainersStopped ||
                0,

            images:
                info.Images || 0,

            serverVersion:
                info.ServerVersion ||
                "unknown",

            operatingSystem:
                info.OperatingSystem ||
                "unknown",

            architecture:
                info.Architecture ||
                "unknown",
        },

        containers:
            containerStats,

        timestamp:
            new Date().toISOString(),
    };
}

// ==================================================
// DOCKER COMPOSE
// ==================================================

async function ensureComposeBaseDir() {
    await fs.mkdir(
        COMPOSE_BASE_DIR,
        {
            recursive: true,
        }
    );
}

// --------------------------------------------------
// RUN DOCKER COMPOSE COMMAND
// --------------------------------------------------

function runComposeCommand(
    args,
    cwd
) {
    return new Promise(
        (
            resolve,
            reject
        ) => {
            execFile(
                "docker",
                [
                    "compose",
                    ...args,
                ],
                {
                    cwd,

                    windowsHide:
                        true,

                    maxBuffer:
                        10 *
                        1024 *
                        1024,
                },

                (
                    error,
                    stdout,
                    stderr
                ) => {
                    if (error) {
                        const message =
                            stderr?.trim() ||
                            stdout?.trim() ||
                            error.message;

                        const composeError =
                            new Error(
                                message
                            );

                        composeError.code =
                            error.code;

                        return reject(
                            composeError
                        );
                    }

                    resolve({
                        stdout:
                            stdout?.trim() ||
                            "",

                        stderr:
                            stderr?.trim() ||
                            "",
                    });
                }
            );
        }
    );
}

// --------------------------------------------------
// CREATE COMPOSE PROJECT
// --------------------------------------------------

async function createComposeProject({
    projectName,
    composeFile,
}) {
    if (!projectName) {
        throw new Error(
            "Compose project name is required"
        );
    }

    if (
        !composeFile ||
        !String(
            composeFile
        ).trim()
    ) {
        throw new Error(
            "Docker Compose YAML is required"
        );
    }

    await ensureComposeBaseDir();

    const safeProjectName =
        sanitizeComposeProjectName(
            projectName
        );

    const projectDir =
        path.join(
            COMPOSE_BASE_DIR,
            safeProjectName
        );

    await fs.mkdir(
        projectDir,
        {
            recursive: true,
        }
    );

    const composePath =
        path.join(
            projectDir,
            "docker-compose.yml"
        );

    await fs.writeFile(
        composePath,
        String(composeFile),
        "utf8"
    );

    return {
        success: true,

        projectName:
            safeProjectName,

        projectDir,

        composeFile:
            composePath,

        message:
            "Docker Compose project created",
    };
}

// --------------------------------------------------
// GET COMPOSE PROJECT DIRECTORY
// --------------------------------------------------

async function getComposeProjectDir(
    projectName
) {
    const safeProjectName =
        sanitizeComposeProjectName(
            projectName
        );

    const projectDir =
        path.join(
            COMPOSE_BASE_DIR,
            safeProjectName
        );

    try {
        await fs.access(
            path.join(
                projectDir,
                "docker-compose.yml"
            )
        );
    } catch {
        throw new Error(
            `Compose project "${safeProjectName}" was not found`
        );
    }

    return {
        safeProjectName,
        projectDir,
    };
}

// --------------------------------------------------
// START COMPOSE PROJECT
// --------------------------------------------------

async function composeUp(
    projectName
) {
    const {
        safeProjectName,
        projectDir,
    } =
        await getComposeProjectDir(
            projectName
        );

    const result =
        await runComposeCommand(
            [
                "-p",
                safeProjectName,
                "up",
                "-d",
            ],
            projectDir
        );

    return {
        success: true,

        projectName:
            safeProjectName,

        action: "up",

        output:
            result.stdout,

        message:
            "Docker Compose project started",
    };
}

// --------------------------------------------------
// STOP / REMOVE COMPOSE PROJECT
// --------------------------------------------------

async function composeDown(
    projectName
) {
    const {
        safeProjectName,
        projectDir,
    } =
        await getComposeProjectDir(
            projectName
        );

    const result =
        await runComposeCommand(
            [
                "-p",
                safeProjectName,
                "down",
            ],
            projectDir
        );

    return {
        success: true,

        projectName:
            safeProjectName,

        action: "down",

        output:
            result.stdout,

        message:
            "Docker Compose project stopped and removed",
    };
}

// --------------------------------------------------
// RESTART COMPOSE PROJECT
// --------------------------------------------------

async function composeRestart(
    projectName
) {
    const {
        safeProjectName,
        projectDir,
    } =
        await getComposeProjectDir(
            projectName
        );

    const result =
        await runComposeCommand(
            [
                "-p",
                safeProjectName,
                "restart",
            ],
            projectDir
        );

    return {
        success: true,

        projectName:
            safeProjectName,

        action: "restart",

        output:
            result.stdout,

        message:
            "Docker Compose project restarted",
    };
}

// --------------------------------------------------
// COMPOSE PROJECT STATUS
// --------------------------------------------------

async function composePs(
    projectName
) {
    const {
        safeProjectName,
        projectDir,
    } =
        await getComposeProjectDir(
            projectName
        );

    const result =
        await runComposeCommand(
            [
                "-p",
                safeProjectName,
                "ps",
                "--format",
                "json",
            ],
            projectDir
        );

    let services = [];

    if (result.stdout) {
        services =
            result.stdout
                .split("\n")
                .filter(Boolean)
                .map(
                    (line) => {
                        try {
                            return JSON.parse(
                                line
                            );
                        } catch {
                            return {
                                raw: line,
                            };
                        }
                    }
                );
    }

    return {
        success: true,

        projectName:
            safeProjectName,

        services,

        output:
            result.stdout,
    };
}

// --------------------------------------------------
// LIST COMPOSE PROJECTS
// --------------------------------------------------

async function listComposeProjects() {
    await ensureComposeBaseDir();

    const entries = await fs.readdir(
        COMPOSE_BASE_DIR,
        {
            withFileTypes: true,
        }
    );

    const projects = [];

    for (const entry of entries) {
        if (!entry.isDirectory()) {
            continue;
        }

        const projectName = entry.name;

        const composeFile = path.join(
            COMPOSE_BASE_DIR,
            projectName,
            "docker-compose.yml"
        );

        try {
            await fs.access(composeFile);

            projects.push({
                name: projectName,
                projectName: projectName,
                status: "created",
                composeFile: composeFile,
                projectDir: path.join(
                    COMPOSE_BASE_DIR,
                    projectName
                ),
            });
        } catch {
            // Ignore folders without docker-compose.yml
        }
    }

    return {
        success: true,
        projects,
    };
}

// --------------------------------------------------
// VALIDATE COMPOSE CONFIG
// --------------------------------------------------

async function validateComposeProject(
    projectName
) {
    const {
        safeProjectName,
        projectDir,
    } =
        await getComposeProjectDir(
            projectName
        );

    const result =
        await runComposeCommand(
            [
                "-p",
                safeProjectName,
                "config",
            ],
            projectDir
        );

    return {
        success: true,

        projectName:
            safeProjectName,

        config:
            result.stdout,
    };
}

// --------------------------------------------------
// COMPOSE LOGS
// --------------------------------------------------

async function composeLogs(
    projectName,
    service
) {
    const {
        safeProjectName,
        projectDir,
    } =
        await getComposeProjectDir(
            projectName
        );

    const args = [
        "-p",
        safeProjectName,
        "logs",
        "--no-color",
    ];

    if (
        service &&
        String(service).trim()
    ) {
        args.push(
            String(service).trim()
        );
    }

    const result =
        await runComposeCommand(
            args,
            projectDir
        );

    return {
        success: true,

        projectName:
            safeProjectName,

        service:
            service || null,

        logs:
            result.stdout,
    };
}

// --------------------------------------------------
// DELETE COMPOSE PROJECT FILES
// --------------------------------------------------

async function deleteComposeProject(
    projectName
) {
    const safeProjectName =
        sanitizeComposeProjectName(
            projectName
        );

    const projectDir =
        path.join(
            COMPOSE_BASE_DIR,
            safeProjectName
        );

    try {
        await fs.access(
            projectDir
        );
    } catch {
        throw new Error(
            `Compose project "${safeProjectName}" was not found`
        );
    }

    await fs.rm(
        projectDir,
        {
            recursive: true,
            force: true,
        }
    );

    return {
        success: true,

        projectName:
            safeProjectName,

        message:
            "Compose project files deleted",
    };
}

// ==================================================
// EXPORTS
// ==================================================

module.exports = {
    docker,

    // Docker engine
    getDockerInfo,

    // Learner labs
    ensureLearnerLabNetwork,
    ensureLearnerLabImage,
    createLearnerDockerLab,
    getLearnerDockerLab,
    listLearnerDockerLabs,
    executeLearnerDockerCommand,
    stopLearnerDockerLab,
    destroyLearnerDockerLab,

    // Containers
    getContainers,
    getContainer,
    createContainer,
    getContainerLogs,

    // Images
    getImages,
    pullImage,
    inspectImage,
    removeImage,

    // Volumes
    getVolumes,
    createVolume,
    inspectVolume,
    removeVolume,

    // Networks
    getNetworks,

    // Monitoring
    getContainerStats,
    getDockerMonitoring,

    // Docker Compose
    createComposeProject,
    composeUp,
    composeDown,
    composeRestart,
    composePs,
    listComposeProjects,
    validateComposeProject,
    composeLogs,
    deleteComposeProject,
};
