
import { useEffect, useState } from "react";
import {
    Activity,
    Box,
    Boxes,
    Container,
    HardDrive,
    Network,
    Play,
    Square,
    RotateCcw,
    Pause,
    PlayCircle,
    Trash2,
    Terminal,
    RefreshCw,
    Eye,
    FileText,
    Plus,
    Download,
} from "lucide-react";

const API_BASE_URL = "http://localhost:5000";

type DockerTab =
    | "dashboard"
    | "sessions"
    | "terminal"
    | "images"
    | "containers"
    | "repositories"
    | "volumes"
    | "networks"
    | "compose"
    | "monitoring";

interface ContainerData {
    Id: string;
    Names?: string[];
    Image?: string;
    ImageID?: string;
    Command?: string;
    Created?: number;
    State?: string;
    Status?: string;
    Ports?: {
        IP?: string;
        PrivatePort?: number;
        PublicPort?: number;
        Type?: string;
    }[];
    Mounts?: unknown[];
    Labels?: Record<string, string>;
}

interface ImageData {
    Id: string;
    RepoTags?: string[];
    RepoDigests?: string[];
    Created?: number;
    Size?: number;
    Containers?: number;
    Labels?: Record<string, string>;
}

interface VolumeData {
    Name: string;
    Driver?: string;
    Mountpoint?: string;
    Scope?: string;
    CreatedAt?: string;
    Labels?: Record<string, string>;
    Options?: Record<string, string>;
}

interface NetworkData {
    Id: string;
    Name: string;
    Driver?: string;
    Scope?: string;
    Containers?: Record<string, unknown>;
}

/*
 * ============================================================
 * DOCKER MONITORING TYPES
 * ============================================================
 */

interface MonitoringContainer {
    id: string;
    name: string;
    status: string;
    running: boolean;
    restartCount: number;

    cpu: {
        percent: number;
    };

    memory: {
        usage: number;
        limit: number;
        percent: number;
    };

    network: {
        rxBytes: number;
        txBytes: number;
    };

    error?: string;
    timestamp: string;
}

interface DockerMonitoringData {
    engine: {
        containers: number;
        running: number;
        paused: number;
        stopped: number;
        images: number;
        serverVersion: string;
        operatingSystem: string;
        architecture: string;
    };

    containers: MonitoringContainer[];

    timestamp: string;
}

