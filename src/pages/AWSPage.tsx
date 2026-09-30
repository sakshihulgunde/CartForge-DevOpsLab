
import React, {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import {
    Activity,
    AlertTriangle,
    CheckCircle2,
    Cloud,
    Copy,
    Cpu,
    HardDrive,
    Info,
    KeyRound,
    Loader2,
    Monitor,
    Network,
    Play,
    RefreshCw,
    Server,
    SquareTerminal,
    Terminal as TerminalIcon,
    Trash2,
    Wifi,
    WifiOff,
    X,
    Zap,
} from "lucide-react";

import { Terminal as XTerm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";

import "@xterm/xterm/css/xterm.css";


type CreateLabResponse = {
    success?: boolean;
    message?: string;
    lab?: {
        instanceId?: string;
        instance_id?: string;
        labId?: string;
        lab_id?: string;
        [key: string]: unknown;
    };
    instanceId?: string;
    instance_id?: string;
    labId?: string;
    lab_id?: string;
    [key: string]: unknown;
};


/* ============================================================
   CONFIGURATION
============================================================ */

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:5000";

const API = API_BASE_URL.replace(/\/+$/, "");

const LAB_STORAGE_KEY = "cartforge_ec2_lab_id";

const INSTANCE_TYPE = "t3.micro";

const STORAGE_OPTIONS = [8, 10, 20, 30];

const DEFAULT_REGION = "ap-south-1";

/* ============================================================
   TYPES
============================================================ */

type NetworkingOptions = {
    publicIp: boolean;
    ssh: boolean;
    https: boolean;
};

type LabData = {
    instanceId: string;
    labName?: string;
    learnerId?: string;
    instanceType?: string;
    state?: string;
    publicIpAddress?: string | null;
    privateIpAddress?: string | null;
    availabilityZone?: string;
    region?: string;
    storageSize?: number;
    createdAt?: string;
    tags?: Record<string, string>;
};

type ApiResponse<T = any> = {
    success?: boolean;
    message?: string;
    error?: string;
    data?: T;
    lab?: LabData;
    result?: any;
    ssm?: any;
};

type SsmStatus = {
    success?: boolean;
    managed?: boolean;
    online?: boolean;
    pingStatus?: string;
    agentVersion?: string;
    platformName?: string;
    platformVersion?: string;
    instanceId?: string;
    error?: string;
};

type TerminalStartResponse = {
    success?: boolean;
    terminalReady?: boolean;
    instanceId?: string;
    sessionId?: string;
    accessToken?: string;
    websocketPath?: string;
    data?: any;
    result?: any;
    message?: string;
    error?: string;
};

/* ============================================================
   HELPERS
============================================================ */

const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
        return error.message;
    }

    return String(error);
};

const parseJsonResponse = async (
    response: Response
): Promise<any> => {
    const text = await response.text();

    if (!text) {
        return {};
    }

    try {
        return JSON.parse(text);
    } catch {
        return {
            success: false,
            error: text,
        };
    }
};

const getLabFromResponse = (
    response: ApiResponse
): LabData | null => {
    const candidates = [
        response.lab,
        response.data?.lab,
        response.result?.lab,
        response.data,
        response.result,
    ];

    for (const candidate of candidates) {
        if (
            candidate &&
            typeof candidate === "object" &&
            typeof candidate.instanceId === "string"
        ) {
            return candidate as LabData;
        }
    }

    return null;
};

const getSsmFromResponse = (
    json: ApiResponse,
    instanceId: string
): SsmStatus => {
    const source =
        json.ssm ||
        json.data?.ssm ||
        json.result?.ssm ||
        json.data ||
        json.result ||
        json;

    return {
        success:
            source?.success ??
            json.success ??
            true,

        managed:
            source?.managed ??
            source?.isManaged ??
            false,

        online:
            source?.online ??
            source?.isOnline ??
            String(source?.pingStatus || "").toLowerCase() ===
            "online",

        pingStatus:
            source?.pingStatus ||
            source?.status ||
            "Checking",

        agentVersion:
            source?.agentVersion,

        platformName:
            source?.platformName ||
            source?.platform ||
            "Ubuntu",

        platformVersion:
            source?.platformVersion,

        instanceId:
            source?.instanceId ||
            instanceId,

        error:
            source?.error ||
            json.error,
    };
};

/* ============================================================
   COMPONENT
============================================================ */