export default function DockerPage() {
    const [activeTab, setActiveTab] =
        useState<DockerTab>("dashboard");

    const [containers, setContainers] =
        useState<ContainerData[]>([]);

    const [images, setImages] =
        useState<ImageData[]>([]);

    const [volumes, setVolumes] =
        useState<VolumeData[]>([]);
    const [composeProjectName, setComposeProjectName] = useState("");
    const [composeYaml, setComposeYaml] = useState("");

    const [composeProjects, setComposeProjects] = useState<any[]>([]);
    const [composeStatus, setComposeStatus] = useState<any[]>([]);
    const [composeLogs, setComposeLogs] = useState("");
    const [composeConfig, setComposeConfig] = useState("");
    const [composeMessage, setComposeMessage] = useState("");
    const [composeLoading, setComposeLoading] = useState(false);
    const [selectedComposeProject, setSelectedComposeProject] = useState("");
    // ============================================================
    // AI YAML ASSISTANT STATE
    // ============================================================

    const [yamlFileType, setYamlFileType] =
        useState("docker-compose");

    const [aiPrompt, setAiPrompt] =
        useState("");

    const [aiLoading, setAiLoading] =
        useState(false);

    const [aiMessage, setAiMessage] =
        useState("");

    const [yamlExplanation, setYamlExplanation] =
        useState("");


    const [networks, setNetworks] =
        useState<NetworkData[]>([]);

    const [dockerInfo, setDockerInfo] =
        useState<any>(null);

    const [loading, setLoading] =
        useState(true);

    const [monitoring, setMonitoring] =
        useState<DockerMonitoringData | null>(null);

    const [monitoringLoading, setMonitoringLoading] =
        useState(false);

    const [monitoringError, setMonitoringError] =
        useState("");

    const [error, setError] =
        useState("");

    const [actionLoading, setActionLoading] =
        useState("");

    const [selectedContainer, setSelectedContainer] =
        useState<ContainerData | null>(null);

    const [logs, setLogs] =
        useState("");

    const [showLogs, setShowLogs] =
        useState(false);

    const [inspectData, setInspectData] =
        useState<any>(null);

    const [showInspect, setShowInspect] =
        useState(false);

    /*
     * ============================================================
     * IMAGE MANAGEMENT STATE
     * ============================================================
     */

    const [showPullImage, setShowPullImage] =
        useState(false);

    const [pullImageName, setPullImageName] =
        useState("");

    const [pullLoading, setPullLoading] =
        useState(false);

    const [selectedImage, setSelectedImage] =
        useState<ImageData | null>(null);

    const [imageInspectData, setImageInspectData] =
        useState<any>(null);

    const [showImageInspect, setShowImageInspect] =
        useState(false);

    const [imageActionLoading, setImageActionLoading] =
        useState("");

    /*
     * ============================================================
     * CREATE CONTAINER STATE
     * ============================================================
     */

    const [showCreateContainer, setShowCreateContainer] =
        useState(false);

    const [createImage, setCreateImage] =
        useState("");

    const [createName, setCreateName] =
        useState("");

    const [createHostPort, setCreateHostPort] =
        useState("8081");

    const [createContainerPort, setCreateContainerPort] =
        useState("80");

    const [createStartImmediately, setCreateStartImmediately] =
        useState(true);

    const [createLoading, setCreateLoading] =
        useState(false);

    /*
     * ============================================================
     * VOLUME MANAGEMENT STATE
     * ============================================================
     */

    const [showCreateVolume, setShowCreateVolume] =
        useState(false);

    const [volumeName, setVolumeName] =
        useState("");

    const [volumeDriver, setVolumeDriver] =
        useState("local");

    const [volumeCreateLoading, setVolumeCreateLoading] =
        useState(false);

    const [volumeActionLoading, setVolumeActionLoading] =
        useState("");

    const [selectedVolume, setSelectedVolume] =
        useState<VolumeData | null>(null);

    const [volumeInspectData, setVolumeInspectData] =
        useState<any>(null);

    const [showVolumeInspect, setShowVolumeInspect] =
        useState(false);

    /*
     * ============================================================
     * FETCH DOCKER DATA
     * ============================================================
     */

    const fetchDockerData = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                containersResponse,
                infoResponse,
                imagesResponse,
                volumesResponse,
                networksResponse,
            ] = await Promise.all([
                fetch(`${API_BASE_URL}/api/docker/containers`),
                fetch(`${API_BASE_URL}/api/docker/info`),
                fetch(`${API_BASE_URL}/api/docker/images`),
                fetch(`${API_BASE_URL}/api/docker/volumes`),
                fetch(`${API_BASE_URL}/api/docker/networks`),
            ]);

            if (!containersResponse.ok) {
                throw new Error(
                    `Unable to retrieve Docker containers (${containersResponse.status})`
                );
            }

            if (!infoResponse.ok) {
                throw new Error(
                    `Unable to retrieve Docker information (${infoResponse.status})`
                );
            }

            if (!imagesResponse.ok) {
                throw new Error(
                    `Unable to retrieve Docker images (${imagesResponse.status})`
                );
            }

            if (!volumesResponse.ok) {
                throw new Error(
                    `Unable to retrieve Docker volumes (${volumesResponse.status})`
                );
            }

            if (!networksResponse.ok) {
                throw new Error(
                    `Unable to retrieve Docker networks (${networksResponse.status})`
                );
            }

            const containersData =
                await containersResponse.json();

            const infoData =
                await infoResponse.json();

            const imagesData =
                await imagesResponse.json();

            const volumesData =
                await volumesResponse.json();

            const networksData =
                await networksResponse.json();

            setContainers(
                Array.isArray(containersData?.containers)
                    ? containersData.containers
                    : []
            );

            setDockerInfo(
                infoData?.data ??
                infoData?.info ??
                infoData ??
                null
            );

            setImages(
                Array.isArray(imagesData?.data)
                    ? imagesData.data
                    : []
            );

            setVolumes(
                Array.isArray(volumesData?.data?.Volumes)
                    ? volumesData.data.Volumes
                    : []
            );

            setNetworks(
                Array.isArray(networksData?.networks)
                    ? networksData.networks
                    : []
            );
        } catch (err: any) {
            console.error(
                "Docker data error:",
                err
            );

            setDockerInfo(null);

            setError(
                err?.message ||
                "Unable to connect to Docker backend. Make sure the backend is running on port 5000."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDockerData();
    }, []);
    const fetchComposeProjects = async () => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/docker/compose/projects`
            );

            const data = await getResponseData(response);

            if (!response.ok) {
                throw new Error(
                    data?.message || "Failed to fetch Compose projects"
                );
            }

            setComposeProjects(data?.projects ?? data?.data ?? []);
        } catch (error: any) {
            setComposeMessage(
                error?.message || "Failed to fetch Compose projects"
            );
        }
    };
    const handleCreateComposeProject = async () => {
        if (!composeProjectName.trim()) {
            setComposeMessage("Enter a Compose project name.");
            return;
        }

        if (!composeYaml.trim()) {
            setComposeMessage("Enter Docker Compose YAML.");
            return;
        }

        setComposeLoading(true);
        setComposeMessage("");
        setComposeConfig("");
        setComposeLogs("");

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/docker/compose/projects`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        projectName: composeProjectName,
                        composeFile: composeYaml,
                    }),
                }
            );

            const data = await getResponseData(response);

            if (!response.ok) {
                throw new Error(
                    data?.message || "Failed to create Compose project"
                );
            }

            setSelectedComposeProject(
                data?.projectName ||
                data?.data?.projectName ||
                composeProjectName
            );

            setComposeMessage(
                data?.message || "Compose project created successfully."
            );

            await fetchComposeProjects();
        } catch (error: any) {
            setComposeMessage(
                error?.message || "Failed to create Compose project"
            );
        } finally {
            setComposeLoading(false);
        }
    };
    const handleValidateCompose = async (projectName?: string) => {
        const name =
            projectName ||
            selectedComposeProject ||
            composeProjectName;

        if (!name.trim()) {
            setComposeMessage("Enter or create a Compose project first.");
            return;
        }

        setComposeLoading(true);
        setComposeMessage("");
        setComposeConfig("");

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/docker/compose/projects/${encodeURIComponent(
                    name
                )}/validate`
            );

            const data = await getResponseData(response);

            if (!response.ok) {
                throw new Error(
                    data?.message || "Compose validation failed"
                );
            }

            setSelectedComposeProject(name);
            setComposeConfig(data?.config ?? "");

            setComposeMessage(
                "Docker Compose configuration is valid."
            );
        } catch (error: any) {
            setComposeMessage(
                error?.message || "Compose validation failed"
            );
        } finally {
            setComposeLoading(false);
        }
    };
    const handleComposeUp = async (projectName: string) => {
        setComposeLoading(true);
        setComposeMessage("");

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/docker/compose/projects/${encodeURIComponent(
                    projectName
                )}/up`,
                {
                    method: "POST",
                }
            );

            const data = await getResponseData(response);

            if (!response.ok) {
                throw new Error(
                    data?.message || "Failed to start Compose project"
                );
            }

            setSelectedComposeProject(projectName);

            setComposeMessage(
                data?.message || "Compose project started."
            );

            await handleComposeStatus(projectName);
        } catch (error: any) {
            setComposeMessage(
                error?.message || "Failed to start Compose project"
            );
        } finally {
            setComposeLoading(false);
        }
    };



    const handleComposeDown = async (projectName: string) => {
        setComposeLoading(true);
        setComposeMessage("");

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/docker/compose/projects/${encodeURIComponent(
                    projectName
                )}/down`,
                {
                    method: "POST",
                }
            );

            const data = await getResponseData(response);

            if (!response.ok) {
                throw new Error(
                    data?.message || "Failed to stop Compose project"
                );
            }

            setComposeMessage(
                data?.message || "Compose project stopped."
            );

            setComposeStatus([]);
        } catch (error: any) {
            setComposeMessage(
                error?.message || "Failed to stop Compose project"
            );
        } finally {
            setComposeLoading(false);
        }
    };
    const handleComposeRestart = async (projectName: string) => {
        setComposeLoading(true);
        setComposeMessage("");

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/docker/compose/projects/${encodeURIComponent(
                    projectName
                )}/restart`,
                {
                    method: "POST",
                }
            );

            const data = await getResponseData(response);

            if (!response.ok) {
                throw new Error(
                    data?.message || "Failed to restart Compose project"
                );
            }

            setComposeMessage(
                data?.message || "Compose project restarted."
            );

            await handleComposeStatus(projectName);
        } catch (error: any) {
            setComposeMessage(
                error?.message || "Failed to restart Compose project"
            );
        } finally {
            setComposeLoading(false);
        }
    };
    const handleComposeStatus = async (projectName: string) => {
        setSelectedComposeProject(projectName);
        setComposeLoading(true);
        setComposeMessage("");

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/docker/compose/projects/${encodeURIComponent(
                    projectName
                )}`
            );

            const data = await getResponseData(response);

            if (!response.ok) {
                throw new Error(
                    data?.message || "Failed to get Compose status"
                );
            }

            setComposeStatus(data?.services ?? []);
            setComposeMessage("Compose status loaded.");
        } catch (error: any) {
            setComposeMessage(
                error?.message || "Failed to get Compose status"
            );
        } finally {
            setComposeLoading(false);
        }
    };
    const handleComposeLogs = async (projectName: string) => {
        setSelectedComposeProject(projectName);
        setComposeLoading(true);
        setComposeMessage("");

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/docker/compose/projects/${encodeURIComponent(
                    projectName
                )}/logs`
            );

            const data = await getResponseData(response);

            if (!response.ok) {
                throw new Error(
                    data?.message || "Failed to get Compose logs"
                );
            }

            setComposeLogs(data?.logs ?? "");
            setComposeMessage("Compose logs loaded.");
        } catch (error: any) {
            setComposeMessage(
                error?.message || "Failed to get Compose logs"
            );
        } finally {
            setComposeLoading(false);
        }
    };
    const handleDeleteComposeProject = async (projectName: string) => {
        const confirmed = window.confirm(
            `Delete Compose project "${projectName}"?`
        );

        if (!confirmed) {
            return;
        }

        setComposeLoading(true);
        setComposeMessage("");

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/docker/compose/projects/${encodeURIComponent(
                    projectName
                )}`,
                {
                    method: "DELETE",
                }
            );

            const data = await getResponseData(response);

            if (!response.ok) {
                throw new Error(
                    data?.message || "Failed to delete Compose project"
                );
            }

            setComposeMessage(
                data?.message || "Compose project deleted."
            );

            if (selectedComposeProject === projectName) {
                setSelectedComposeProject("");
                setComposeStatus([]);
                setComposeLogs("");
                setComposeConfig("");
            }

            await fetchComposeProjects();
        } catch (error: any) {
            setComposeMessage(
                error?.message || "Failed to delete Compose project"
            );
        } finally {
            setComposeLoading(false);
        }
    };

    /*
     * ============================================================
     * FETCH REAL DOCKER MONITORING DATA
     * ============================================================
     */

    const fetchMonitoringData = async () => {
        try {
            setMonitoringLoading(true);
            setMonitoringError("");

            const response = await fetch(
                `${API_BASE_URL}/api/docker/monitoring`
            );

            if (!response.ok) {
                throw new Error(
                    `Unable to retrieve Docker monitoring data (${response.status})`
                );
            }

            const result = await response.json();

            if (!result?.success) {
                throw new Error(
                    result?.error ||
                    "Unable to retrieve Docker monitoring data"
                );
            }

            setMonitoring(result.data ?? null);
        } catch (err: any) {
            console.error(
                "Docker monitoring error:",
                err
            );

            setMonitoringError(
                err?.message ||
                "Unable to retrieve Docker monitoring data."
            );
        } finally {
            setMonitoringLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab !== "monitoring") {
            return;
        }

        fetchMonitoringData();

        const interval = setInterval(() => {
            fetchMonitoringData();
        }, 3000);

        return () => {
            clearInterval(interval);
        };
    }, [activeTab]);

    /*
     * ============================================================
     * SAFE RESPONSE HELPER
     * ============================================================
     */

    const getResponseData = async (
        response: Response
    ) => {
        const contentType =
            response.headers.get("content-type") || "";

        if (
            contentType.includes(
                "application/json"
            )
        ) {
            return await response.json();
        }

        const text =
            await response.text();

        return {
            message: text,
        };
    };

    /*
     * ============================================================
     * IMAGE - PULL
     * ============================================================
     */

    const pullDockerImage = async () => {
        if (!pullImageName.trim()) {
            alert("Please enter an image name.");
            return;
        }

        setPullLoading(true);
        setError("");

        try {
            const response =
                await fetch(
                    `${API_BASE_URL}/api/docker/images/pull`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            image: pullImageName.trim(),
                        }),
                    }
                );

            const data =
                await getResponseData(response);

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                    data?.error ||
                    `Failed to pull image. HTTP ${response.status}`
                );
            }

            alert(
                data?.message ||
                "Docker image pulled successfully."
            );

            setPullImageName("");
            setShowPullImage(false);

            await fetchDockerData();
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Failed to pull Docker image.";

            setError(message);

            alert(message);
        } finally {
            setPullLoading(false);
        }
    };

    /*
     * ============================================================
     * IMAGE - INSPECT
     * ============================================================
     */

    const inspectImage = async (
        image: ImageData
    ) => {
        try {
            setImageActionLoading(
                `inspect-${image.Id}`
            );

            const response =
                await fetch(
                    `${API_BASE_URL}/api/docker/images/${encodeURIComponent(
                        image.Id
                    )}/inspect`
                );

            const data =
                await getResponseData(
                    response
                );

            if (!response.ok) {
                throw new Error(
                    data?.error ||
                    data?.message ||
                    "Unable to inspect Docker image"
                );
            }

            setSelectedImage(image);

            setImageInspectData(
                data?.image ?? data
            );

            setShowImageInspect(true);
        } catch (err: any) {
            console.error(
                "Image inspect error:",
                err
            );

            alert(
                err?.message ||
                "Unable to inspect Docker image."
            );
        } finally {
            setImageActionLoading("");
        }
    };

    /*
     * ============================================================
     * IMAGE - REMOVE
     * ============================================================
     */

    const removeImage = async (
        image: ImageData
    ) => {
        const imageName =
            image.RepoTags?.join(", ") ||
            shortId(image.Id);

        const confirmed =
            window.confirm(
                `Are you sure you want to remove this Docker image?\n\n${imageName}`
            );

        if (!confirmed) {
            return;
        }

        try {
            setImageActionLoading(
                `remove-${image.Id}`
            );

            const response =
                await fetch(
                    `${API_BASE_URL}/api/docker/images/${encodeURIComponent(
                        image.Id
                    )}`,
                    {
                        method: "DELETE",
                    }
                );

            const data =
                await getResponseData(
                    response
                );

            if (!response.ok) {
                throw new Error(
                    data?.error ||
                    data?.message ||
                    "Unable to remove Docker image"
                );
            }

            alert(
                data?.message ||
                "Docker image removed successfully."
            );

            if (
                selectedImage?.Id === image.Id
            ) {
                setShowImageInspect(false);
                setSelectedImage(null);
                setImageInspectData(null);
            }

            await fetchDockerData();
        } catch (err: any) {
            console.error(
                "Image remove error:",
                err
            );

            alert(
                err?.message ||
                "Unable to remove Docker image."
            );
        } finally {
            setImageActionLoading("");
        }
    };

    /*
     * ============================================================
     * CONTAINER ACTION
     * ============================================================
     */

    const containerAction = async (
        containerId: string,
        action:
            | "start"
            | "stop"
            | "restart"
            | "pause"
            | "unpause"
    ) => {
        try {
            setActionLoading(
                `${action}-${containerId}`
            );

            const response =
                await fetch(
                    `${API_BASE_URL}/api/docker/containers/${containerId}/${action}`,
                    {
                        method: "POST",
                    }
                );

            const data =
                await getResponseData(
                    response
                );

            if (!response.ok) {
                throw new Error(
                    data?.error ||
                    data?.message ||
                    `Unable to ${action} container`
                );
            }

            await fetchDockerData();
        } catch (err: any) {
            console.error(
                `Container ${action} error:`,
                err
            );

            alert(
                err?.message ||
                `Unable to ${action} container`
            );
        } finally {
            setActionLoading("");
        }
    };

    /*
     * ============================================================
     * REMOVE CONTAINER
     * ============================================================
     */

    const removeContainer = async (
        containerId: string
    ) => {
        const confirmed =
            window.confirm(
                "Are you sure you want to remove this container?"
            );

        if (!confirmed) {
            return;
        }

        try {
            setActionLoading(
                `remove-${containerId}`
            );

            const response =
                await fetch(
                    `${API_BASE_URL}/api/docker/containers/${containerId}`,
                    {
                        method: "DELETE",
                    }
                );

            const data =
                await getResponseData(
                    response
                );

            if (!response.ok) {
                throw new Error(
                    data?.error ||
                    data?.message ||
                    "Unable to remove container"
                );
            }

            await fetchDockerData();
        } catch (err: any) {
            console.error(
                "Container remove error:",
                err
            );

            alert(
                err?.message ||
                "Unable to remove container"
            );
        } finally {
            setActionLoading("");
        }
    };

    /*
     * ============================================================
     * INSPECT CONTAINER
     * ============================================================
     */

    const inspectContainer = async (
        containerId: string
    ) => {
        try {
            const response =
                await fetch(
                    `${API_BASE_URL}/api/docker/containers/${containerId}/inspect`
                );

            const data =
                await getResponseData(
                    response
                );

            if (!response.ok) {
                throw new Error(
                    data?.error ||
                    data?.message ||
                    "Inspect failed"
                );
            }

            setInspectData(
                data?.container ?? data
            );

            setShowInspect(true);
        } catch (err: any) {
            console.error(
                "Inspect error:",
                err
            );

            alert(
                err?.message ||
                "Unable to inspect container"
            );
        }
    };

    /*
     * ============================================================
     * CONTAINER LOGS
     * ============================================================
     */

    const viewLogs = async (
        container: ContainerData
    ) => {
        try {
            const response =
                await fetch(
                    `${API_BASE_URL}/api/docker/containers/${container.Id}/logs`
                );

            const data =
                await getResponseData(
                    response
                );

            if (!response.ok) {
                throw new Error(
                    data?.error ||
                    data?.message ||
                    "Unable to retrieve logs"
                );
            }

            setSelectedContainer(
                container
            );

            setLogs(
                data?.logs ||
                "No logs available."
            );

            setShowLogs(true);
        } catch (err: any) {
            console.error(
                "Logs error:",
                err
            );

            alert(
                err?.message ||
                "Unable to retrieve container logs"
            );
        }
    };

    /*
     * ============================================================
     * CREATE NEW CONTAINER
     * ============================================================
     */

    const createNewContainer =
        async () => {
            const image =
                createImage.trim();

            const name =
                createName.trim();

            const hostPort =
                Number(createHostPort);

            const containerPort =
                Number(createContainerPort);

            if (!image) {
                alert(
                    "Please enter a Docker image name."
                );
                return;
            }

            if (!name) {
                alert(
                    "Please enter a container name."
                );
                return;
            }

            if (
                !Number.isInteger(
                    hostPort
                ) ||
                hostPort < 1 ||
                hostPort > 65535
            ) {
                alert(
                    "Host port must be between 1 and 65535."
                );
                return;
            }

            if (
                !Number.isInteger(
                    containerPort
                ) ||
                containerPort < 1 ||
                containerPort > 65535
            ) {
                alert(
                    "Container port must be between 1 and 65535."
                );
                return;
            }

            try {
                setCreateLoading(true);

                const response =
                    await fetch(
                        `${API_BASE_URL}/api/docker/containers/create`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type":
                                    "application/json",
                            },
                            body: JSON.stringify({
                                image,
                                name,
                                hostPort,
                                containerPort,
                                start:
                                    createStartImmediately,
                            }),
                        }
                    );

                const data =
                    await getResponseData(
                        response
                    );

                if (!response.ok) {
                    throw new Error(
                        data?.error ||
                        data?.message ||
                        "Unable to create container"
                    );
                }

                alert(
                    createStartImmediately
                        ? "Container created and started successfully."
                        : "Container created successfully."
                );

                setShowCreateContainer(
                    false
                );

                setCreateImage("");
                setCreateName("");
                setCreateHostPort("8081");
                setCreateContainerPort("80");
                setCreateStartImmediately(
                    true
                );

                await fetchDockerData();
            } catch (err: any) {
                console.error(
                    "Create container error:",
                    err
                );

                alert(
                    err?.message ||
                    "Unable to create container. Make sure the image exists locally."
                );
            } finally {
                setCreateLoading(false);
            }
        };

    /*
     * ============================================================
     * VOLUME - CREATE
     * ============================================================
     */

    const createNewVolume = async () => {
        const name =
            volumeName.trim();

        const driver =
            volumeDriver.trim() ||
            "local";

        if (!name) {
            alert(
                "Please enter a volume name."
            );
            return;
        }

        if (
            !/^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/.test(
                name
            )
        ) {
            alert(
                "Volume name can contain letters, numbers, underscores, dots and hyphens."
            );
            return;
        }

        try {
            setVolumeCreateLoading(true);
            setError("");

            const response = await fetch(
                `${API_BASE_URL}/api/docker/volumes`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name,
                        driver,
                    }),
                }
            );

            const data =
                await getResponseData(
                    response
                );

            if (!response.ok) {
                throw new Error(
                    data?.error ||
                    data?.message ||
                    "Unable to create Docker volume"
                );
            }

            alert(
                data?.message ||
                "Docker volume created successfully."
            );

            setVolumeName("");
            setVolumeDriver("local");
            setShowCreateVolume(false);

            await fetchDockerData();
        } catch (err: any) {
            console.error(
                "Volume create error:",
                err
            );

            alert(
                err?.message ||
                "Unable to create Docker volume."
            );
        } finally {
            setVolumeCreateLoading(false);
        }
    };

    /*
     * ============================================================
     * VOLUME - INSPECT
     * ============================================================
     */

    const inspectVolume = async (
        volume: VolumeData
    ) => {
        try {
            setVolumeActionLoading(
                `inspect-${volume.Name}`
            );

            const response =
                await fetch(
                    `${API_BASE_URL}/api/docker/volumes/${encodeURIComponent(
                        volume.Name
                    )}/inspect`
                );

            const data =
                await getResponseData(
                    response
                );

            if (!response.ok) {
                throw new Error(
                    data?.error ||
                    data?.message ||
                    "Unable to inspect Docker volume"
                );
            }

            setSelectedVolume(
                volume
            );

            setVolumeInspectData(
                data?.volume ?? data
            );

            setShowVolumeInspect(true);
        } catch (err: any) {
            console.error(
                "Volume inspect error:",
                err
            );

            alert(
                err?.message ||
                "Unable to inspect Docker volume."
            );
        } finally {
            setVolumeActionLoading("");
        }
    };

    /*
     * ============================================================
     * VOLUME - REMOVE
     * ============================================================
     */

    const removeVolume = async (
        volume: VolumeData
    ) => {
        const confirmed =
            window.confirm(
                `Are you sure you want to remove this Docker volume?\n\n${volume.Name}\n\nThis action cannot be undone.`
            );

        if (!confirmed) {
            return;
        }

        try {
            setVolumeActionLoading(
                `remove-${volume.Name}`
            );

            setError("");

            const response =
                await fetch(
                    `${API_BASE_URL}/api/docker/volumes/${encodeURIComponent(
                        volume.Name
                    )}`,
                    {
                        method: "DELETE",
                    }
                );

            const data =
                await getResponseData(
                    response
                );

            if (!response.ok) {
                throw new Error(
                    data?.error ||
                    data?.message ||
                    "Unable to remove Docker volume"
                );
            }

            alert(
                data?.message ||
                "Docker volume removed successfully."
            );

            if (
                selectedVolume?.Name ===
                volume.Name
            ) {
                setShowVolumeInspect(false);
                setSelectedVolume(null);
                setVolumeInspectData(null);
            }

            await fetchDockerData();
        } catch (err: any) {
            console.error(
                "Volume remove error:",
                err
            );

            alert(
                err?.message ||
                "Unable to remove Docker volume. It may be in use by a container."
            );
        } finally {
            setVolumeActionLoading("");
        }
    };

    /*
     * ============================================================
     * HELPERS
     * ============================================================
     */

    const shortId = (
        id: string
    ) => {
        return id
            ? id.substring(0, 12)
            : "-";
    };

    const getContainerName = (
        container: ContainerData
    ) => {
        return (
            container.Names?.[0]?.replace(
                "/",
                ""
            ) || "Unnamed"
        );
    };

    const isRunning = (
        container: ContainerData
    ) => {
        return (
            container.State ===
            "running"
        );
    };

    const formatBytes = (
        bytes: number = 0
    ) => {
        if (
            !bytes ||
            bytes <= 0
        ) {
            return "0 B";
        }

        const units = [
            "B",
            "KB",
            "MB",
            "GB",
            "TB",
        ];

        const index = Math.min(
            Math.floor(
                Math.log(bytes) /
                Math.log(1024)
            ),
            units.length - 1
        );

        return `${(
            bytes /
            Math.pow(
                1024,
                index
            )
        ).toFixed(2)} ${units[index]}`;
    };

    const formatCreated = (
        timestamp?: number
    ) => {
        if (!timestamp) {
            return "-";
        }

        return new Date(
            timestamp * 1000
        ).toLocaleString();
    };

    const getImageName = (
        image: ImageData
    ) => {
        return (
            image.RepoTags?.[0] ||
            "<none>"
        );
    };

    /*
     * ============================================================
     * TABS
     * ============================================================
     */

    const tabs: {
        id: DockerTab;
        label: string;
        icon: any;
    }[] = [
            {
                id: "dashboard",
                label: "Dashboard",
                icon: Activity,
            },
            {
                id: "sessions",
                label: "Sessions",
                icon: Boxes,
            },
            {
                id: "terminal",
                label: "Terminal",
                icon: Terminal,
            },
            {
                id: "images",
                label: "Images",
                icon: Box,
            },
            {
                id: "containers",
                label: "Containers",
                icon: Container,
            },
            {
                id: "repositories",
                label: "Repositories",
                icon: Box,
            },
            {
                id: "volumes",
                label: "Volumes",
                icon: HardDrive,
            },
            {
                id: "networks",
                label: "Networks",
                icon: Network,
            },
            {
                id: "compose",
                label: "Compose",
                icon: FileText,
            },
            {
                id: "monitoring",
                label: "Monitoring",
                icon: Activity,
            },
        ];

    /*
     * ============================================================
     * DASHBOARD
     * ============================================================
     */

    const renderDashboard = () => {
        const runningContainers =
            containers.filter(
                (container) =>
                    container.State ===
                    "running"
            ).length;

        const dockerConnected =
            !!dockerInfo;

        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-white">
                        Docker Dashboard
                    </h1>

                    <p className="mt-2 text-gray-400">
                        Manage your Docker Engine,
                        containers, images, volumes
                        and networks.
                    </p>
                </div>

                {error && (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
                        <p className="font-semibold">
                            Docker connection problem
                        </p>

                        <p className="mt-1 text-sm">
                            {error}
                        </p>

                        <button
                            onClick={
                                fetchDockerData
                            }
                            className="mt-3 rounded-lg bg-red-500/20 px-4 py-2 text-sm hover:bg-red-500/30"
                        >
                            Retry Connection
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        title="Containers"
                        value={
                            containers.length
                        }
                        icon={
                            <Container
                                size={24}
                            />
                        }
                    />

                    <StatCard
                        title="Running"
                        value={
                            runningContainers
                        }
                        icon={
                            <Play size={24} />
                        }
                    />

                    <StatCard
                        title="Images"
                        value={
                            images.length
                        }
                        icon={
                            <Box size={24} />
                        }
                    />

                    <StatCard
                        title="Volumes"
                        value={
                            volumes.length
                        }
                        icon={
                            <HardDrive
                                size={24}
                            />
                        }
                    />
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-white">
                                    Docker Engine
                                </h2>

                                <p className="text-sm text-gray-400">
                                    Live Docker connection
                                </p>
                            </div>

                            <div
                                className={`flex items-center gap-2 ${dockerConnected
                                    ? "text-green-400"
                                    : "text-red-400"
                                    }`}
                            >
                                <span
                                    className={`h-2.5 w-2.5 rounded-full ${dockerConnected
                                        ? "bg-green-400"
                                        : "bg-red-400"
                                        }`}
                                />

                                {dockerConnected
                                    ? "Connected"
                                    : "Disconnected"}
                            </div>
                        </div>

                        <div className="space-y-3 text-sm">
                            <InfoRow
                                label="Docker Version"
                                value={
                                    dockerInfo?.ServerVersion ||
                                    "Unavailable"
                                }
                            />

                            <InfoRow
                                label="Containers"
                                value={String(
                                    dockerInfo?.Containers ??
                                    containers.length
                                )}
                            />

                            <InfoRow
                                label="Images"
                                value={String(
                                    dockerInfo?.Images ??
                                    images.length
                                )}
                            />

                            <InfoRow
                                label="Operating System"
                                value={
                                    dockerInfo?.OperatingSystem ||
                                    "Docker Host"
                                }
                            />

                            <InfoRow
                                label="Architecture"
                                value={
                                    dockerInfo?.Architecture ||
                                    "-"
                                }
                            />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-white">
                                Recent Containers
                            </h2>

                            <button
                                onClick={() =>
                                    setActiveTab(
                                        "containers"
                                    )
                                }
                                className="text-sm text-blue-400 hover:text-blue-300"
                            >
                                View All
                            </button>
                        </div>

                        {containers.length ===
                            0 ? (
                            <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-gray-500">
                                No Docker containers
                                found.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {containers
                                    .slice(0, 5)
                                    .map(
                                        (
                                            container
                                        ) => (
                                            <div
                                                key={
                                                    container.Id
                                                }
                                                className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 p-4"
                                            >
                                                <div>
                                                    <p className="font-medium text-white">
                                                        {getContainerName(
                                                            container
                                                        )}
                                                    </p>

                                                    <p className="text-xs text-gray-500">
                                                        {shortId(
                                                            container.Id
                                                        )}
                                                    </p>
                                                </div>

                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs ${isRunning(
                                                        container
                                                    )
                                                        ? "bg-green-500/10 text-green-400"
                                                        : "bg-gray-500/10 text-gray-400"
                                                        }`}
                                                >
                                                    {container.State ||
                                                        "unknown"}
                                                </span>
                                            </div>
                                        )
                                    )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    /*
     * ============================================================
     * REAL DOCKER MONITORING
     * ============================================================
     */

    const renderDockerMonitoring = () => {
        const formatMonitoringBytes = (
            bytes: number
        ) => {
            if (
                !bytes ||
                bytes <= 0
            ) {
                return "0 B";
            }

            const units = [
                "B",
                "KB",
                "MB",
                "GB",
                "TB",
            ];

            const index = Math.min(
                Math.floor(
                    Math.log(bytes) /
                    Math.log(1024)
                ),
                units.length - 1
            );

            return `${(
                bytes /
                Math.pow(
                    1024,
                    index
                )
            ).toFixed(
                index === 0 ? 0 : 2
            )} ${units[index]}`;
        };

        const formatMonitoringTime = (
            timestamp: string
        ) => {
            if (!timestamp) {
                return "-";
            }

            return new Date(
                timestamp
            ).toLocaleTimeString();
        };

        if (
            monitoringLoading &&
            !monitoring
        ) {
            return (
                <PageSection
                    title="Docker Monitoring"
                    description="Real-time CPU, memory, network and container health from Docker Engine."
                >
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-16 text-center">
                        <RefreshCw
                            size={40}
                            className="mx-auto animate-spin text-blue-400"
                        />

                        <p className="mt-4 text-gray-400">
                            Collecting real Docker
                            monitoring data...
                        </p>
                    </div>
                </PageSection>
            );
        }

        if (
            monitoringError &&
            !monitoring
        ) {
            return (
                <PageSection
                    title="Docker Monitoring"
                    description="Real-time CPU, memory, network and container health from Docker Engine."
                >
                    <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
                        <div className="flex items-start gap-3">
                            <Activity
                                size={24}
                                className="mt-0.5 text-red-400"
                            />

                            <div>
                                <h2 className="font-semibold text-red-300">
                                    Monitoring connection problem
                                </h2>

                                <p className="mt-2 text-sm text-red-400">
                                    {monitoringError}
                                </p>

                                <button
                                    onClick={
                                        fetchMonitoringData
                                    }
                                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-500/20 px-4 py-2 text-sm text-red-300 hover:bg-red-500/30"
                                >
                                    <RefreshCw
                                        size={16}
                                    />
                                    Retry Monitoring
                                </button>
                            </div>
                        </div>
                    </div>
                </PageSection>
            );
        }

        if (!monitoring) {
            return (
                <PageSection
                    title="Docker Monitoring"
                    description="Real-time CPU, memory, network and container health from Docker Engine."
                >
                    <EmptyState
                        icon={
                            <Activity
                                size={45}
                            />
                        }
                        title="No monitoring data available"
                    />
                </PageSection>
            );
        }

        return (
            <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-white">
                                Docker Monitoring
                            </h1>

                            <span className="flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs text-green-400">
                                <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                                Live
                            </span>
                        </div>

                        <p className="mt-2 text-gray-400">
                            Real CPU, memory, network and
                            container health metrics from
                            Docker Engine.
                        </p>
                    </div>

                    <button
                        onClick={
                            fetchMonitoringData
                        }
                        disabled={
                            monitoringLoading
                        }
                        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-gray-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <RefreshCw
                            size={17}
                            className={
                                monitoringLoading
                                    ? "animate-spin"
                                    : ""
                            }
                        />

                        Refresh
                    </button>
                </div>

                {monitoringError && (
                    <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
                        <p className="text-sm text-yellow-300">
                            Latest monitoring update failed:
                            {" "}
                            {monitoringError}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                            The previous monitoring data is
                            still being displayed.
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">
                                    Containers
                                </p>

                                <p className="mt-2 text-3xl font-bold text-white">
                                    {monitoring.engine.containers}
                                </p>
                            </div>

                            <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
                                <Container
                                    size={24}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">
                                    Running
                                </p>

                                <p className="mt-2 text-3xl font-bold text-green-400">
                                    {monitoring.engine.running}
                                </p>
                            </div>

                            <div className="rounded-xl bg-green-500/10 p-3 text-green-400">
                                <Play size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">
                                    Stopped
                                </p>

                                <p className="mt-2 text-3xl font-bold text-gray-300">
                                    {monitoring.engine.stopped}
                                </p>
                            </div>

                            <div className="rounded-xl bg-gray-500/10 p-3 text-gray-400">
                                <Square
                                    size={24}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">
                                    Images
                                </p>

                                <p className="mt-2 text-3xl font-bold text-white">
                                    {monitoring.engine.images}
                                </p>
                            </div>

                            <div className="rounded-xl bg-purple-500/10 p-3 text-purple-400">
                                <Box size={24} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                    <div className="mb-5 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-white">
                                Docker Engine Information
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Information reported directly by
                                Docker Engine.
                            </p>
                        </div>

                        <Activity
                            size={22}
                            className="text-blue-400"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-xl border border-white/5 bg-black/20 p-4">
                            <p className="text-xs uppercase tracking-wide text-gray-500">
                                Docker Version
                            </p>

                            <p className="mt-2 font-semibold text-white">
                                {monitoring.engine.serverVersion}
                            </p>
                        </div>

                        <div className="rounded-xl border border-white/5 bg-black/20 p-4">
                            <p className="text-xs uppercase tracking-wide text-gray-500">
                                Operating System
                            </p>

                            <p className="mt-2 truncate font-semibold text-white">
                                {monitoring.engine.operatingSystem}
                            </p>
                        </div>

                        <div className="rounded-xl border border-white/5 bg-black/20 p-4">
                            <p className="text-xs uppercase tracking-wide text-gray-500">
                                Architecture
                            </p>

                            <p className="mt-2 font-semibold text-white">
                                {monitoring.engine.architecture}
                            </p>
                        </div>

                        <div className="rounded-xl border border-white/5 bg-black/20 p-4">
                            <p className="text-xs uppercase tracking-wide text-gray-500">
                                Paused
                            </p>

                            <p className="mt-2 font-semibold text-white">
                                {monitoring.engine.paused}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
                    <div className="border-b border-white/10 px-6 py-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h2 className="text-xl font-semibold text-white">
                                    Container Resource Monitoring
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Live statistics collected from
                                    each Docker container.
                                </p>
                            </div>

                            <span className="text-xs text-gray-500">
                                Updated{" "}
                                {formatMonitoringTime(
                                    monitoring.timestamp
                                )}
                            </span>
                        </div>
                    </div>

                    {monitoring.containers.length ===
                        0 ? (
                        <div className="p-16 text-center">
                            <Container
                                size={48}
                                className="mx-auto text-gray-600"
                            />

                            <h3 className="mt-4 text-lg font-semibold text-white">
                                No containers found
                            </h3>

                            <p className="mt-2 text-sm text-gray-500">
                                Start or create a Docker container
                                to see real resource metrics.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1250px]">
                                <thead className="border-b border-white/10 bg-white/[0.03]">
                                    <tr>
                                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                                            Container
                                        </th>

                                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                                            Status
                                        </th>

                                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                                            CPU
                                        </th>

                                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                                            Memory
                                        </th>

                                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                                            Memory %
                                        </th>

                                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                                            Network RX
                                        </th>

                                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                                            Network TX
                                        </th>

                                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                                            Restarts
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-white/10">
                                    {monitoring.containers.map(
                                        (
                                            container
                                        ) => (
                                            <tr
                                                key={
                                                    container.id
                                                }
                                                className="transition hover:bg-white/[0.03]"
                                            >
                                                <td className="px-5 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={`rounded-xl p-2.5 ${container.running
                                                                ? "bg-green-500/10 text-green-400"
                                                                : "bg-gray-500/10 text-gray-400"
                                                                }`}
                                                        >
                                                            <Container
                                                                size={19}
                                                            />
                                                        </div>

                                                        <div className="min-w-0">
                                                            <p className="max-w-[220px] truncate font-semibold text-white">
                                                                {container.name ||
                                                                    "Unnamed"}
                                                            </p>

                                                            <p className="mt-1 font-mono text-xs text-gray-600">
                                                                {shortId(
                                                                    container.id
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-5 py-5">
                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs ${container.running
                                                            ? "bg-green-500/10 text-green-400"
                                                            : "bg-gray-500/10 text-gray-400"
                                                            }`}
                                                    >
                                                        {container.status}
                                                    </span>

                                                    {container.error && (
                                                        <p className="mt-2 max-w-[180px] text-xs text-yellow-500">
                                                            Metrics unavailable
                                                        </p>
                                                    )}
                                                </td>

                                                <td className="px-5 py-5">
                                                    <div className="min-w-[110px]">
                                                        <p className="font-semibold text-white">
                                                            {container.cpu.percent.toFixed(
                                                                2
                                                            )}
                                                            %
                                                        </p>

                                                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
                                                            <div
                                                                className="h-full rounded-full bg-blue-400 transition-all"
                                                                style={{
                                                                    width: `${Math.min(
                                                                        Math.max(
                                                                            container.cpu.percent,
                                                                            0
                                                                        ),
                                                                        100
                                                                    )}%`,
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-5 py-5">
                                                    <p className="text-sm text-gray-300">
                                                        {formatMonitoringBytes(
                                                            container.memory.usage
                                                        )}
                                                    </p>

                                                    <p className="mt-1 text-xs text-gray-600">
                                                        Limit:{" "}
                                                        {formatMonitoringBytes(
                                                            container.memory.limit
                                                        )}
                                                    </p>
                                                </td>

                                                <td className="px-5 py-5">
                                                    <span className="text-sm text-gray-300">
                                                        {container.memory.percent.toFixed(
                                                            2
                                                        )}
                                                        %
                                                    </span>
                                                </td>

                                                <td className="px-5 py-5">
                                                    <span className="text-sm text-gray-300">
                                                        {formatMonitoringBytes(
                                                            container.network.rxBytes
                                                        )}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-5">
                                                    <span className="text-sm text-gray-300">
                                                        {formatMonitoringBytes(
                                                            container.network.txBytes
                                                        )}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-5">
                                                    <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-gray-300">
                                                        {container.restartCount}
                                                    </span>
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5">
                    <div className="flex items-start gap-3">
                        <Activity
                            size={20}
                            className="mt-0.5 text-blue-400"
                        />

                        <div>
                            <h2 className="font-semibold text-blue-300">
                                Live Docker Monitoring
                            </h2>

                            <p className="mt-1 text-sm leading-6 text-gray-500">
                                CartForge collects these metrics
                                directly from the connected Docker
                                Engine. Monitoring automatically
                                refreshes every 3 seconds while this
                                tab is open.
                            </p>

                            <p className="mt-2 text-xs text-gray-600">
                                Last update:{" "}
                                {formatMonitoringTime(
                                    monitoring.timestamp
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    /*
     * ============================================================
     * CONTAINERS
     * ============================================================
     */

    const renderContainers =
        () => {
            const runningContainers =
                containers.filter(
                    (container) =>
                        container.State ===
                        "running"
                );

            const pausedContainers =
                containers.filter(
                    (container) =>
                        container.State ===
                        "paused"
                );

            const stoppedContainers =
                containers.filter(
                    (container) =>
                        container.State !==
                        "running" &&
                        container.State !==
                        "paused"
                );

            return (
                <div className="space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-white">
                                Docker Containers
                            </h1>

                            <p className="mt-2 text-gray-400">
                                Manage, monitor and control
                                containers running on your
                                Docker Engine.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() =>
                                    setShowCreateContainer(
                                        true
                                    )
                                }
                                className="flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-600"
                            >
                                <Plus size={17} />
                                Create Container
                            </button>

                            <button
                                onClick={
                                    fetchDockerData
                                }
                                disabled={loading}
                                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-gray-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <RefreshCw
                                    size={17}
                                    className={
                                        loading
                                            ? "animate-spin"
                                            : ""
                                    }
                                />

                                Refresh
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                            <p className="font-semibold text-red-300">
                                Docker connection problem
                            </p>

                            <p className="mt-1 text-sm text-red-400">
                                {error}
                            </p>

                            <button
                                onClick={
                                    fetchDockerData
                                }
                                className="mt-3 rounded-lg bg-red-500/20 px-4 py-2 text-sm text-red-300 hover:bg-red-500/30"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <StatCard
                            title="Total Containers"
                            value={
                                containers.length
                            }
                            icon={
                                <Container
                                    size={24}
                                />
                            }
                        />

                        <StatCard
                            title="Running"
                            value={
                                runningContainers.length
                            }
                            icon={
                                <Play size={24} />
                            }
                        />

                        <StatCard
                            title="Paused"
                            value={
                                pausedContainers.length
                            }
                            icon={
                                <Pause size={24} />
                            }
                        />

                        <StatCard
                            title="Stopped"
                            value={
                                stoppedContainers.length
                            }
                            icon={
                                <Square
                                    size={24}
                                />
                            }
                        />
                    </div>

                    {containers.length ===
                        0 ? (
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center">
                            <Container
                                size={52}
                                className="mx-auto text-gray-600"
                            />

                            <h2 className="mt-4 text-xl font-semibold text-white">
                                No containers found
                            </h2>

                            <p className="mt-2 text-gray-500">
                                Docker Engine is
                                connected, but there
                                are no containers to
                                display.
                            </p>

                            <button
                                onClick={() =>
                                    setShowCreateContainer(
                                        true
                                    )
                                }
                                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-500/10 px-4 py-2 text-sm text-blue-400 hover:bg-blue-500/20"
                            >
                                <Plus size={16} />
                                Create Container
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[1200px]">
                                    <thead className="border-b border-white/10 bg-white/[0.03]">
                                        <tr>
                                            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                                                Container
                                            </th>

                                            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                                                Image
                                            </th>

                                            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                                                ID
                                            </th>

                                            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                                                Status
                                            </th>

                                            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                                                Ports
                                            </th>

                                            <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-400">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-white/10">
                                        {containers.map(
                                            (container) => {
                                                const running =
                                                    container.State ===
                                                    "running";

                                                const paused =
                                                    container.State ===
                                                    "paused";

                                                const containerPorts =
                                                    container.Ports?.filter(
                                                        (
                                                            port
                                                        ) =>
                                                            port.PublicPort
                                                    )
                                                        .map(
                                                            (
                                                                port
                                                            ) =>
                                                                `${port.PublicPort}:${port.PrivatePort}/${port.Type || "tcp"}`
                                                        )
                                                        .join(
                                                            ", "
                                                        );

                                                return (
                                                    <tr
                                                        key={
                                                            container.Id
                                                        }
                                                        className="transition hover:bg-white/[0.03]"
                                                    >
                                                        <td className="px-5 py-5">
                                                            <div className="flex items-center gap-3">
                                                                <div
                                                                    className={`rounded-xl p-2.5 ${running
                                                                        ? "bg-green-500/10 text-green-400"
                                                                        : paused
                                                                            ? "bg-yellow-500/10 text-yellow-400"
                                                                            : "bg-gray-500/10 text-gray-400"
                                                                        }`}
                                                                >
                                                                    <Container
                                                                        size={
                                                                            19
                                                                        }
                                                                    />
                                                                </div>

                                                                <div className="min-w-0">
                                                                    <p className="truncate font-semibold text-white">
                                                                        {getContainerName(
                                                                            container
                                                                        )}
                                                                    </p>

                                                                    <p className="mt-1 max-w-[250px] truncate text-xs text-gray-500">
                                                                        {container.Command ||
                                                                            "No command"}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        <td className="px-5 py-5">
                                                            <p className="max-w-[220px] truncate text-sm text-gray-300">
                                                                {container.Image ||
                                                                    "-"}
                                                            </p>
                                                        </td>

                                                        <td className="px-5 py-5">
                                                            <span className="rounded-md bg-black/30 px-2 py-1 font-mono text-xs text-gray-500">
                                                                {shortId(
                                                                    container.Id
                                                                )}
                                                            </span>
                                                        </td>

                                                        <td className="px-5 py-5">
                                                            <div className="flex items-center gap-2">
                                                                <span
                                                                    className={`h-2.5 w-2.5 rounded-full ${running
                                                                        ? "bg-green-400"
                                                                        : paused
                                                                            ? "bg-yellow-400"
                                                                            : "bg-gray-500"
                                                                        }`}
                                                                />

                                                                <span
                                                                    className={`max-w-[180px] truncate text-xs ${running
                                                                        ? "text-green-400"
                                                                        : paused
                                                                            ? "text-yellow-400"
                                                                            : "text-gray-400"
                                                                        }`}
                                                                >
                                                                    {container.Status ||
                                                                        container.State ||
                                                                        "unknown"}
                                                                </span>
                                                            </div>
                                                        </td>

                                                        <td className="px-5 py-5">
                                                            <span className="text-xs text-gray-400">
                                                                {containerPorts ||
                                                                    "No published ports"}
                                                            </span>
                                                        </td>

                                                        <td className="px-5 py-5">
                                                            <div className="flex justify-end gap-2">
                                                                {running ? (
                                                                    <ActionButton
                                                                        title="Stop container"
                                                                        loading={
                                                                            actionLoading ===
                                                                            `stop-${container.Id}`
                                                                        }
                                                                        onClick={() =>
                                                                            containerAction(
                                                                                container.Id,
                                                                                "stop"
                                                                            )
                                                                        }
                                                                    >
                                                                        <Square
                                                                            size={
                                                                                15
                                                                            }
                                                                        />
                                                                    </ActionButton>
                                                                ) : (
                                                                    <ActionButton
                                                                        title="Start container"
                                                                        loading={
                                                                            actionLoading ===
                                                                            `start-${container.Id}`
                                                                        }
                                                                        onClick={() =>
                                                                            containerAction(
                                                                                container.Id,
                                                                                "start"
                                                                            )
                                                                        }
                                                                    >
                                                                        <Play
                                                                            size={
                                                                                15
                                                                            }
                                                                        />
                                                                    </ActionButton>
                                                                )}

                                                                <ActionButton
                                                                    title="Restart container"
                                                                    loading={
                                                                        actionLoading ===
                                                                        `restart-${container.Id}`
                                                                    }
                                                                    onClick={() =>
                                                                        containerAction(
                                                                            container.Id,
                                                                            "restart"
                                                                        )
                                                                    }
                                                                >
                                                                    <RotateCcw
                                                                        size={
                                                                            15
                                                                        }
                                                                    />
                                                                </ActionButton>

                                                                {paused ? (
                                                                    <ActionButton
                                                                        title="Unpause container"
                                                                        loading={
                                                                            actionLoading ===
                                                                            `unpause-${container.Id}`
                                                                        }
                                                                        onClick={() =>
                                                                            containerAction(
                                                                                container.Id,
                                                                                "unpause"
                                                                            )
                                                                        }
                                                                    >
                                                                        <PlayCircle
                                                                            size={
                                                                                15
                                                                            }
                                                                        />
                                                                    </ActionButton>
                                                                ) : (
                                                                    <ActionButton
                                                                        title="Pause container"
                                                                        loading={
                                                                            actionLoading ===
                                                                            `pause-${container.Id}`
                                                                        }
                                                                        onClick={() =>
                                                                            containerAction(
                                                                                container.Id,
                                                                                "pause"
                                                                            )
                                                                        }
                                                                    >
                                                                        <Pause
                                                                            size={
                                                                                15
                                                                            }
                                                                        />
                                                                    </ActionButton>
                                                                )}

                                                                <ActionButton
                                                                    title="View logs"
                                                                    onClick={() =>
                                                                        viewLogs(
                                                                            container
                                                                        )
                                                                    }
                                                                >
                                                                    <FileText
                                                                        size={
                                                                            15
                                                                        }
                                                                    />
                                                                </ActionButton>

                                                                <ActionButton
                                                                    title="Inspect container"
                                                                    onClick={() =>
                                                                        inspectContainer(
                                                                            container.Id
                                                                        )
                                                                    }
                                                                >
                                                                    <Eye
                                                                        size={
                                                                            15
                                                                        }
                                                                    />
                                                                </ActionButton>

                                                                <ActionButton
                                                                    title="Remove container"
                                                                    loading={
                                                                        actionLoading ===
                                                                        `remove-${container.Id}`
                                                                    }
                                                                    onClick={() =>
                                                                        removeContainer(
                                                                            container.Id
                                                                        )
                                                                    }
                                                                    danger
                                                                >
                                                                    <Trash2
                                                                        size={
                                                                            15
                                                                        }
                                                                    />
                                                                </ActionButton>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            }
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {containers.length >
                        0 && (
                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                                <div className="flex items-center gap-3">
                                    <Activity
                                        size={20}
                                        className="text-blue-400"
                                    />

                                    <div>
                                        <h2 className="font-semibold text-white">
                                            Docker Engine Status
                                        </h2>

                                        <p className="text-sm text-gray-500">
                                            Live container
                                            information from
                                            Docker Engine
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <div className="rounded-xl border border-white/5 bg-black/20 p-4">
                                        <p className="text-xs uppercase text-gray-500">
                                            Docker Version
                                        </p>

                                        <p className="mt-2 font-semibold text-white">
                                            {dockerInfo?.ServerVersion ||
                                                "-"}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-white/5 bg-black/20 p-4">
                                        <p className="text-xs uppercase text-gray-500">
                                            Host OS
                                        </p>

                                        <p className="mt-2 truncate font-semibold text-white">
                                            {dockerInfo?.OperatingSystem ||
                                                "-"}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-white/5 bg-black/20 p-4">
                                        <p className="text-xs uppercase text-gray-500">
                                            Architecture
                                        </p>

                                        <p className="mt-2 font-semibold text-white">
                                            {dockerInfo?.Architecture ||
                                                "-"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                </div>
            );
        };

    /*
     * ============================================================
     * IMAGES
     * ============================================================
     */

    const renderImages = () => {
        const totalImageSize =
            images.reduce(
                (total, image) =>
                    total +
                    (image.Size || 0),
                0
            );

        return (
            <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white">
                            Docker Images
                        </h1>

                        <p className="mt-2 text-gray-400">
                            Pull, inspect, manage and remove
                            Docker images on the connected
                            Docker Engine.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() =>
                                setShowPullImage(
                                    true
                                )
                            }
                            className="flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-600"
                        >
                            <Download size={17} />
                            Pull Image
                        </button>

                        <button
                            onClick={
                                fetchDockerData
                            }
                            disabled={loading}
                            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-gray-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <RefreshCw
                                size={17}
                                className={
                                    loading
                                        ? "animate-spin"
                                        : ""
                                }
                            />

                            Refresh
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <StatCard
                        title="Total Images"
                        value={
                            images.length
                        }
                        icon={
                            <Box size={24} />
                        }
                    />

                    <StatCard
                        title="Images In Use"
                        value={
                            images.filter(
                                (image) =>
                                    (image.Containers ??
                                        0) > 0
                            ).length
                        }
                        icon={
                            <Container
                                size={24}
                            />
                        }
                    />

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">
                                    Total Image Size
                                </p>

                                <p className="mt-2 text-3xl font-bold text-white">
                                    {formatBytes(
                                        totalImageSize
                                    )}
                                </p>
                            </div>

                            <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
                                <HardDrive
                                    size={24}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                        <p className="font-semibold text-red-300">
                            Docker image error
                        </p>

                        <p className="mt-1 text-sm text-red-400">
                            {error}
                        </p>
                    </div>
                )}

                {images.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-16 text-center">
                        <Box
                            size={55}
                            className="mx-auto text-gray-600"
                        />

                        <h2 className="mt-5 text-xl font-semibold text-white">
                            No images found
                        </h2>

                        <p className="mt-2 text-gray-500">
                            Pull a Docker image to
                            get started.
                        </p>

                        <button
                            onClick={() =>
                                setShowPullImage(
                                    true
                                )
                            }
                            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-600"
                        >
                            <Download
                                size={16}
                            />
                            Pull Image
                        </button>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1100px]">
                                <thead className="border-b border-white/10 bg-white/[0.03]">
                                    <tr>
                                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                                            Repository / Tag
                                        </th>

                                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                                            Image ID
                                        </th>

                                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                                            Size
                                        </th>

                                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                                            Containers
                                        </th>

                                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                                            Created
                                        </th>

                                        <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-400">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-white/10">
                                    {images.map(
                                        (image) => (
                                            <tr
                                                key={
                                                    image.Id
                                                }
                                                className="transition hover:bg-white/[0.03]"
                                            >
                                                <td className="px-5 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-400">
                                                            <Box
                                                                size={
                                                                    19
                                                                }
                                                            />
                                                        </div>

                                                        <div className="min-w-0">
                                                            <p className="font-semibold text-white">
                                                                {getImageName(
                                                                    image
                                                                )}
                                                            </p>

                                                            {image.RepoTags &&
                                                                image.RepoTags
                                                                    .length >
                                                                1 && (
                                                                    <p className="mt-1 text-xs text-gray-500">
                                                                        +
                                                                        {image
                                                                            .RepoTags
                                                                            .length -
                                                                            1}{" "}
                                                                        more
                                                                        tag(s)
                                                                    </p>
                                                                )}
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-5 py-5">
                                                    <span className="rounded-md bg-black/30 px-2 py-1 font-mono text-xs text-gray-500">
                                                        {shortId(
                                                            image.Id
                                                        )}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-5">
                                                    <span className="text-sm text-gray-300">
                                                        {formatBytes(
                                                            image.Size
                                                        )}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-5">
                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs ${(image.Containers ??
                                                            0) >
                                                            0
                                                            ? "bg-blue-500/10 text-blue-400"
                                                            : "bg-gray-500/10 text-gray-400"
                                                            }`}
                                                    >
                                                        {image.Containers ??
                                                            0}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-5">
                                                    <span className="text-xs text-gray-400">
                                                        {formatCreated(
                                                            image.Created
                                                        )}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-5">
                                                    <div className="flex justify-end gap-2">
                                                        <ActionButton
                                                            title="Inspect image"
                                                            loading={
                                                                imageActionLoading ===
                                                                `inspect-${image.Id}`
                                                            }
                                                            onClick={() =>
                                                                inspectImage(
                                                                    image
                                                                )
                                                            }
                                                        >
                                                            <Eye
                                                                size={
                                                                    15
                                                                }
                                                            />
                                                        </ActionButton>

                                                        <ActionButton
                                                            title="Remove image"
                                                            loading={
                                                                imageActionLoading ===
                                                                `remove-${image.Id}`
                                                            }
                                                            onClick={() =>
                                                                removeImage(
                                                                    image
                                                                )
                                                            }
                                                            danger
                                                        >
                                                            <Trash2
                                                                size={
                                                                    15
                                                                }
                                                            />
                                                        </ActionButton>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    /*
     * ============================================================
     * VOLUMES
     * ============================================================
     */

    const renderVolumes = () => {
        const localVolumes =
            volumes.filter(
                (volume) =>
                    (volume.Driver ||
                        "local") ===
                    "local"
            ).length;

        return (
            <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white">
                            Docker Volumes
                        </h1>

                        <p className="mt-2 text-gray-400">
                            Create, inspect and remove
                            persistent Docker storage
                            volumes.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() =>
                                setShowCreateVolume(
                                    true
                                )
                            }
                            className="flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-600"
                        >
                            <Plus size={17} />
                            Create Volume
                        </button>

                        <button
                            onClick={
                                fetchDockerData
                            }
                            disabled={loading}
                            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-gray-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <RefreshCw
                                size={17}
                                className={
                                    loading
                                        ? "animate-spin"
                                        : ""
                                }
                            />

                            Refresh
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                        <p className="font-semibold text-red-300">
                            Docker volume error
                        </p>

                        <p className="mt-1 text-sm text-red-400">
                            {error}
                        </p>

                        <button
                            onClick={
                                fetchDockerData
                            }
                            className="mt-3 rounded-lg bg-red-500/20 px-4 py-2 text-sm text-red-300 hover:bg-red-500/30"
                        >
                            Retry
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <StatCard
                        title="Total Volumes"
                        value={
                            volumes.length
                        }
                        icon={
                            <HardDrive
                                size={24}
                            />
                        }
                    />

                    <StatCard
                        title="Local Volumes"
                        value={
                            localVolumes
                        }
                        icon={
                            <HardDrive
                                size={24}
                            />
                        }
                    />

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">
                                    Storage
                                </p>

                                <p className="mt-2 text-lg font-bold text-white">
                                    Persistent
                                </p>

                                <p className="mt-1 text-xs text-gray-500">
                                    Docker-managed storage
                                </p>
                            </div>

                            <div className="rounded-xl bg-purple-500/10 p-3 text-purple-400">
                                <HardDrive
                                    size={24}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {volumes.length ===
                    0 ? (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-16 text-center">
                        <HardDrive
                            size={55}
                            className="mx-auto text-gray-600"
                        />

                        <h2 className="mt-5 text-xl font-semibold text-white">
                            No Docker volumes found
                        </h2>

                        <p className="mx-auto mt-2 max-w-lg text-gray-500">
                            Create a volume to store
                            persistent application data
                            independently from containers.
                        </p>

                        <button
                            onClick={() =>
                                setShowCreateVolume(
                                    true
                                )
                            }
                            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-600"
                        >
                            <Plus size={16} />
                            Create Volume
                        </button>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1050px]">
                                <thead className="border-b border-white/10 bg-white/[0.03]">
                                    <tr>
                                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                                            Volume
                                        </th>

                                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                                            Driver
                                        </th>

                                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                                            Scope
                                        </th>

                                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                                            Mountpoint
                                        </th>

                                        <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-400">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-white/10">
                                    {volumes.map(
                                        (volume) => (
                                            <tr
                                                key={
                                                    volume.Name
                                                }
                                                className="transition hover:bg-white/[0.03]"
                                            >
                                                <td className="px-5 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="rounded-xl bg-purple-500/10 p-2.5 text-purple-400">
                                                            <HardDrive
                                                                size={
                                                                    19
                                                                }
                                                            />
                                                        </div>

                                                        <div className="min-w-0">
                                                            <p className="max-w-[280px] truncate font-semibold text-white">
                                                                {volume.Name}
                                                            </p>

                                                            <p className="mt-1 text-xs text-gray-500">
                                                                Docker volume
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-5 py-5">
                                                    <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-400">
                                                        {volume.Driver ||
                                                            "local"}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-5">
                                                    <span className="text-sm text-gray-300">
                                                        {volume.Scope ||
                                                            "local"}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-5">
                                                    <p
                                                        className="max-w-[420px] truncate font-mono text-xs text-gray-500"
                                                        title={
                                                            volume.Mountpoint ||
                                                            ""
                                                        }
                                                    >
                                                        {volume.Mountpoint ||
                                                            "-"}
                                                    </p>
                                                </td>

                                                <td className="px-5 py-5">
                                                    <div className="flex justify-end gap-2">
                                                        <ActionButton
                                                            title="Inspect volume"
                                                            loading={
                                                                volumeActionLoading ===
                                                                `inspect-${volume.Name}`
                                                            }
                                                            onClick={() =>
                                                                inspectVolume(
                                                                    volume
                                                                )
                                                            }
                                                        >
                                                            <Eye
                                                                size={
                                                                    15
                                                                }
                                                            />
                                                        </ActionButton>

                                                        <ActionButton
                                                            title="Remove volume"
                                                            loading={
                                                                volumeActionLoading ===
                                                                `remove-${volume.Name}`
                                                            }
                                                            onClick={() =>
                                                                removeVolume(
                                                                    volume
                                                                )
                                                            }
                                                            danger
                                                        >
                                                            <Trash2
                                                                size={
                                                                    15
                                                                }
                                                            />
                                                        </ActionButton>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {volumes.length >
                    0 && (
                        <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-5">
                            <div className="flex items-start gap-3">
                                <HardDrive
                                    size={20}
                                    className="mt-0.5 text-purple-400"
                                />

                                <div>
                                    <h2 className="font-semibold text-purple-300">
                                        Persistent Docker Storage
                                    </h2>

                                    <p className="mt-1 text-sm leading-6 text-gray-500">
                                        Docker volumes persist data
                                        independently from the
                                        lifecycle of containers.
                                        Removing a container does not
                                        automatically remove its
                                        volume.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
            </div>
        );
    };

    /*
     * ============================================================
     * NETWORKS
     * ============================================================
     */

    const renderNetworks =
        () => {
            return (
                <PageSection
                    title="Docker Networks"
                    description="Docker networking resources."
                >
                    {networks.length ===
                        0 ? (
                        <EmptyState
                            icon={
                                <Network
                                    size={45}
                                />
                            }
                            title="No networks found"
                        />
                    ) : (
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            {networks.map(
                                (network) => (
                                    <div
                                        key={
                                            network.Id
                                        }
                                        className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="rounded-xl bg-cyan-500/10 p-3 text-cyan-400">
                                                <Network
                                                    size={24}
                                                />
                                            </div>

                                            <div>
                                                <h3 className="font-semibold text-white">
                                                    {network.Name}
                                                </h3>

                                                <p className="mt-2 text-sm text-gray-400">
                                                    Driver:{" "}
                                                    {network.Driver ||
                                                        "-"}
                                                </p>

                                                <p className="text-sm text-gray-500">
                                                    Scope:{" "}
                                                    {network.Scope ||
                                                        "-"}
                                                </p>

                                                <p className="mt-2 font-mono text-xs text-gray-600">
                                                    {shortId(
                                                        network.Id
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </PageSection>
            );
        };

    /*
     * ============================================================
     * PLACEHOLDER PAGES
     * ============================================================
     */

    const renderPlaceholder =
        (
            title: string,
            description: string,
            icon: any
        ) => {
            return (
                <PageSection
                    title={title}
                    description={
                        description
                    }
                >
                    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-16 text-center">
                        <div className="mx-auto flex w-fit rounded-2xl bg-blue-500/10 p-5 text-blue-400">
                            {icon}
                        </div>

                        <h2 className="mt-5 text-2xl font-semibold text-white">
                            {title}
                        </h2>

                        <p className="mx-auto mt-2 max-w-xl text-gray-500">
                            This section is ready
                            for the next Docker
                            management features.
                        </p>
                    </div>
                </PageSection>
            );
        };

    /*
     * ============================================================
     * TAB CONTENT
     * ============================================================
     */
    // ============================================================
    // AI YAML ASSISTANT FUNCTIONS
    // ============================================================

    const handleGenerateYaml = async () => {
        if (!aiPrompt.trim()) {
            setAiMessage(
                "Enter a description of the YAML you want to create."
            );
            return;
        }

        setAiLoading(true);
        setAiMessage("");
        setYamlExplanation("");

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/ai/yaml/generate`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        type: yamlFileType,
                        prompt: aiPrompt,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                    "AI YAML generation failed."
                );
            }

            setComposeYaml(
                data?.yaml ||
                data?.data?.yaml ||
                ""
            );

            setYamlExplanation(
                data?.explanation ||
                data?.data?.explanation ||
                ""
            );

            setAiMessage(
                "YAML generated successfully."
            );
        } catch (error: any) {
            setAiMessage(
                error?.message ||
                "AI YAML generation failed."
            );
        } finally {
            setAiLoading(false);
        }
    };

    const handleFixYamlWithAI = async () => {
        if (!composeYaml.trim()) {
            setAiMessage(
                "Enter or upload YAML first."
            );
            return;
        }

        setAiLoading(true);
        setAiMessage("");
        setYamlExplanation("");

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/ai/yaml/fix`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        type: yamlFileType,
                        yaml: composeYaml,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                    "AI YAML fixing failed."
                );
            }

            setComposeYaml(
                data?.yaml ||
                data?.data?.yaml ||
                composeYaml
            );

            setYamlExplanation(
                data?.explanation ||
                data?.data?.explanation ||
                ""
            );

            setAiMessage(
                "YAML fixed successfully."
            );
        } catch (error: any) {
            setAiMessage(
                error?.message ||
                "AI YAML fixing failed."
            );
        } finally {
            setAiLoading(false);
        }
    };
    const renderDockerCompose = () => {
        return (
            <div className="space-y-6">

                {/* ============================================================
               HEADER
               ============================================================ */}

                <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                        Docker Compose & AI YAML Assistant
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Generate, edit, validate and manage real Docker Compose
                        applications.
                    </p>
                </div>

                {/* ============================================================
               AI YAML ASSISTANT
               ============================================================ */}

                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

                    <div className="mb-5">
                        <h3 className="text-lg font-semibold text-slate-900">
                            AI YAML Assistant
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            Generate or fix Docker Compose YAML using AI.
                        </p>
                    </div>

                    <div className="grid gap-5 lg:grid-cols-[220px_1fr]">

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                File Type
                            </label>

                            <select
                                value={yamlFileType}
                                onChange={(event) =>
                                    setYamlFileType(event.target.value)
                                }
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
                            >
                                <option value="docker-compose">
                                    Docker Compose
                                </option>

                                <option value="kubernetes">
                                    Kubernetes
                                </option>

                                <option value="ansible">
                                    Ansible
                                </option>

                                <option value="terraform">
                                    Terraform
                                </option>

                                <option value="yaml">
                                    Generic YAML
                                </option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                What do you want to create or fix?
                            </label>

                            <textarea
                                value={aiPrompt}
                                onChange={(event) =>
                                    setAiPrompt(event.target.value)
                                }
                                rows={5}
                                placeholder="Example: Create a Docker Compose application with Nginx and MySQL. Expose Nginx on port 8080."
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                            />

                            <div className="mt-3 flex flex-wrap gap-2">

                                <button
                                    type="button"
                                    onClick={handleGenerateYaml}
                                    disabled={aiLoading}
                                    className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
                                >
                                    {aiLoading
                                        ? "Processing..."
                                        : "Generate YAML"}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleFixYamlWithAI}
                                    disabled={aiLoading}
                                    className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 disabled:opacity-50"
                                >
                                    Fix YAML with AI
                                </button>

                            </div>
                        </div>

                    </div>

                    {aiMessage && (
                        <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                            {aiMessage}
                        </div>
                    )}

                </div>

                {/* ============================================================
               YAML EDITOR
               ============================================================ */}

                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">

                        <div>
                            <h3 className="text-lg font-semibold text-slate-900">
                                YAML Editor
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                                Edit the Docker Compose YAML before creating
                                your project.
                            </p>
                        </div>

                        <div className="flex gap-2">

                            <button
                                type="button"
                                onClick={() => {
                                    const template = `services:
  web:
    image: nginx:alpine
    ports:
      - "8080:80"
`;
                                    setComposeYaml(template);
                                }}
                                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
                            >
                                Load Template
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    const input =
                                        document.createElement("input");

                                    input.type = "file";
                                    input.accept = ".yml,.yaml";

                                    input.onchange = async (event: any) => {
                                        const file =
                                            event.target.files?.[0];

                                        if (!file) return;

                                        const text =
                                            await file.text();

                                        setComposeYaml(text);
                                    };

                                    input.click();
                                }}
                                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
                            >
                                Upload YAML
                            </button>

                        </div>

                    </div>

                    <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-950">

                        <div className="border-b border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-300">
                            Docker Compose YAML
                        </div>

                        <textarea
                            value={composeYaml}
                            onChange={(event) =>
                                setComposeYaml(event.target.value)
                            }
                            spellCheck={false}
                            className="min-h-[400px] w-full resize-y bg-slate-950 p-5 font-mono text-sm leading-6 text-green-300 outline-none"
                        />

                    </div>

                    {yamlExplanation && (
                        <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                            <strong>AI Explanation</strong>

                            <div className="mt-2 whitespace-pre-wrap">
                                {yamlExplanation}
                            </div>
                        </div>
                    )}

                </div>

                {/* ============================================================
               CREATE PROJECT
               ============================================================ */}

                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

                    <h3 className="text-lg font-semibold text-slate-900">
                        Create Docker Compose Project
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                        Save the YAML above as a real Docker Compose project.
                    </p>

                    <div className="mt-4 flex flex-col gap-3 md:flex-row">

                        <input
                            value={composeProjectName}
                            onChange={(event) =>
                                setComposeProjectName(event.target.value)
                            }
                            placeholder="Project name, e.g. shopkart"
                            className="flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
                        />

                        <button
                            type="button"
                            onClick={handleCreateComposeProject}
                            disabled={composeLoading}
                            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
                        >
                            {composeLoading
                                ? "Creating..."
                                : "Create Compose Project"}
                        </button>

                        <button
                            type="button"
                            onClick={() => handleValidateCompose()}
                            disabled={composeLoading}
                            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 disabled:opacity-50"
                        >
                            Validate
                        </button>

                    </div>

                    {composeMessage && (
                        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                            {composeMessage}
                        </div>
                    )}

                </div>
                {/* ============================================================
   COMPOSE PROJECTS
   ============================================================ */}

                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">

                        <div>
                            <h3 className="text-lg font-semibold text-slate-900">
                                Compose Projects
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                                Start, stop, restart, inspect and delete your
                                Docker Compose applications.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={fetchComposeProjects}
                            disabled={composeLoading}
                            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-50"
                        >
                            Refresh
                        </button>

                    </div>

                    {composeProjects.length === 0 ? (

                        <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                            No Compose projects found.
                        </div>

                    ) : (

                        <div className="space-y-4">

                            {composeProjects.map(
                                (project: any, index: number) => {

                                    const projectName =
                                        typeof project === "string"
                                            ? project
                                            : project.name ||
                                            project.projectName ||
                                            project.Name ||
                                            `project-${index}`;

                                    const selected =
                                        selectedComposeProject === projectName;

                                    return (
                                        <div
                                            key={`${projectName}-${index}`}
                                            className={`rounded-xl border p-5 ${selected
                                                ? "border-slate-400 bg-slate-50"
                                                : "border-slate-200 bg-white"
                                                }`}
                                        >

                                            {/* PROJECT HEADER */}
                                            <div className="flex flex-wrap items-center justify-between gap-4">

                                                <div>
                                                    <h4 className="font-semibold text-slate-900">
                                                        {projectName}
                                                    </h4>

                                                    <p className="mt-1 text-xs text-slate-500">
                                                        Docker Compose project
                                                    </p>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setSelectedComposeProject(
                                                            projectName
                                                        )
                                                    }
                                                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700"
                                                >
                                                    Select Project
                                                </button>

                                            </div>

                                            {/* PROJECT ACTIONS */}
                                            <div className="mt-5 border-t border-slate-200 pt-5">

                                                <div className="flex flex-wrap gap-2">

                                                    {/* START */}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleComposeUp(projectName)
                                                        }
                                                        disabled={composeLoading}
                                                        className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-50"
                                                    >
                                                        Start
                                                    </button>

                                                    {/* STOP */}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleComposeDown(projectName)
                                                        }
                                                        disabled={composeLoading}
                                                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 disabled:opacity-50"
                                                    >
                                                        Stop
                                                    </button>

                                                    {/* RESTART */}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleComposeRestart(projectName)
                                                        }
                                                        disabled={composeLoading}
                                                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 disabled:opacity-50"
                                                    >
                                                        Restart
                                                    </button>

                                                    {/* STATUS */}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleComposeStatus(projectName)
                                                        }
                                                        disabled={composeLoading}
                                                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 disabled:opacity-50"
                                                    >
                                                        Status
                                                    </button>

                                                    {/* LOGS */}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleComposeLogs(projectName)
                                                        }
                                                        disabled={composeLoading}
                                                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 disabled:opacity-50"
                                                    >
                                                        Logs
                                                    </button>

                                                    {/* VALIDATE */}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleValidateCompose(projectName)
                                                        }
                                                        disabled={composeLoading}
                                                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 disabled:opacity-50"
                                                    >
                                                        Validate
                                                    </button>

                                                    {/* DELETE */}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDeleteComposeProject(
                                                                projectName
                                                            )
                                                        }
                                                        disabled={composeLoading}
                                                        className="rounded-lg border border-red-300 bg-white px-3 py-2 text-sm text-red-600 disabled:opacity-50"
                                                    >
                                                        Delete
                                                    </button>

                                                </div>

                                            </div>

                                        </div>
                                    );
                                }
                            )}

                        </div>

                    )}

                </div>

                {/* ============================================================
   STATUS
   ============================================================ */}

                {composeStatus && (
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

                        <h3 className="text-lg font-semibold text-slate-900">
                            Compose Status
                        </h3>

                        <pre className="mt-4 max-h-[400px] overflow-auto rounded-lg bg-slate-950 p-5 text-xs leading-5 text-green-300">
                            {JSON.stringify(
                                composeStatus,
                                null,
                                2
                            )}
                        </pre>

                    </div>
                )}

                {/* ============================================================
   LOGS
   ============================================================ */}

                {composeLogs && (
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

                        <h3 className="text-lg font-semibold text-slate-900">
                            Compose Logs
                        </h3>

                        <pre className="mt-4 max-h-[500px] overflow-auto rounded-lg bg-slate-950 p-5 font-mono text-xs leading-5 text-green-300">
                            {composeLogs}
                        </pre>

                    </div>
                )}

                {/* ============================================================
               VALIDATION
               ============================================================ */}

                {composeConfig && (
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

                        <h3 className="text-lg font-semibold text-slate-900">
                            Compose Validation
                        </h3>

                        <pre className="mt-4 max-h-[500px] overflow-auto rounded-lg bg-slate-950 p-5 font-mono text-xs leading-5 text-green-300">
                            {JSON.stringify(
                                composeConfig,
                                null,
                                2
                            )}
                        </pre>

                    </div>
                )}

            </div>
        );
    };


    const renderContent = () => {
        switch (
        activeTab
        ) {
            case "dashboard":
                return renderDashboard();

            case "containers":
                return renderContainers();

            case "images":
                return renderImages();

            case "volumes":
                return renderVolumes();

            case "networks":
                return renderNetworks();

            case "sessions":
                return renderPlaceholder(
                    "Docker Sessions",
                    "Manage interactive Docker sessions.",
                    <Boxes
                        size={45}
                    />
                );

            case "terminal":
                return renderPlaceholder(
                    "Docker Terminal",
                    "Interactive container terminal will be connected here.",
                    <Terminal
                        size={45}
                    />
                );

            case "repositories":
                return renderPlaceholder(
                    "Docker Repositories",
                    "Docker registry and repository management.",
                    <Box
                        size={45}
                    />
                );

            case "compose":
                return renderDockerCompose();

            case "monitoring":
                return renderDockerMonitoring();

            default:
                return renderDashboard();
        }
    };

    /*
     * ============================================================
     * MAIN PAGE
     * ============================================================
     */

    return (
        <div className="min-h-screen bg-[#080c12] p-6 text-white">
            <div className="mb-6 rounded-xl border border-green-500/20 bg-green-500/5 px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-green-400">
                    <span className="h-2 w-2 rounded-full bg-green-400" />

                    DockerPage is rendering successfully
                </div>
            </div>

            <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                    <h1 className="text-3xl font-bold">
                        Docker Management
                    </h1>

                    <p className="mt-1 text-gray-400">
                        Real-time Docker Engine
                        management for CartForge.
                    </p>
                </div>

                <button
                    onClick={
                        fetchDockerData
                    }
                    disabled={loading}
                    className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-gray-200 transition hover:bg-white/10 disabled:opacity-50"
                >
                    <RefreshCw
                        size={17}
                        className={
                            loading
                                ? "animate-spin"
                                : ""
                        }
                    />

                    Refresh Docker
                </button>
            </div>

            <div className="mb-8 overflow-x-auto">
                <div className="flex min-w-max gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-2">
                    {tabs.map(
                        (tab) => {
                            const Icon =
                                tab.icon;

                            const active =
                                activeTab ===
                                tab.id;

                            return (
                                <button
                                    key={
                                        tab.id
                                    }
                                    onClick={() =>
                                        setActiveTab(
                                            tab.id
                                        )
                                    }
                                    className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm transition ${active
                                        ? "bg-blue-500/15 text-blue-400"
                                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                                        }`}
                                >
                                    <Icon
                                        size={17}
                                    />

                                    {tab.label}
                                </button>
                            );
                        }
                    )}
                </div>
            </div>

            {loading &&
                containers.length ===
                0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-16 text-center">
                    <RefreshCw
                        size={40}
                        className="mx-auto animate-spin text-blue-400"
                    />

                    <p className="mt-4 text-gray-400">
                        Connecting to Docker
                        Engine...
                    </p>
                </div>
            ) : (
                renderContent()
            )}

            {/* ========================================================
          PULL IMAGE MODAL
          ======================================================== */}

            {showPullImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
                    onMouseDown={(
                        event
                    ) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            if (
                                !pullLoading
                            ) {
                                setShowPullImage(
                                    false
                                );
                            }
                        }
                    }}
                >
                    <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#0d131c] shadow-2xl">
                        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-400">
                                    <Download
                                        size={22}
                                    />
                                </div>

                                <div>
                                    <h2 className="text-xl font-semibold text-white">
                                        Pull Docker Image
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Download an image
                                        from a Docker
                                        registry.
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    if (
                                        !pullLoading
                                    ) {
                                        setShowPullImage(
                                            false
                                        );
                                    }
                                }}
                                disabled={
                                    pullLoading
                                }
                                className="rounded-lg px-3 py-2 text-gray-400 hover:bg-white/5 hover:text-white disabled:opacity-40"
                            >
                                âœ•
                            </button>
                        </div>

                        <div className="space-y-5 p-6">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-300">
                                    Image Name
                                </label>

                                <input
                                    autoFocus
                                    type="text"
                                    value={
                                        pullImageName
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setPullImageName(
                                            event.target
                                                .value
                                        )
                                    }
                                    onKeyDown={(
                                        event
                                    ) => {
                                        if (
                                            event.key ===
                                            "Enter" &&
                                            !pullLoading
                                        ) {
                                            pullDockerImage();
                                        }
                                    }}
                                    placeholder="e.g. nginx:latest"
                                    disabled={
                                        pullLoading
                                    }
                                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-blue-500/50 disabled:opacity-50"
                                />

                                <p className="mt-2 text-xs text-gray-600">
                                    Examples: nginx:latest,
                                    ubuntu:latest,
                                    node:22
                                </p>
                            </div>

                            <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                                <p className="text-sm font-medium text-blue-300">
                                    What will happen?
                                </p>

                                <p className="mt-2 text-xs leading-5 text-gray-500">
                                    CartForge will ask
                                    Docker Engine to
                                    download the image.
                                    Once the pull finishes,
                                    the Images list will
                                    automatically refresh.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 border-t border-white/10 px-6 py-4">
                            <button
                                onClick={() => {
                                    if (
                                        !pullLoading
                                    ) {
                                        setShowPullImage(
                                            false
                                        );
                                    }
                                }}
                                disabled={
                                    pullLoading
                                }
                                className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-gray-300 hover:bg-white/10 disabled:opacity-40"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={
                                    pullDockerImage
                                }
                                disabled={
                                    pullLoading
                                }
                                className="flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {pullLoading ? (
                                    <>
                                        <RefreshCw
                                            size={16}
                                            className="animate-spin"
                                        />
                                        Pulling...
                                    </>
                                ) : (
                                    <>
                                        <Download
                                            size={16}
                                        />
                                        Pull Image
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================
          IMAGE INSPECT MODAL
          ======================================================== */}

            {showImageInspect && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
                    <div className="max-h-[85vh] w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-[#0d131c] shadow-2xl">
                        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                            <div>
                                <h2 className="font-semibold text-white">
                                    Image Inspect
                                </h2>

                                <p className="text-xs text-gray-500">
                                    {selectedImage
                                        ? getImageName(
                                            selectedImage
                                        )
                                        : "Docker image configuration"}
                                </p>
                            </div>

                            <button
                                onClick={() =>
                                    setShowImageInspect(
                                        false
                                    )
                                }
                                className="rounded-lg px-3 py-2 text-gray-400 hover:bg-white/5 hover:text-white"
                            >
                                Close
                            </button>
                        </div>

                        <pre className="max-h-[70vh] overflow-auto bg-black/40 p-6 font-mono text-xs leading-6 text-gray-300">
                            {JSON.stringify(
                                imageInspectData,
                                null,
                                2
                            )}
                        </pre>
                    </div>
                </div>
            )}

            {/* ========================================================
          CREATE CONTAINER MODAL
          ======================================================== */}

            {showCreateContainer && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
                    onMouseDown={(
                        event
                    ) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            if (
                                !createLoading
                            ) {
                                setShowCreateContainer(
                                    false
                                );
                            }
                        }
                    }}
                >
                    <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#0d131c] shadow-2xl">
                        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-400">
                                    <Container
                                        size={22}
                                    />
                                </div>

                                <div>
                                    <h2 className="text-xl font-semibold text-white">
                                        Create Container
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Create a real Docker
                                        container on the
                                        connected Docker
                                        Engine.
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    if (
                                        !createLoading
                                    ) {
                                        setShowCreateContainer(
                                            false
                                        );
                                    }
                                }}
                                disabled={
                                    createLoading
                                }
                                className="rounded-lg px-3 py-2 text-gray-400 hover:bg-white/5 hover:text-white disabled:opacity-40"
                            >
                                âœ•
                            </button>
                        </div>

                        <div className="space-y-5 p-6">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-300">
                                    Docker Image
                                </label>

                                <input
                                    type="text"
                                    value={
                                        createImage
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setCreateImage(
                                            event.target
                                                .value
                                        )
                                    }
                                    placeholder="e.g. nginx:latest"
                                    disabled={
                                        createLoading
                                    }
                                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-blue-500/50 disabled:opacity-50"
                                />

                                <p className="mt-2 text-xs text-gray-600">
                                    Enter an image that
                                    already exists on your
                                    Docker Engine.
                                </p>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-300">
                                    Container Name
                                </label>

                                <input
                                    type="text"
                                    value={
                                        createName
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setCreateName(
                                            event.target
                                                .value
                                        )
                                    }
                                    placeholder="e.g. cartforge-test-container"
                                    disabled={
                                        createLoading
                                    }
                                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-blue-500/50 disabled:opacity-50"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-300">
                                        Host Port
                                    </label>

                                    <input
                                        type="number"
                                        min="1"
                                        max="65535"
                                        value={
                                            createHostPort
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setCreateHostPort(
                                                event.target
                                                    .value
                                            )
                                        }
                                        disabled={
                                            createLoading
                                        }
                                        className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50 disabled:opacity-50"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-300">
                                        Container Port
                                    </label>

                                    <input
                                        type="number"
                                        min="1"
                                        max="65535"
                                        value={
                                            createContainerPort
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setCreateContainerPort(
                                                event.target
                                                    .value
                                            )
                                        }
                                        disabled={
                                            createLoading
                                        }
                                        className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50 disabled:opacity-50"
                                    />
                                </div>
                            </div>

                            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
                                <input
                                    type="checkbox"
                                    checked={
                                        createStartImmediately
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setCreateStartImmediately(
                                            event.target
                                                .checked
                                        )
                                    }
                                    disabled={
                                        createLoading
                                    }
                                    className="mt-1 h-4 w-4 accent-blue-500"
                                />

                                <div>
                                    <p className="text-sm font-medium text-white">
                                        Start container
                                        immediately
                                    </p>

                                    <p className="mt-1 text-xs text-gray-500">
                                        Docker will create and
                                        start the container
                                        automatically.
                                    </p>
                                </div>
                            </label>

                            <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                                <p className="text-sm font-medium text-blue-300">
                                    Docker configuration
                                </p>

                                <p className="mt-2 font-mono text-xs text-gray-400">
                                    {createHostPort ||
                                        "HOST"}
                                    :
                                    {createContainerPort ||
                                        "CONTAINER"}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 border-t border-white/10 px-6 py-4">
                            <button
                                onClick={() => {
                                    if (
                                        !createLoading
                                    ) {
                                        setShowCreateContainer(
                                            false
                                        );
                                    }
                                }}
                                disabled={
                                    createLoading
                                }
                                className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-gray-300 hover:bg-white/10 disabled:opacity-40"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={
                                    createNewContainer
                                }
                                disabled={
                                    createLoading
                                }
                                className="flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50"
                            >
                                {createLoading ? (
                                    <>
                                        <RefreshCw
                                            size={16}
                                            className="animate-spin"
                                        />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Plus size={16} />
                                        Create Container
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================
          CREATE VOLUME MODAL
          ======================================================== */}

            {showCreateVolume && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
                    onMouseDown={(
                        event
                    ) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            if (
                                !volumeCreateLoading
                            ) {
                                setShowCreateVolume(
                                    false
                                );
                            }
                        }
                    }}
                >
                    <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#0d131c] shadow-2xl">
                        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-purple-500/10 p-2.5 text-purple-400">
                                    <HardDrive
                                        size={22}
                                    />
                                </div>

                                <div>
                                    <h2 className="text-xl font-semibold text-white">
                                        Create Docker Volume
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Create persistent storage
                                        for Docker containers.
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    if (
                                        !volumeCreateLoading
                                    ) {
                                        setShowCreateVolume(
                                            false
                                        );
                                    }
                                }}
                                disabled={
                                    volumeCreateLoading
                                }
                                className="rounded-lg px-3 py-2 text-gray-400 hover:bg-white/5 hover:text-white disabled:opacity-40"
                            >
                                âœ•
                            </button>
                        </div>

                        <div className="space-y-5 p-6">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-300">
                                    Volume Name
                                </label>

                                <input
                                    autoFocus
                                    type="text"
                                    value={
                                        volumeName
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setVolumeName(
                                            event.target
                                                .value
                                        )
                                    }
                                    onKeyDown={(
                                        event
                                    ) => {
                                        if (
                                            event.key ===
                                            "Enter" &&
                                            !volumeCreateLoading
                                        ) {
                                            createNewVolume();
                                        }
                                    }}
                                    placeholder="e.g. cartforge-data"
                                    disabled={
                                        volumeCreateLoading
                                    }
                                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-purple-500/50 disabled:opacity-50"
                                />

                                <p className="mt-2 text-xs text-gray-600">
                                    Use letters, numbers,
                                    underscores, dots or hyphens.
                                </p>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-300">
                                    Volume Driver
                                </label>

                                <select
                                    value={
                                        volumeDriver
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setVolumeDriver(
                                            event.target
                                                .value
                                        )
                                    }
                                    disabled={
                                        volumeCreateLoading
                                    }
                                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-purple-500/50 disabled:opacity-50"
                                >
                                    <option value="local">
                                        local
                                    </option>
                                </select>
                            </div>

                            <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
                                <div className="flex items-start gap-3">
                                    <HardDrive
                                        size={18}
                                        className="mt-0.5 text-purple-400"
                                    />

                                    <div>
                                        <p className="text-sm font-medium text-purple-300">
                                            Persistent storage
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-gray-500">
                                            The volume remains available
                                            even after a container is
                                            removed.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 border-t border-white/10 px-6 py-4">
                            <button
                                onClick={() => {
                                    if (
                                        !volumeCreateLoading
                                    ) {
                                        setShowCreateVolume(
                                            false
                                        );
                                    }
                                }}
                                disabled={
                                    volumeCreateLoading
                                }
                                className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-gray-300 hover:bg-white/10 disabled:opacity-40"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={
                                    createNewVolume
                                }
                                disabled={
                                    volumeCreateLoading
                                }
                                className="flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {volumeCreateLoading ? (
                                    <>
                                        <RefreshCw
                                            size={16}
                                            className="animate-spin"
                                        />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Plus size={16} />
                                        Create Volume
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================
          VOLUME INSPECT MODAL
          ======================================================== */}

            {showVolumeInspect && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
                    onMouseDown={(
                        event
                    ) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            setShowVolumeInspect(
                                false
                            );
                        }
                    }}
                >
                    <div className="max-h-[85vh] w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-[#0d131c] shadow-2xl">
                        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                            <div>
                                <h2 className="font-semibold text-white">
                                    Volume Inspect
                                </h2>

                                <p className="text-xs text-gray-500">
                                    {selectedVolume?.Name ||
                                        "Docker volume configuration"}
                                </p>
                            </div>

                            <button
                                onClick={() =>
                                    setShowVolumeInspect(
                                        false
                                    )
                                }
                                className="rounded-lg px-3 py-2 text-gray-400 hover:bg-white/5 hover:text-white"
                            >
                                Close
                            </button>
                        </div>

                        <pre className="max-h-[70vh] overflow-auto whitespace-pre-wrap bg-black/40 p-6 font-mono text-xs leading-6 text-gray-300">
                            {JSON.stringify(
                                volumeInspectData,
                                null,
                                2
                            )}
                        </pre>
                    </div>
                </div>
            )}

            {/* ========================================================
          LOGS MODAL
          ======================================================== */}

            {showLogs && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
                    <div className="max-h-[85vh] w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-[#0d131c] shadow-2xl">
                        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                            <div>
                                <h2 className="font-semibold text-white">
                                    Container Logs
                                </h2>

                                <p className="text-xs text-gray-500">
                                    {selectedContainer
                                        ? getContainerName(
                                            selectedContainer
                                        )
                                        : ""}
                                </p>
                            </div>

                            <button
                                onClick={() =>
                                    setShowLogs(
                                        false
                                    )
                                }
                                className="rounded-lg px-3 py-2 text-gray-400 hover:bg-white/5 hover:text-white"
                            >
                                Close
                            </button>
                        </div>

                        <pre className="max-h-[70vh] overflow-auto whitespace-pre-wrap bg-black/40 p-6 font-mono text-xs leading-6 text-gray-300">
                            {logs ||
                                "No logs available."}
                        </pre>
                    </div>
                </div>
            )}

            {/* ========================================================
          CONTAINER INSPECT MODAL
          ======================================================== */}

            {showInspect && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
                    <div className="max-h-[85vh] w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-[#0d131c] shadow-2xl">
                        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                            <div>
                                <h2 className="font-semibold text-white">
                                    Container Inspect
                                </h2>

                                <p className="text-xs text-gray-500">
                                    Docker container
                                    configuration
                                </p>
                            </div>

                            <button
                                onClick={() =>
                                    setShowInspect(
                                        false
                                    )
                                }
                                className="rounded-lg px-3 py-2 text-gray-400 hover:bg-white/5 hover:text-white"
                            >
                                Close
                            </button>
                        </div>

                        <pre className="max-h-[70vh] overflow-auto bg-black/40 p-6 font-mono text-xs leading-6 text-gray-300">
                            {JSON.stringify(
                                inspectData,
                                null,
                                2
                            )}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
}