export default function AWSPage() {
    /* ==========================================================
       LAB STATE
    ========================================================== */

    const [learnerId, setLearnerId] = useState("");

    const [storage, setStorage] = useState(8);

    const [networking, setNetworking] =
        useState<NetworkingOptions>({
            publicIp: true,
            ssh: false,
            https: false,
        });

    const [lab, setLab] =
        useState<LabData | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [creating, setCreating] =
        useState(false);

    const [destroying, setDestroying] =
        useState(false);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState("");

    const [successMessage, setSuccessMessage] =
        useState("");

    const [ssmStatus, setSsmStatus] =
        useState<SsmStatus | null>(null);

    const [apiHealthy, setApiHealthy] =
        useState<boolean | null>(null);

    /* ==========================================================
       TERMINAL STATE
    ========================================================== */

    const terminalContainerRef =
        useRef<HTMLDivElement | null>(null);

    const terminalRef =
        useRef<XTerm | null>(null);

    const fitAddonRef =
        useRef<FitAddon | null>(null);

    const websocketRef =
        useRef<WebSocket | null>(null);

    const terminalResizeObserverRef =
        useRef<ResizeObserver | null>(null);

    const terminalWindowResizeHandlerRef =
        useRef<(() => void) | null>(null);

    const terminalDataDisposableRef =
        useRef<{ dispose: () => void } | null>(null);

    const [terminalOpen, setTerminalOpen] =
        useState(false);

    const [terminalConnecting, setTerminalConnecting] =
        useState(false);

    const [terminalConnected, setTerminalConnected] =
        useState(false);

    const [terminalError, setTerminalError] =
        useState("");

    const [terminalSessionId, setTerminalSessionId] =
        useState("");

    /* ==========================================================
       COMMON HELPERS
    ========================================================== */

    const clearMessages = useCallback(() => {
        setError("");
        setSuccessMessage("");
    }, []);

    const saveLabId = useCallback(
        (instanceId: string) => {
            localStorage.setItem(
                LAB_STORAGE_KEY,
                instanceId
            );
        },
        []
    );

    const removeLabId = useCallback(() => {
        localStorage.removeItem(
            LAB_STORAGE_KEY
        );
    }, []);

    /* ==========================================================
       API HEALTH
    ========================================================== */

    const checkApiHealth = useCallback(
        async () => {
            try {
                const response = await fetch(
                    `${API}/api/health`,
                    {
                        method: "GET",
                    }
                );

                setApiHealthy(response.ok);
            } catch {
                setApiHealthy(false);
            }
        },
        []
    );

    /* ==========================================================
       LOAD LAB
    ========================================================== */

    const loadLab = useCallback(
        async (instanceId: string) => {
            const response = await fetch(
                `${API}/api/ec2/lab/${encodeURIComponent(instanceId)}`,
                {
                    method: "GET",
                }
            );

            const json: ApiResponse =
                await parseJsonResponse(response);

            if (
                !response.ok ||
                json.success === false
            ) {
                throw new Error(
                    json.error ||
                    json.message ||
                    "Unable to load learner lab."
                );
            }

            const loadedLab =
                getLabFromResponse(json);

            if (!loadedLab?.instanceId) {
                throw new Error(
                    "AWS lab information was not returned by the backend."
                );
            }

            setLab(loadedLab);

            saveLabId(
                loadedLab.instanceId
            );

            return loadedLab;
        },
        [saveLabId]
    );
    /* ==========================================================
       LOAD SSM STATUS
    ========================================================== */

    const loadSsmStatus = useCallback(
        async (instanceId: string) => {
            try {
                const response = await fetch(
                    `${API}/api/ec2/lab/${encodeURIComponent(
                        instanceId
                    )
                    }/ssm-status`,
                    {
                        method: "GET",
                    }
                );

                const json: ApiResponse =
                    await parseJsonResponse(
                        response
                    );

                if (
                    !response.ok ||
                    json.success === false
                ) {
                    const message =
                        json.error ||
                        json.message ||
                        json.ssm?.error ||
                        "Unable to check AWS SSM status.";

                    throw new Error(message);
                }

                const normalized =
                    getSsmFromResponse(
                        json,
                        instanceId
                    );

                console.log(
                    "CartForge SSM status:",
                    normalized
                );

                setSsmStatus(
                    normalized
                );

                return normalized;
            } catch (err) {
                console.error(
                    "SSM status error:",
                    err
                );

                const failed: SsmStatus = {
                    success: false,
                    managed: false,
                    online: false,
                    pingStatus: "Offline",
                    instanceId,
                    error:
                        getErrorMessage(err),
                };

                setSsmStatus(failed);

                return failed;
            }
        },
        []
    );

    /* ==========================================================
       INITIAL LOAD
    ========================================================== */

    useEffect(() => {
        let mounted = true;

        const initialize =
            async () => {
                setLoading(true);

                try {
                    await checkApiHealth();

                    const savedInstanceId =
                        localStorage.getItem(
                            LAB_STORAGE_KEY
                        );

                    if (
                        !savedInstanceId
                    ) {
                        return;
                    }

                    try {
                        const loaded =
                            await loadLab(
                                savedInstanceId
                            );

                        if (
                            mounted &&
                            loaded?.instanceId
                        ) {
                            await loadSsmStatus(
                                loaded.instanceId
                            );
                        }
                    } catch (err) {
                        console.warn(
                            "Saved learner lab could not be loaded:",
                            err
                        );

                        /*
                         * Only clear local storage when the
                         * backend confirms that the saved lab
                         * cannot be loaded.
                         */
                        removeLabId();

                        if (mounted) {
                            setLab(null);
                            setSsmStatus(null);
                        }
                    }
                } finally {
                    if (mounted) {
                        setLoading(false);
                    }
                }
            };

        initialize();

        return () => {
            mounted = false;
        };
    }, [
        checkApiHealth,
        loadLab,
        loadSsmStatus,
        removeLabId,
    ]);

    /* ==========================================================
       AUTO REFRESH
    ========================================================== */

    useEffect(() => {
        if (!lab?.instanceId) {
            return;
        }

        const interval =
            window.setInterval(
                async () => {
                    try {
                        const refreshed =
                            await loadLab(
                                lab.instanceId
                            );

                        if (
                            refreshed?.instanceId
                        ) {
                            await loadSsmStatus(
                                refreshed.instanceId
                            );
                        }
                    } catch (err) {
                        console.warn(
                            "Automatic lab refresh failed:",
                            err
                        );
                    }
                },
                15000
            );

        return () => {
            window.clearInterval(
                interval
            );
        };
    }, [
        lab?.instanceId,
        loadLab,
        loadSsmStatus,
    ]);

    /* ==========================================================
       REFRESH
    ========================================================== */

    const refreshLab =
        async () => {
            clearMessages();

            setRefreshing(true);

            try {
                await checkApiHealth();

                if (!lab?.instanceId) {
                    return;
                }

                const refreshed =
                    await loadLab(
                        lab.instanceId
                    );

                if (
                    refreshed?.instanceId
                ) {
                    await loadSsmStatus(
                        refreshed.instanceId
                    );
                }

                setSuccessMessage(
                    "Learner lab status refreshed."
                );
            } catch (err) {
                setError(
                    getErrorMessage(err)
                );
            } finally {
                setRefreshing(false);
            }
        };

    /* ==========================================================
       CREATE LAB
    ========================================================== */

    const createLab =
        async () => {
            clearMessages();

            const name =
                learnerId.trim();

            if (!name) {
                setError(
                    "Please enter a Lab Name / Learner ID."
                );
                return;
            }

            if (lab?.instanceId) {
                setError(
                    "A learner lab already exists. Terminate it before creating another lab."
                );
                return;
            }

            if (!apiHealthy) {
                setError(
                    "CartForge backend is not reachable. Make sure node jenkins-api.js is running on port 5000."
                );
                return;
            }

            setCreating(true);

            try {
                const response =
                    await fetch(
                        `${API}/api/ec2/lab/create`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type":
                                    "application/json",
                            },
                            body: JSON.stringify({
                                learnerId: name,
                                labName: name,
                                instanceType:
                                    INSTANCE_TYPE,
                                storageSize:
                                    storage,
                                storage,
                                networking,
                            }),
                        }
                    );

                const json: ApiResponse<any> =
                    await parseJsonResponse(
                        response
                    );

                console.log(
                    "Create learner lab response:",
                    json
                );

                if (
                    !response.ok ||
                    json.success === false
                ) {
                    throw new Error(
                        json.error ||
                        json.message ||
                        "Failed to create learner lab."
                    );
                }

                const createdLab =
                    getLabFromResponse(
                        json
                    );

                if (
                    !createdLab?.instanceId
                ) {
                    /*
                     * Important diagnostic message.
                     * This means EC2 creation may have succeeded,
                     * but the backend did not return the instance
                     * object in the expected response.
                     */
                    console.error(
                        "Create API did not return instanceId:",
                        json
                    );

                    throw new Error(
                        "AWS returned a successful response, but CartForge did not receive the learner lab instance ID. Check the backend /api/ec2/lab/create response."
                    );
                }

                setLab(createdLab);

                saveLabId(
                    createdLab.instanceId
                );

                setSuccessMessage(
                    `Learner lab created: ${createdLab.instanceId}. Waiting for EC2 and SSM...`
                );

                /*
                 * EC2 may need several seconds before SSM
                 * becomes Online.
                 */
                await loadSsmStatus(
                    createdLab.instanceId
                );
            } catch (err) {
                console.error(
                    "Create learner lab error:",
                    err
                );

                setError(
                    getErrorMessage(err)
                );
            } finally {
                setCreating(false);
            }
        };

    /* ==========================================================
       TERMINAL CLEANUP
    ========================================================== */

    const cleanupTerminal =
        useCallback(() => {
            const ws =
                websocketRef.current;

            if (ws) {
                try {
                    ws.close();
                } catch {
                    // Ignore.
                }
            }

            websocketRef.current =
                null;

            if (
                terminalDataDisposableRef.current
            ) {
                try {
                    terminalDataDisposableRef.current.dispose();
                } catch {
                    // Ignore.
                }

                terminalDataDisposableRef.current =
                    null;
            }

            if (
                terminalResizeObserverRef.current
            ) {
                try {
                    terminalResizeObserverRef.current.disconnect();
                } catch {
                    // Ignore.
                }

                terminalResizeObserverRef.current =
                    null;
            }

            if (
                terminalWindowResizeHandlerRef.current
            ) {
                window.removeEventListener(
                    "resize",
                    terminalWindowResizeHandlerRef.current
                );

                terminalWindowResizeHandlerRef.current =
                    null;
            }

            if (terminalRef.current) {
                try {
                    terminalRef.current.dispose();
                } catch {
                    // Ignore.
                }

                terminalRef.current =
                    null;
            }

            fitAddonRef.current =
                null;

            setTerminalConnected(false);
            setTerminalConnecting(false);
            setTerminalSessionId("");
        }, []);

    /* ==========================================================
       DISCONNECT TERMINAL
    ========================================================== */

    const disconnectTerminal =
        useCallback(() => {
            cleanupTerminal();

            setTerminalOpen(false);
            setTerminalError("");
        }, [cleanupTerminal]);

    /* ==========================================================
       DESTROY LAB
    ========================================================== */

    const destroyLab =
        async () => {
            if (!lab?.instanceId) {
                return;
            }

            const confirmed =
                window.confirm(
                    `Terminate learner lab ${lab.instanceId}?\n\n` +
                    "This will terminate the dedicated CartForge EC2 instance. " +
                    "Terminate it after testing to reduce AWS charges."
                );

            if (!confirmed) {
                return;
            }

            clearMessages();

            setDestroying(true);

            disconnectTerminal();

            try {
                const response =
                    await fetch(
                        `${API}/api/ec2/lab/${encodeURIComponent(
                            lab.instanceId
                        )}/destroy`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type":
                                    "application/json",
                            },
                        }
                    );

                const json: ApiResponse =
                    await parseJsonResponse(
                        response
                    );

                if (
                    !response.ok ||
                    json.success === false
                ) {
                    throw new Error(
                        json.error ||
                        json.message ||
                        "Failed to terminate learner lab."
                    );
                }

                removeLabId();

                setLab(null);
                setSsmStatus(null);

                setSuccessMessage(
                    "Learner lab terminated successfully."
                );
            } catch (err) {
                console.error(
                    "Destroy learner lab error:",
                    err
                );

                setError(
                    getErrorMessage(err)
                );
            } finally {
                setDestroying(false);
            }
        };

    /* ==========================================================
       WEBSOCKET URL
    ========================================================== */

    const buildWebSocketUrl =
        (
            websocketPath: string,
            accessToken: string
        ) => {
            let base = API;

            if (
                base.startsWith(
                    "https://"
                )
            ) {
                base =
                    "wss://" +
                    base.slice(
                        "https://".length
                    );
            } else if (
                base.startsWith(
                    "http://"
                )
            ) {
                base =
                    "ws://" +
                    base.slice(
                        "http://".length
                    );
            }

            const path =
                websocketPath.startsWith(
                    "/"
                )
                    ? websocketPath
                    : `/${websocketPath}`;

            return (
                `${base}${path}` +
                `?accessToken=${encodeURIComponent(
                    accessToken
                )}`
            );
        };

    /* ==========================================================
       OPEN TERMINAL
    ========================================================== */

    const openTerminal =
        async () => {
            clearMessages();

            setTerminalError("");

            if (!lab?.instanceId) {
                setTerminalError(
                    "Create a learner lab before opening the terminal."
                );
                return;
            }

            /*
             * Always refresh EC2 state first.
             */
            let currentLab =
                lab;

            try {
                const refreshed =
                    await loadLab(
                        lab.instanceId
                    );

                if (refreshed) {
                    currentLab =
                        refreshed;
                }
            } catch (err) {
                setTerminalError(
                    getErrorMessage(err)
                );
                return;
            }

            /*
             * Refresh SSM state.
             */
            const currentSsm =
                await loadSsmStatus(
                    currentLab.instanceId
                );

            const currentState =
                (
                    currentLab.state ||
                    ""
                ).toLowerCase();

            if (
                currentState !==
                "running"
            ) {
                setTerminalError(
                    `The learner EC2 is not running. Current state: ${currentLab.state ||
                    "unknown"
                    }.`
                );
                return;
            }

            if (
                currentSsm.online !==
                true
            ) {
                setTerminalError(
                    "AWS SSM is not Online yet. Wait 10–30 seconds and click Refresh."
                );
                return;
            }

            /*
             * Close an old terminal before creating a new one.
             */
            disconnectTerminal();

            setTerminalOpen(true);
            setTerminalConnecting(true);
            setTerminalConnected(false);

            /*
             * Create xterm.
             */
            const terminal =
                new XTerm({
                    cursorBlink: true,
                    cursorStyle: "block",
                    fontSize: 14,
                    fontFamily:
                        'Consolas, "Courier New", monospace',
                    convertEol: true,
                    scrollback: 5000,

                    theme: {
                        background:
                            "#09090b",
                        foreground:
                            "#e4e4e7",
                        cursor:
                            "#ffffff",
                        selectionBackground:
                            "#3f3f46",
                    },
                });

            const fitAddon =
                new FitAddon();

            terminal.loadAddon(
                fitAddon
            );

            terminalRef.current =
                terminal;

            fitAddonRef.current =
                fitAddon;

            /*
             * Wait until React has rendered the terminal container.
             */
            window.setTimeout(() => {
                const container =
                    terminalContainerRef.current;

                if (!container) {
                    setTerminalError(
                        "Terminal container could not be initialized."
                    );

                    setTerminalConnecting(
                        false
                    );

                    return;
                }

                terminal.open(
                    container
                );

                try {
                    fitAddon.fit();
                } catch {
                    // Ignore.
                }

                terminal.focus();

                terminal.writeln(
                    "\x1b[36mCartForge Learner Lab Terminal\x1b[0m"
                );

                terminal.writeln(
                    "\x1b[90mConnecting to the dedicated Ubuntu EC2 through AWS SSM...\x1b[0m"
                );

                terminal.writeln("");
            }, 50);

            try {
                /*
                 * Start backend SSM terminal session.
                 */
                const response =
                    await fetch(
                        `${API}/api/ec2/lab/${encodeURIComponent(
                            currentLab.instanceId
                        )}/terminal/start`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type":
                                    "application/json",
                            },
                            body: JSON.stringify(
                                {}
                            ),
                        }
                    );

                const json: TerminalStartResponse =
                    await parseJsonResponse(
                        response
                    );

                console.log(
                    "Terminal start response:",
                    json
                );

                if (
                    !response.ok ||
                    json.success === false
                ) {
                    throw new Error(
                        json.error ||
                        json.message ||
                        "Failed to start the SSM terminal session."
                    );
                }

                const terminalData =
                    json.data ||
                    json.result ||
                    json;

                const accessToken =
                    terminalData.accessToken;

                const websocketPath =
                    terminalData.websocketPath ||
                    `/api/ec2/lab/${currentLab.instanceId}/terminal`;

                const sessionId =
                    terminalData.sessionId;

                if (!accessToken) {
                    throw new Error(
                        "CartForge backend did not return a terminal access token."
                    );
                }

                setTerminalSessionId(
                    sessionId || ""
                );

                const wsUrl =
                    buildWebSocketUrl(
                        websocketPath,
                        accessToken
                    );

                console.log(
                    "Opening CartForge terminal WebSocket."
                );

                const ws =
                    new WebSocket(
                        wsUrl
                    );

                websocketRef.current =
                    ws;

                /*
                 * WebSocket connected.
                 */
                ws.onopen = () => {
                    setTerminalConnecting(
                        false
                    );

                    setTerminalConnected(
                        true
                    );

                    setTerminalError("");

                    terminal.writeln(
                        "\x1b[32mConnected to the real Ubuntu EC2 through AWS SSM.\x1b[0m"
                    );

                    terminal.writeln("");

                    terminal.focus();
                };

                /*
                 * Terminal output.
                 */
                ws.onmessage =
                    async (
                        event
                    ) => {
                        try {
                            if (
                                typeof event.data ===
                                "string"
                            ) {
                                terminal.write(
                                    event.data
                                );

                                return;
                            }

                            if (
                                event.data instanceof
                                Blob
                            ) {
                                const text =
                                    await event.data.text();

                                terminal.write(
                                    text
                                );

                                return;
                            }

                            if (
                                event.data instanceof
                                ArrayBuffer
                            ) {
                                const text =
                                    new TextDecoder().decode(
                                        new Uint8Array(
                                            event.data
                                        )
                                    );

                                terminal.write(
                                    text
                                );
                            }
                        } catch (
                        messageError
                        ) {
                            console.error(
                                "Terminal output error:",
                                messageError
                            );
                        }
                    };

                /*
                 * Keyboard input.
                 */
                const disposable =
                    terminal.onData(
                        (data) => {
                            if (
                                ws.readyState ===
                                WebSocket.OPEN
                            ) {
                                ws.send(
                                    data
                                );
                            }
                        }
                    );

                terminalDataDisposableRef.current =
                    disposable;

                /*
                 * WebSocket error.
                 */
                ws.onerror = () => {
                    setTerminalConnecting(
                        false
                    );

                    setTerminalConnected(
                        false
                    );

                    setTerminalError(
                        "Terminal WebSocket connection failed. Check the CartForge backend and terminal WebSocket route."
                    );

                    terminal.writeln("");

                    terminal.writeln(
                        "\x1b[31mTerminal WebSocket connection error.\x1b[0m"
                    );
                };

                /*
                 * WebSocket closed.
                 */
                ws.onclose = () => {
                    setTerminalConnecting(
                        false
                    );

                    setTerminalConnected(
                        false
                    );

                    terminal.writeln("");

                    terminal.writeln(
                        "\x1b[33mTerminal session disconnected.\x1b[0m"
                    );

                    websocketRef.current =
                        null;
                };

                /*
                 * Resize observer.
                 */
                window.setTimeout(() => {
                    const container =
                        terminalContainerRef.current;

                    if (!container) {
                        return;
                    }

                    const observer =
                        new ResizeObserver(
                            () => {
                                try {
                                    fitAddon.fit();
                                } catch {
                                    // Ignore.
                                }
                            }
                        );

                    observer.observe(
                        container
                    );

                    terminalResizeObserverRef.current =
                        observer;
                }, 100);

                /*
                 * Window resize.
                 */
                const handleResize =
                    () => {
                        try {
                            fitAddon.fit();
                        } catch {
                            // Ignore.
                        }
                    };

                terminalWindowResizeHandlerRef.current =
                    handleResize;

                window.addEventListener(
                    "resize",
                    handleResize
                );
            } catch (err) {
                const message =
                    getErrorMessage(
                        err
                    );

                console.error(
                    "Open terminal error:",
                    err
                );

                setTerminalConnecting(
                    false
                );

                setTerminalConnected(
                    false
                );

                setTerminalError(
                    message
                );

                terminal.writeln("");

                terminal.writeln(
                    `\x1b[31m${message}\x1b[0m`
                );

                cleanupTerminal();
            }
        };

    /* ==========================================================
       COMPONENT CLEANUP
    ========================================================== */

    useEffect(() => {
        return () => {
            cleanupTerminal();
        };
    }, [cleanupTerminal]);

    /* ==========================================================
       COPY
    ========================================================== */

    const copyToClipboard =
        async (
            value: string
        ) => {
            try {
                await navigator.clipboard.writeText(
                    value
                );

                setSuccessMessage(
                    "Copied to clipboard."
                );
            } catch {
                setError(
                    "Unable to copy to clipboard."
                );
            }
        };

    /* ==========================================================
       STATUS
    ========================================================== */

    const isRunning =
        lab?.state?.toLowerCase() ===
        "running";

    const ssmOnline =
        ssmStatus?.online === true;

    const terminalReady =
        Boolean(
            lab?.instanceId &&
            isRunning &&
            ssmOnline &&
            !terminalConnecting
        );

    const stateText =
        lab?.state ||
        "No lab";

    /* ==========================================================
       RENDER
    ========================================================== */

    return (
        <div
            style={{
                minHeight: "100vh",
                background:
                    "linear-gradient(180deg, #09090b 0%, #111113 100%)",
                color: "#f4f4f5",
                padding: "32px",
            }}
        >
            <div
                style={{
                    maxWidth: "1200px",
                    margin: "0 auto",
                }}
            >
                {/* ==================================================
                    HEADER
                ================================================== */}

                <div
                    style={{
                        display: "flex",
                        justifyContent:
                            "space-between",
                        alignItems:
                            "flex-start",
                        gap: "20px",
                        marginBottom:
                            "28px",
                    }}
                >
                    <div>
                        <div
                            style={{
                                display:
                                    "flex",
                                alignItems:
                                    "center",
                                gap: "12px",
                                marginBottom:
                                    "8px",
                            }}
                        >
                            <Cloud
                                size={30}
                            />

                            <h1
                                style={{
                                    margin: 0,
                                    fontSize:
                                        "30px",
                                    fontWeight:
                                        700,
                                }}
                            >
                                AWS Learner Lab
                            </h1>
                        </div>

                        <p
                            style={{
                                margin: 0,
                                color:
                                    "#a1a1aa",
                                fontSize:
                                    "15px",
                                maxWidth:
                                    "720px",
                            }}
                        >
                            Create an isolated Ubuntu
                            EC2 environment and practice
                            real DevOps commands directly
                            inside CartForge.
                        </p>
                    </div>

                    <button
                        onClick={
                            refreshLab
                        }
                        disabled={
                            refreshing ||
                            loading
                        }
                        style={{
                            display:
                                "flex",
                            alignItems:
                                "center",
                            gap: "8px",
                            border:
                                "1px solid #3f3f46",
                            background:
                                "#18181b",
                            color:
                                "#f4f4f5",
                            borderRadius:
                                "8px",
                            padding:
                                "10px 14px",
                            cursor:
                                refreshing ||
                                    loading
                                    ? "not-allowed"
                                    : "pointer",
                            opacity:
                                refreshing ||
                                    loading
                                    ? 0.6
                                    : 1,
                        }}
                    >
                        <RefreshCw
                            size={16}
                            style={{
                                animation:
                                    refreshing
                                        ? "spin 1s linear infinite"
                                        : undefined,
                            }}
                        />

                        Refresh
                    </button>
                </div>

                {/* ==================================================
                    API HEALTH
                ================================================== */}

                <div
                    style={{
                        display: "flex",
                        alignItems:
                            "center",
                        gap: "8px",
                        marginBottom:
                            "20px",
                        padding:
                            "10px 14px",
                        borderRadius:
                            "8px",
                        background:
                            "#18181b",
                        border:
                            "1px solid #27272a",
                        fontSize: "13px",
                    }}
                >
                    {apiHealthy === true ? (
                        <>
                            <CheckCircle2
                                size={16}
                                style={{
                                    color:
                                        "#22c55e",
                                }}
                            />

                            <span>
                                CartForge API
                                connected
                            </span>
                        </>
                    ) : apiHealthy ===
                        false ? (
                        <>
                            <WifiOff
                                size={16}
                                style={{
                                    color:
                                        "#ef4444",
                                }}
                            />

                            <span>
                                CartForge API
                                unavailable
                            </span>
                        </>
                    ) : (
                        <>
                            <Loader2
                                size={16}
                                style={{
                                    animation:
                                        "spin 1s linear infinite",
                                }}
                            />

                            <span>
                                Checking CartForge
                                API...
                            </span>
                        </>
                    )}
                </div>

                {/* ==================================================
                    ERROR
                ================================================== */}

                {error && (
                    <div
                        style={{
                            display:
                                "flex",
                            alignItems:
                                "flex-start",
                            gap: "12px",
                            background:
                                "#2a1111",
                            border:
                                "1px solid #7f1d1d",
                            borderRadius:
                                "10px",
                            padding:
                                "14px 16px",
                            marginBottom:
                                "20px",
                            color:
                                "#fecaca",
                        }}
                    >
                        <AlertTriangle
                            size={19}
                        />

                        <div
                            style={{
                                flex: 1,
                            }}
                        >
                            {error}
                        </div>

                        <button
                            onClick={() =>
                                setError("")
                            }
                            style={{
                                border:
                                    "none",
                                background:
                                    "transparent",
                                color:
                                    "#fecaca",
                                cursor:
                                    "pointer",
                            }}
                        >
                            <X
                                size={17}
                            />
                        </button>
                    </div>
                )}

                {/* ==================================================
                    SUCCESS
                ================================================== */}

                {successMessage && (
                    <div
                        style={{
                            display:
                                "flex",
                            alignItems:
                                "center",
                            gap: "10px",
                            background:
                                "#0d2416",
                            border:
                                "1px solid #166534",
                            borderRadius:
                                "10px",
                            padding:
                                "14px 16px",
                            marginBottom:
                                "20px",
                            color:
                                "#bbf7d0",
                        }}
                    >
                        <CheckCircle2
                            size={18}
                        />

                        <span
                            style={{
                                flex: 1,
                            }}
                        >
                            {
                                successMessage
                            }
                        </span>

                        <button
                            onClick={() =>
                                setSuccessMessage(
                                    ""
                                )
                            }
                            style={{
                                border:
                                    "none",
                                background:
                                    "transparent",
                                color:
                                    "#bbf7d0",
                                cursor:
                                    "pointer",
                            }}
                        >
                            <X
                                size={17}
                            />
                        </button>
                    </div>
                )}

                {/* ==================================================
                    COST WARNING
                ================================================== */}

                <div
                    style={{
                        display:
                            "flex",
                        gap: "14px",
                        alignItems:
                            "flex-start",
                        background:
                            "linear-gradient(90deg, #291c07, #1f1607)",
                        border:
                            "1px solid #854d0e",
                        borderRadius:
                            "12px",
                        padding: "17px",
                        marginBottom:
                            "24px",
                    }}
                >
                    <AlertTriangle
                        size={22}
                        style={{
                            color:
                                "#facc15",
                            flexShrink:
                                0,
                        }}
                    />

                    <div>
                        <div
                            style={{
                                fontWeight:
                                    700,
                                marginBottom:
                                    "5px",
                            }}
                        >
                            AWS cost warning
                        </div>

                        <div
                            style={{
                                color:
                                    "#fde68a",
                                fontSize:
                                    "13px",
                                lineHeight:
                                    1.6,
                            }}
                        >
                            This creates a real AWS EC2
                            learner lab. Use the lowest-cost
                            configuration and terminate the
                            lab after testing.
                        </div>
                    </div>
                </div>

                {/* ==================================================
                    CREATE LAB
                ================================================== */}

                {!lab ? (
                    <div
                        style={{
                            background:
                                "#18181b",
                            border:
                                "1px solid #27272a",
                            borderRadius:
                                "14px",
                            padding:
                                "24px",
                            marginBottom:
                                "24px",
                        }}
                    >
                        <div
                            style={{
                                display:
                                    "flex",
                                alignItems:
                                    "center",
                                gap: "10px",
                                marginBottom:
                                    "20px",
                            }}
                        >
                            <Server
                                size={21}
                            />

                            <h2
                                style={{
                                    margin: 0,
                                    fontSize:
                                        "20px",
                                }}
                            >
                                Create Learner Lab
                            </h2>
                        </div>

                        {/* LAB NAME */}

                        <div
                            style={{
                                marginBottom:
                                    "20px",
                            }}
                        >
                            <label
                                style={{
                                    display:
                                        "block",
                                    fontSize:
                                        "13px",
                                    color:
                                        "#d4d4d8",
                                    marginBottom:
                                        "8px",
                                }}
                            >
                                Lab name / Learner ID
                            </label>

                            <input
                                value={
                                    learnerId
                                }
                                onChange={(
                                    event
                                ) =>
                                    setLearnerId(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                placeholder="e.g. sakshi-devops-lab"
                                disabled={
                                    creating
                                }
                                style={{
                                    width:
                                        "100%",
                                    boxSizing:
                                        "border-box",
                                    background:
                                        "#09090b",
                                    color:
                                        "#f4f4f5",
                                    border:
                                        "1px solid #3f3f46",
                                    borderRadius:
                                        "8px",
                                    padding:
                                        "12px 14px",
                                    outline:
                                        "none",
                                }}
                            />
                        </div>

                        {/* INSTANCE TYPE */}

                        <div
                            style={{
                                marginBottom:
                                    "20px",
                            }}
                        >
                            <label
                                style={{
                                    display:
                                        "block",
                                    fontSize:
                                        "13px",
                                    color:
                                        "#d4d4d8",
                                    marginBottom:
                                        "8px",
                                }}
                            >
                                Instance type
                            </label>

                            <div
                                style={{
                                    border:
                                        "1px solid #3f3f46",
                                    background:
                                        "#09090b",
                                    borderRadius:
                                        "10px",
                                    padding:
                                        "15px",
                                    display:
                                        "flex",
                                    alignItems:
                                        "center",
                                    gap: "12px",
                                }}
                            >
                                <Cpu
                                    size={19}
                                />

                                <div>
                                    <div
                                        style={{
                                            fontWeight:
                                                600,
                                        }}
                                    >
                                        {
                                            INSTANCE_TYPE
                                        }
                                    </div>

                                    <div
                                        style={{
                                            color:
                                                "#a1a1aa",
                                            fontSize:
                                                "12px",
                                            marginTop:
                                                "3px",
                                        }}
                                    >
                                        Lowest-cost
                                        allowed
                                        learner lab
                                        configuration
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* STORAGE */}

                        <div
                            style={{
                                marginBottom:
                                    "20px",
                            }}
                        >
                            <label
                                style={{
                                    display:
                                        "block",
                                    fontSize:
                                        "13px",
                                    color:
                                        "#d4d4d8",
                                    marginBottom:
                                        "8px",
                                }}
                            >
                                Root storage
                            </label>

                            <div
                                style={{
                                    display:
                                        "grid",
                                    gridTemplateColumns:
                                        "repeat(4, 1fr)",
                                    gap: "10px",
                                }}
                            >
                                {STORAGE_OPTIONS.map(
                                    (size) => {
                                        const selected =
                                            storage ===
                                            size;

                                        return (
                                            <button
                                                key={
                                                    size
                                                }
                                                onClick={() =>
                                                    setStorage(
                                                        size
                                                    )
                                                }
                                                disabled={
                                                    creating
                                                }
                                                style={{
                                                    padding:
                                                        "12px 10px",
                                                    borderRadius:
                                                        "8px",
                                                    border:
                                                        selected
                                                            ? "1px solid #a1a1aa"
                                                            : "1px solid #3f3f46",
                                                    background:
                                                        selected
                                                            ? "#27272a"
                                                            : "#09090b",
                                                    color:
                                                        "#f4f4f5",
                                                    cursor:
                                                        creating
                                                            ? "not-allowed"
                                                            : "pointer",
                                                }}
                                            >
                                                {
                                                    size
                                                }{" "}
                                                GB
                                            </button>
                                        );
                                    }
                                )}
                            </div>
                        </div>

                        {/* NETWORKING */}

                        <div
                            style={{
                                marginBottom:
                                    "24px",
                            }}
                        >
                            <div
                                style={{
                                    display:
                                        "flex",
                                    alignItems:
                                        "center",
                                    gap: "8px",
                                    marginBottom:
                                        "12px",
                                }}
                            >
                                <Network
                                    size={18}
                                />

                                <span
                                    style={{
                                        fontWeight:
                                            600,
                                    }}
                                >
                                    Networking preferences
                                </span>
                            </div>

                            <div
                                style={{
                                    display:
                                        "grid",
                                    gridTemplateColumns:
                                        "repeat(3, 1fr)",
                                    gap: "10px",
                                }}
                            >
                                {[
                                    {
                                        key:
                                            "publicIp",
                                        label:
                                            "Public IP",
                                    },
                                    {
                                        key:
                                            "ssh",
                                        label:
                                            "SSH",
                                    },
                                    {
                                        key:
                                            "https",
                                        label:
                                            "HTTPS",
                                    },
                                ].map(
                                    (item) => {
                                        const key =
                                            item.key as keyof NetworkingOptions;

                                        return (
                                            <label
                                                key={
                                                    item.key
                                                }
                                                style={{
                                                    display:
                                                        "flex",
                                                    alignItems:
                                                        "center",
                                                    gap: "9px",
                                                    padding:
                                                        "11px 12px",
                                                    border:
                                                        "1px solid #3f3f46",
                                                    background:
                                                        "#09090b",
                                                    borderRadius:
                                                        "8px",
                                                    cursor:
                                                        "pointer",
                                                    fontSize:
                                                        "13px",
                                                }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        networking[
                                                        key
                                                        ]
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        setNetworking(
                                                            (
                                                                current
                                                            ) => ({
                                                                ...current,
                                                                [key]:
                                                                    event
                                                                        .target
                                                                        .checked,
                                                            })
                                                        )
                                                    }
                                                    disabled={
                                                        creating
                                                    }
                                                />

                                                {
                                                    item.label
                                                }
                                            </label>
                                        );
                                    }
                                )}
                            </div>
                        </div>

                        {/* CREATE BUTTON */}

                        <button
                            onClick={
                                createLab
                            }
                            disabled={
                                creating ||
                                !learnerId.trim()
                            }
                            style={{
                                width:
                                    "100%",
                                display:
                                    "flex",
                                alignItems:
                                    "center",
                                justifyContent:
                                    "center",
                                gap: "9px",
                                padding:
                                    "14px",
                                borderRadius:
                                    "9px",
                                border:
                                    "none",
                                background:
                                    "#f4f4f5",
                                color:
                                    "#09090b",
                                fontWeight:
                                    700,
                                cursor:
                                    creating ||
                                        !learnerId.trim()
                                        ? "not-allowed"
                                        : "pointer",
                                opacity:
                                    creating ||
                                        !learnerId.trim()
                                        ? 0.65
                                        : 1,
                            }}
                        >
                            {creating ? (
                                <>
                                    <Loader2
                                        size={
                                            18
                                        }
                                        style={{
                                            animation:
                                                "spin 1s linear infinite",
                                        }}
                                    />

                                    Creating AWS learner
                                    lab...
                                </>
                            ) : (
                                <>
                                    <Play
                                        size={
                                            18
                                        }
                                    />

                                    Create Learner Lab
                                </>
                            )}
                        </button>
                    </div>
                ) : (
                    <>
                        {/* ==================================================
                            CURRENT LAB
                        ================================================== */}

                        <div
                            style={{
                                background:
                                    "#18181b",
                                border:
                                    "1px solid #27272a",
                                borderRadius:
                                    "14px",
                                padding:
                                    "24px",
                                marginBottom:
                                    "24px",
                            }}
                        >
                            <div
                                style={{
                                    display:
                                        "flex",
                                    justifyContent:
                                        "space-between",
                                    alignItems:
                                        "flex-start",
                                    gap: "16px",
                                    marginBottom:
                                        "22px",
                                }}
                            >
                                <div>
                                    <div
                                        style={{
                                            display:
                                                "flex",
                                            alignItems:
                                                "center",
                                            gap: "10px",
                                            marginBottom:
                                                "6px",
                                        }}
                                    >
                                        <Server
                                            size={
                                                22
                                            }
                                        />

                                        <h2
                                            style={{
                                                margin:
                                                    0,
                                                fontSize:
                                                    "20px",
                                            }}
                                        >
                                            Current Learner
                                            Lab
                                        </h2>
                                    </div>

                                    <div
                                        style={{
                                            color:
                                                "#a1a1aa",
                                            fontSize:
                                                "13px",
                                        }}
                                    >
                                        {lab.labName ||
                                            lab.tags
                                                ?.Name ||
                                            "CartForge Learner Lab"}
                                    </div>
                                </div>

                                <div
                                    style={{
                                        display:
                                            "flex",
                                        alignItems:
                                            "center",
                                        gap: "7px",
                                        padding:
                                            "7px 11px",
                                        borderRadius:
                                            "999px",
                                        background:
                                            isRunning
                                                ? "#0d2416"
                                                : "#27272a",
                                        border:
                                            isRunning
                                                ? "1px solid #166534"
                                                : "1px solid #3f3f46",
                                        color:
                                            isRunning
                                                ? "#86efac"
                                                : "#d4d4d8",
                                        fontSize:
                                            "12px",
                                        fontWeight:
                                            600,
                                    }}
                                >
                                    <span
                                        style={{
                                            width:
                                                "7px",
                                            height:
                                                "7px",
                                            borderRadius:
                                                "50%",
                                            background:
                                                isRunning
                                                    ? "#22c55e"
                                                    : "#71717a",
                                        }}
                                    />

                                    {
                                        stateText
                                    }
                                </div>
                            </div>

                            {/* DETAILS */}

                            <div
                                style={{
                                    display:
                                        "grid",
                                    gridTemplateColumns:
                                        "repeat(3, 1fr)",
                                    gap: "12px",
                                    marginBottom:
                                        "22px",
                                }}
                            >
                                {[
                                    {
                                        icon:
                                            Server,
                                        label:
                                            "Instance ID",
                                        value:
                                            lab.instanceId,
                                    },
                                    {
                                        icon:
                                            Cpu,
                                        label:
                                            "Instance Type",
                                        value:
                                            lab.instanceType ||
                                            INSTANCE_TYPE,
                                    },
                                    {
                                        icon:
                                            HardDrive,
                                        label:
                                            "Storage",
                                        value:
                                            `${lab.storageSize || storage} GB`,
                                    },
                                    {
                                        icon:
                                            Network,
                                        label:
                                            "Private IP",
                                        value:
                                            lab.privateIpAddress ||
                                            "—",
                                    },
                                    {
                                        icon:
                                            Wifi,
                                        label:
                                            "Public IP",
                                        value:
                                            lab.publicIpAddress ||
                                            "—",
                                    },
                                    {
                                        icon:
                                            Monitor,
                                        label:
                                            "Region",
                                        value:
                                            lab.region ||
                                            DEFAULT_REGION,
                                    },
                                ].map(
                                    ({
                                        icon: Icon,
                                        label,
                                        value,
                                    }) => (
                                        <div
                                            key={
                                                label
                                            }
                                            style={{
                                                background:
                                                    "#09090b",
                                                border:
                                                    "1px solid #27272a",
                                                borderRadius:
                                                    "9px",
                                                padding:
                                                    "13px",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display:
                                                        "flex",
                                                    alignItems:
                                                        "center",
                                                    gap: "7px",
                                                    color:
                                                        "#a1a1aa",
                                                    fontSize:
                                                        "11px",
                                                    marginBottom:
                                                        "7px",
                                                }}
                                            >
                                                <Icon
                                                    size={
                                                        14
                                                    }
                                                />

                                                {
                                                    label
                                                }
                                            </div>

                                            <div
                                                style={{
                                                    display:
                                                        "flex",
                                                    alignItems:
                                                        "center",
                                                    gap: "7px",
                                                    fontSize:
                                                        "13px",
                                                    fontWeight:
                                                        600,
                                                    wordBreak:
                                                        "break-all",
                                                }}
                                            >
                                                <span>
                                                    {
                                                        value
                                                    }
                                                </span>

                                                {label ===
                                                    "Instance ID" && (
                                                        <button
                                                            onClick={() =>
                                                                copyToClipboard(
                                                                    String(
                                                                        value
                                                                    )
                                                                )
                                                            }
                                                            title="Copy"
                                                            style={{
                                                                border:
                                                                    "none",
                                                                background:
                                                                    "transparent",
                                                                color:
                                                                    "#a1a1aa",
                                                                cursor:
                                                                    "pointer",
                                                            }}
                                                        >
                                                            <Copy
                                                                size={
                                                                    13
                                                                }
                                                            />
                                                        </button>
                                                    )}
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>

                            {/* SSM STATUS */}

                            <div
                                style={{
                                    display:
                                        "flex",
                                    alignItems:
                                        "center",
                                    justifyContent:
                                        "space-between",
                                    gap: "14px",
                                    padding:
                                        "13px 15px",
                                    background:
                                        "#09090b",
                                    border:
                                        "1px solid #27272a",
                                    borderRadius:
                                        "9px",
                                    marginBottom:
                                        "20px",
                                }}
                            >
                                <div
                                    style={{
                                        display:
                                            "flex",
                                        alignItems:
                                            "center",
                                        gap: "10px",
                                    }}
                                >
                                    {ssmOnline ? (
                                        <CheckCircle2
                                            size={
                                                19
                                            }
                                            style={{
                                                color:
                                                    "#22c55e",
                                            }}
                                        />
                                    ) : (
                                        <WifiOff
                                            size={
                                                19
                                            }
                                            style={{
                                                color:
                                                    "#f59e0b",
                                            }}
                                        />
                                    )}

                                    <div>
                                        <div
                                            style={{
                                                fontWeight:
                                                    600,
                                                fontSize:
                                                    "13px",
                                            }}
                                        >
                                            AWS SSM
                                        </div>

                                        <div
                                            style={{
                                                color:
                                                    "#a1a1aa",
                                                fontSize:
                                                    "12px",
                                                marginTop:
                                                    "2px",
                                            }}
                                        >
                                            {ssmOnline
                                                ? `Online • ${ssmStatus?.platformName ||
                                                "Ubuntu"
                                                } • Agent ${ssmStatus?.agentVersion ||
                                                "ready"
                                                }`
                                                : ssmStatus?.error
                                                    ? ssmStatus.error
                                                    : "Waiting for SSM Agent to come online"}
                                        </div>
                                    </div>
                                </div>

                                <span
                                    style={{
                                        color:
                                            ssmOnline
                                                ? "#86efac"
                                                : "#fcd34d",
                                        fontSize:
                                            "12px",
                                        fontWeight:
                                            600,
                                    }}
                                >
                                    {ssmStatus?.pingStatus ||
                                        "Checking"}
                                </span>
                            </div>

                            {/* TERMINAL STATUS */}

                            <div
                                style={{
                                    marginBottom:
                                        "18px",
                                    padding:
                                        "10px 13px",
                                    borderRadius:
                                        "8px",
                                    background:
                                        terminalReady
                                            ? "#0d2416"
                                            : "#18181b",
                                    border:
                                        terminalReady
                                            ? "1px solid #166534"
                                            : "1px solid #27272a",
                                    color:
                                        terminalReady
                                            ? "#86efac"
                                            : "#a1a1aa",
                                    fontSize:
                                        "12px",
                                }}
                            >
                                {terminalReady
                                    ? "✓ Real terminal is ready. You can connect to this dedicated Ubuntu EC2 instance."
                                    : "Terminal becomes available when EC2 is Running and AWS SSM is Online."}
                            </div>

                            {/* ACTIONS */}

                            <div
                                style={{
                                    display:
                                        "flex",
                                    gap: "10px",
                                    flexWrap:
                                        "wrap",
                                }}
                            >
                                <button
                                    onClick={
                                        openTerminal
                                    }
                                    disabled={
                                        !terminalReady
                                    }
                                    style={{
                                        display:
                                            "flex",
                                        alignItems:
                                            "center",
                                        justifyContent:
                                            "center",
                                        gap: "8px",
                                        padding:
                                            "12px 17px",
                                        borderRadius:
                                            "8px",
                                        border:
                                            terminalReady
                                                ? "1px solid #71717a"
                                                : "1px solid #3f3f46",
                                        background:
                                            terminalReady
                                                ? "#27272a"
                                                : "#18181b",
                                        color:
                                            "#f4f4f5",
                                        fontWeight:
                                            600,
                                        cursor:
                                            terminalReady
                                                ? "pointer"
                                                : "not-allowed",
                                        opacity:
                                            terminalReady
                                                ? 1
                                                : 0.55,
                                    }}
                                >
                                    {terminalConnecting ? (
                                        <Loader2
                                            size={
                                                17
                                            }
                                            style={{
                                                animation:
                                                    "spin 1s linear infinite",
                                            }}
                                        />
                                    ) : (
                                        <SquareTerminal
                                            size={
                                                17
                                            }
                                        />
                                    )}

                                    {terminalConnected
                                        ? "Terminal Connected"
                                        : terminalConnecting
                                            ? "Connecting..."
                                            : "Open Real Terminal"}
                                </button>

                                <button
                                    onClick={
                                        destroyLab
                                    }
                                    disabled={
                                        destroying
                                    }
                                    style={{
                                        display:
                                            "flex",
                                        alignItems:
                                            "center",
                                        justifyContent:
                                            "center",
                                        gap: "8px",
                                        padding:
                                            "12px 17px",
                                        borderRadius:
                                            "8px",
                                        border:
                                            "1px solid #7f1d1d",
                                        background:
                                            "#2a1111",
                                        color:
                                            "#fca5a5",
                                        fontWeight:
                                            600,
                                        cursor:
                                            destroying
                                                ? "not-allowed"
                                                : "pointer",
                                        opacity:
                                            destroying
                                                ? 0.6
                                                : 1,
                                    }}
                                >
                                    {destroying ? (
                                        <Loader2
                                            size={
                                                17
                                            }
                                            style={{
                                                animation:
                                                    "spin 1s linear infinite",
                                            }}
                                        />
                                    ) : (
                                        <Trash2
                                            size={
                                                17
                                            }
                                        />
                                    )}

                                    {destroying
                                        ? "Terminating..."
                                        : "Terminate Lab"}
                                </button>
                            </div>
                        </div>

                        {/* ==================================================
                            REAL TERMINAL
                        ================================================== */}

                        {terminalOpen && (
                            <div
                                style={{
                                    background:
                                        "#09090b",
                                    border:
                                        "1px solid #3f3f46",
                                    borderRadius:
                                        "14px",
                                    overflow:
                                        "hidden",
                                    marginBottom:
                                        "24px",
                                    boxShadow:
                                        "0 20px 50px rgba(0,0,0,0.35)",
                                }}
                            >
                                <div
                                    style={{
                                        display:
                                            "flex",
                                        alignItems:
                                            "center",
                                        justifyContent:
                                            "space-between",
                                        gap: "12px",
                                        padding:
                                            "12px 15px",
                                        background:
                                            "#18181b",
                                        borderBottom:
                                            "1px solid #27272a",
                                    }}
                                >
                                    <div
                                        style={{
                                            display:
                                                "flex",
                                            alignItems:
                                                "center",
                                            gap: "10px",
                                        }}
                                    >
                                        <TerminalIcon
                                            size={
                                                18
                                            }
                                        />

                                        <div>
                                            <div
                                                style={{
                                                    fontWeight:
                                                        700,
                                                    fontSize:
                                                        "13px",
                                                }}
                                            >
                                                CartForge Ubuntu
                                                Terminal
                                            </div>

                                            <div
                                                style={{
                                                    display:
                                                        "flex",
                                                    alignItems:
                                                        "center",
                                                    gap: "6px",
                                                    color:
                                                        "#a1a1aa",
                                                    fontSize:
                                                        "11px",
                                                    marginTop:
                                                        "3px",
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        width:
                                                            "7px",
                                                        height:
                                                            "7px",
                                                        borderRadius:
                                                            "50%",
                                                        background:
                                                            terminalConnected
                                                                ? "#22c55e"
                                                                : terminalConnecting
                                                                    ? "#f59e0b"
                                                                    : "#71717a",
                                                    }}
                                                />

                                                {terminalConnected
                                                    ? `Connected • Real EC2 • AWS SSM${terminalSessionId
                                                        ? ` • ${terminalSessionId}`
                                                        : ""
                                                    }`
                                                    : terminalConnecting
                                                        ? "Connecting to AWS SSM..."
                                                        : "Disconnected"}
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={
                                            disconnectTerminal
                                        }
                                        style={{
                                            display:
                                                "flex",
                                            alignItems:
                                                "center",
                                            gap: "6px",
                                            padding:
                                                "7px 10px",
                                            borderRadius:
                                                "7px",
                                            border:
                                                "1px solid #3f3f46",
                                            background:
                                                "#27272a",
                                            color:
                                                "#f4f4f5",
                                            cursor:
                                                "pointer",
                                            fontSize:
                                                "12px",
                                        }}
                                    >
                                        <X
                                            size={
                                                14
                                            }
                                        />

                                        Close
                                    </button>
                                </div>

                                {terminalError && (
                                    <div
                                        style={{
                                            padding:
                                                "10px 14px",
                                            background:
                                                "#2a1111",
                                            borderBottom:
                                                "1px solid #7f1d1d",
                                            color:
                                                "#fecaca",
                                            fontSize:
                                                "12px",
                                        }}
                                    >
                                        {
                                            terminalError
                                        }
                                    </div>
                                )}

                                <div
                                    ref={
                                        terminalContainerRef
                                    }
                                    style={{
                                        width:
                                            "100%",
                                        height:
                                            "500px",
                                        padding:
                                            "12px",
                                        boxSizing:
                                            "border-box",
                                        background:
                                            "#09090b",
                                    }}
                                />
                            </div>
                        )}
                    </>
                )}

                {/* ==================================================
                    WHAT YOU CAN PRACTICE
                ================================================== */}

                <div
                    style={{
                        background:
                            "#18181b",
                        border:
                            "1px solid #27272a",
                        borderRadius:
                            "14px",
                        padding:
                            "24px",
                        marginBottom:
                            "24px",
                    }}
                >
                    <div
                        style={{
                            display:
                                "flex",
                            alignItems:
                                "center",
                            gap: "10px",
                            marginBottom:
                                "18px",
                        }}
                    >
                        <Zap
                            size={20}
                        />

                        <h2
                            style={{
                                margin: 0,
                                fontSize:
                                    "19px",
                            }}
                        >
                            What you can practice
                        </h2>
                    </div>

                    <div
                        style={{
                            display:
                                "grid",
                            gridTemplateColumns:
                                "repeat(3, 1fr)",
                            gap: "12px",
                        }}
                    >
                        {[
                            {
                                title:
                                    "Linux",
                                text:
                                    "Files, permissions, processes, users, networking and shell commands.",
                            },
                            {
                                title:
                                    "Git",
                                text:
                                    "Clone repositories, branches, commits, merges and Git workflows.",
                            },
                            {
                                title:
                                    "Docker",
                                text:
                                    "Build images, run containers, inspect logs and manage Docker resources.",
                            },
                            {
                                title:
                                    "Kubernetes",
                                text:
                                    "kubectl commands, pods, deployments, services and troubleshooting.",
                            },
                            {
                                title:
                                    "Terraform",
                                text:
                                    "Providers, resources, state, plan, apply, import and drift.",
                            },
                            {
                                title:
                                    "Ansible",
                                text:
                                    "Inventory, modules, playbooks, variables and automation.",
                            },
                        ].map(
                            (item) => (
                                <div
                                    key={
                                        item.title
                                    }
                                    style={{
                                        background:
                                            "#09090b",
                                        border:
                                            "1px solid #27272a",
                                        borderRadius:
                                            "10px",
                                        padding:
                                            "15px",
                                    }}
                                >
                                    <div
                                        style={{
                                            fontWeight:
                                                700,
                                            marginBottom:
                                                "7px",
                                        }}
                                    >
                                        {
                                            item.title
                                        }
                                    </div>

                                    <div
                                        style={{
                                            color:
                                                "#a1a1aa",
                                            fontSize:
                                                "12px",
                                            lineHeight:
                                                1.6,
                                        }}
                                    >
                                        {
                                            item.text
                                        }
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                </div>

                {/* ==================================================
                    ARCHITECTURE
                ================================================== */}

                <div
                    style={{
                        background:
                            "#18181b",
                        border:
                            "1px solid #27272a",
                        borderRadius:
                            "14px",
                        padding:
                            "24px",
                        marginBottom:
                            "24px",
                    }}
                >
                    <div
                        style={{
                            display:
                                "flex",
                            alignItems:
                                "center",
                            gap: "10px",
                            marginBottom:
                                "18px",
                        }}
                    >
                        <Activity
                            size={20}
                        />

                        <h2
                            style={{
                                margin: 0,
                                fontSize:
                                    "19px",
                            }}
                        >
                            CartForge Lab Architecture
                        </h2>
                    </div>

                    <div
                        style={{
                            display:
                                "flex",
                            alignItems:
                                "center",
                            justifyContent:
                                "center",
                            flexWrap:
                                "wrap",
                            gap: "10px",
                            padding:
                                "20px 10px",
                        }}
                    >
                        {[
                            "CartForge",
                            "Node / Express",
                            "Dedicated AWS EC2",
                            "AWS SSM",
                            "Real Ubuntu Shell",
                        ].map(
                            (
                                item,
                                index
                            ) => (
                                <React.Fragment
                                    key={
                                        item
                                    }
                                >
                                    <div
                                        style={{
                                            padding:
                                                "12px 17px",
                                            border:
                                                "1px solid #3f3f46",
                                            background:
                                                "#09090b",
                                            borderRadius:
                                                "9px",
                                            fontSize:
                                                "13px",
                                            fontWeight:
                                                600,
                                        }}
                                    >
                                        {
                                            item
                                        }
                                    </div>

                                    {index <
                                        4 && (
                                            <span
                                                style={{
                                                    color:
                                                        "#71717a",
                                                    fontSize:
                                                        "18px",
                                                }}
                                            >
                                                →
                                            </span>
                                        )}
                                </React.Fragment>
                            )
                        )}
                    </div>

                    <div
                        style={{
                            display:
                                "flex",
                            alignItems:
                                "flex-start",
                            gap: "9px",
                            padding:
                                "12px 14px",
                            background:
                                "#09090b",
                            border:
                                "1px solid #27272a",
                            borderRadius:
                                "9px",
                            color:
                                "#a1a1aa",
                            fontSize:
                                "12px",
                            lineHeight:
                                1.6,
                        }}
                    >
                        <Info
                            size={16}
                            style={{
                                flexShrink:
                                    0,
                                marginTop:
                                    "2px",
                            }}
                        />

                        <span>
                            The browser terminal connects
                            only to the dedicated CartForge
                            learner EC2 created for this lab
                            through AWS Systems Manager Session
                            Manager. It does not connect to the
                            old classroom EC2 instance.
                        </span>
                    </div>
                </div>

                {/* ==================================================
                    HELP
                ================================================== */}

                {!lab && (
                    <div
                        style={{
                            display:
                                "flex",
                            gap: "10px",
                            alignItems:
                                "flex-start",
                            padding:
                                "15px 17px",
                            background:
                                "#18181b",
                            border:
                                "1px solid #27272a",
                            borderRadius:
                                "10px",
                            color:
                                "#a1a1aa",
                            fontSize:
                                "12px",
                            lineHeight:
                                1.6,
                        }}
                    >
                        <KeyRound
                            size={17}
                        />

                        <span>
                            After the learner EC2 becomes
                            Running and AWS SSM becomes Online,
                            click{" "}
                            <strong>
                                Open Real Terminal
                            </strong>{" "}
                            to access the real Ubuntu shell.
                        </span>
                    </div>
                )}
            </div>

            {/* ====================================================
                GLOBAL CSS
            ==================================================== */}

            <style>
                {`
                    @keyframes spin {
                        from {
                            transform: rotate(0deg);
                        }

                        to {
                            transform: rotate(360deg);
                        }
                    }

                    .xterm {
                        height: 100%;
                    }

                    .xterm-viewport {
                        background: #09090b !important;
                    }

                    .xterm-screen {
                        background: #09090b;
                    }

                    button:focus-visible,
                    input:focus-visible {
                        outline: 2px solid #71717a;
                        outline-offset: 2px;
                    }
                `}
            </style>
        </div>
    );
}