/*
 * ============================================================
 * SMALL UI COMPONENTS
 * ============================================================
 */

function StatCard({
    title,
    value,
    icon,
}: {
    title: string;
    value: number;
    icon: any;
}) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500">
                        {title}
                    </p>

                    <p className="mt-2 text-3xl font-bold text-white">
                        {value}
                    </p>
                </div>

                <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
                    {icon}
                </div>
            </div>
        </div>
    );
}

function InfoRow({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <span className="text-gray-500">
                {label}
            </span>

            <span className="max-w-[60%] truncate text-right text-gray-200">
                {value}
            </span>
        </div>
    );
}

function ActionButton({
    children,
    onClick,
    title,
    loading = false,
    danger = false,
}: {
    children: any;
    onClick: () => void;
    title: string;
    loading?: boolean;
    danger?: boolean;
}) {
    return (
        <button
            title={title}
            onClick={onClick}
            disabled={loading}
            className={`rounded-lg border p-2 transition disabled:cursor-not-allowed disabled:opacity-40 ${danger
                ? "border-red-500/20 text-red-400 hover:bg-red-500/10"
                : "border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
                }`}
        >
            {loading ? (
                <RefreshCw
                    size={15}
                    className="animate-spin"
                />
            ) : (
                children
            )}
        </button>
    );
}

function PageSection({
    title,
    description,
    children,
}: {
    title: string;
    description: string;
    children: any;
}) {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white">
                    {title}
                </h1>

                <p className="mt-2 text-gray-400">
                    {description}
                </p>
            </div>

            {children}
        </div>
    );
}

function EmptyState({
    icon,
    title,
}: {
    icon: any;
    title: string;
}) {
    return (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-16 text-center">
            <div className="mx-auto flex w-fit text-gray-600">
                {icon}
            </div>

            <h2 className="mt-4 text-xl font-semibold text-white">
                {title}
            </h2>
        </div>
    );
}













