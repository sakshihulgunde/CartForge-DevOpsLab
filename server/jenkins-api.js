'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const crypto = require('crypto');
const { spawn } = require('child_process');
const { WebSocketServer, WebSocket } = require('ws');

// ============================================================
// CONFIGURATION
// ============================================================

const PORT = Number(process.env.PORT || 5000);

const AWS_REGION =
  process.env.AWS_REGION ||
  process.env.AWS_DEFAULT_REGION ||
  'ap-south-1';

const LAB_IMAGE =
  process.env.CARTFORGE_LAB_IMAGE ||
  process.env.LAB_IMAGE ||
  'cartforge-learner:latest';

const SSM_PLUGIN_PATH =
  process.env.SESSION_MANAGER_PLUGIN ||
  process.env.SSM_PLUGIN_PATH ||
  'session-manager-plugin.exe';

// ============================================================
// DOCKER SERVICE
// ============================================================

const {
  // Docker engine
  getDockerInfo,

  // Learner lab network
  ensureLearnerLabNetwork,

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

} = require("./services/docker.service");

// ============================================================
// KUBERNETES SERVICE
// ============================================================

const {
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
} = require("./services/kubernetes.service");
// ============================================================
// SIMULATED AWS LEARNER LAB SERVICE
// ============================================================

const {
  getLearnerLabConfig,
  createLearnerLab,
  getLearnerLab,
  destroyLearnerLab,
  tagLearnerLab,
  getLearnerLabSSMStatus,
  executeLearnerLabCommand,
  startLearnerLabTerminalSession,
  terminateLearnerLabTerminalSession
} = require("./services/simulated-aws.service");

// ============================================================
// EXPRESS APP
// ============================================================

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true
  })
);

app.use(
  express.json({
    limit: '2mb'
  })
);

app.use(
  express.urlencoded({
    extended: true
  })
);
// ============================================================
// AI YAML / DOCKERFILE ASSISTANT - LOCAL OLLAMA
// ============================================================

app.post('/api/ai/yaml/generate', async (req, res) => {
  try {
    const rawType = String(
      req.body?.type || 'Docker Compose'
    ).trim();

    const typeMap = {
      "docker-compose": "Docker Compose",
      "dockerfile": "Dockerfile",
      "kubernetes": "Kubernetes",
      "ansible": "Ansible",
      "terraform": "Terraform",
      "generic-yaml": "Generic YAML"
    };

    const type = typeMap[rawType] || rawType;

    const prompt = String(
      req.body?.prompt || ''
    ).trim();

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: "Please enter a prompt."
      });
    }

    console.log(
      `[AI] Generating ${type} using Ollama...`
    );

    const systemPrompt = `
You are CartForge AI, a DevOps configuration generator.

Generate a ${type} configuration based on the user's request.

IMPORTANT RULES:

1. Follow the user's requirements exactly.
2. Never replace user-provided values with examples.
3. Never use sample-app, nginx, test-app, myapp,
   or other example values unless explicitly requested.
4. Never change user-provided:
   - names
   - images
   - image tags
   - ports
   - replicas
   - versions
   - paths
   - regions
   - instance types
   - resource types
   - commands
5. If the user specifies a value, use that exact value.
6. Generate valid ${type} syntax.
7. Return ONLY the configuration.
8. Do not provide explanations.
9. Do not use Markdown code fences.
10. Do not say "Here is your configuration".
11. For Kubernetes, generate valid Kubernetes YAML.
12. For Dockerfile, generate valid Dockerfile syntax.
13. For Docker Compose, generate valid Docker Compose YAML.
14. For Terraform, generate valid Terraform HCL.
15. For Ansible:
    - Generate a complete valid Ansible playbook.
    - Use tasks: under the play.
    - Never put an Ansible module configuration inside vars: unless the user explicitly asks for a variable.
    - When the user requests amazon.aws.ec2_instance, actually use:
      amazon.aws.ec2_instance:
    - Preserve the exact values provided by the user.
    - Do not invent key names, subnet IDs, security group IDs,
      AMI IDs, instance IDs, passwords, credentials, or other values.
    - Never create fake values such as:
      ami-XXXXXXXX
      ami-0c55b159999999999
      subnet-XXXXXXXX
      sg-XXXXXXXX
    - If the user explicitly requests an AMI but does not provide
      its exact ID, use a clearly documented variable only if
      the user allows variables. Otherwise do not invent an AMI ID.
    - For EBS volumes, use valid amazon.aws.ec2_instance syntax:
      volumes:
        - device_name: /dev/sda1
          ebs:
            volume_size: 10
            volume_type: gp3
            delete_on_termination: true
    - If the user asks to register the EC2 result, use:
      register: ec2_instance
    - If the user asks to display instance information, use
      debug tasks inside the same play.
    - Do not create a second play just for debug tasks.
    - A debug task must not contain duplicate var keys.
    - Prefer msg expressions when displaying multiple values.
    - Return one complete executable Ansible playbook.

16. For multiple Kubernetes resources, separate them with ---
17. Never include AWS access keys or secret keys.
18. Keep the configuration practical and usable.

The output will be displayed directly in the
CartForge AI editor.
`;

    const ollamaResponse = await fetch(
      'http://localhost:11434/api/chat',
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          model: 'qwen2.5-coder:1.5b',

          stream: false,

          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: prompt
            }
          ],

          options: {
            temperature: 0.1
          }
        })
      }
    );

    if (!ollamaResponse.ok) {
      const errorText =
        await ollamaResponse.text();

      console.error(
        '[AI] Ollama error:',
        errorText
      );

      return res.status(500).json({
        success: false,
        error:
          'Ollama is not responding. Make sure Ollama is running.'
      });
    }

    const data =
      await ollamaResponse.json();

    let generatedContent =
      String(
        data?.message?.content || ''
      ).trim();

    if (!generatedContent) {
      return res.status(500).json({
        success: false,
        error:
          'Ollama returned an empty response.'
      });
    }

    generatedContent =
      generatedContent
        .replace(
          /^```(?:yaml|yml|dockerfile|terraform|hcl)?\s*/i,
          ''
        )
        .replace(
          /\s*```$/i,
          ''
        )
        .trim();

    console.log(
      `[AI] ${type} generated successfully.`
    );

    return res.json({
      success: true,
      type: type,
      yaml: generatedContent,
      explanation:
        `Generated ${type} using local Ollama AI.`
    });

  } catch (error) {

    console.error(
      '[AI] Generation error:',
      error
    );

    return res.status(500).json({
      success: false,
      error:
        error?.message ||
        'Failed to generate configuration.'
    });
  }
});

// ============================================================
// TERMINAL SESSION STORAGE
// ============================================================

const dockerTerminalSessions = new Map();
const awsTerminalSessions = new Map();
// ============================================================
// BASIC ROUTE
// ============================================================

app.get('/', (req, res) => {
  res.json({
    success: true,
    service: 'CartForge Backend',
    message: 'CartForge API is running.',
    port: PORT,
    learnerLabs: 'Simulated AWS Labs',
    awsLearnerLabs: false,
    dockerLabs: true,
    region: AWS_REGION
  });
});

// ============================================================
// HEALTH
// ============================================================

async function buildHealthResponse() {
  let dockerInfo = null;

  try {
    dockerInfo = await getDockerInfo();
  } catch (error) {
    console.warn(
      'Docker health check unavailable:',
      error.message
    );
  }

  return {
    success: true,
    status: 'ok',
    service: 'CartForge Backend',
    learnerLabs: 'simulated-aws',
    awsLearnerLabs: false,
    dockerLabs: true,
    region: AWS_REGION,

    docker: dockerInfo
      ? {
        serverVersion: dockerInfo.ServerVersion,
        containers: dockerInfo.Containers,
        runningContainers: dockerInfo.ContainersRunning,
        images: dockerInfo.Images
      }
      : null,

    timestamp: new Date().toISOString()
  };
}

app.get('/health', async (req, res) => {
  res.json(await buildHealthResponse());
});

app.get('/api/health', async (req, res) => {
  res.json(await buildHealthResponse());
});

// ============================================================
// DOCKER INFO
// ============================================================

app.get('/api/docker/info', async (req, res) => {
  try {
    const result = await getDockerInfo();

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================
// DOCKER CONTAINERS
// ============================================================

app.get('/api/docker/containers', async (req, res) => {
  try {
    const all = req.query.all !== 'false';

    const result = await getContainers(all);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get(
  '/api/docker/containers/:containerId',
  async (req, res) => {
    try {
      const result = await getContainer(
        req.params.containerId
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        error: error.message
      });
    }
  }
);

app.post('/api/docker/containers', async (req, res) => {
  try {
    const result = await createContainer(req.body);

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get(
  '/api/docker/containers/:containerId/logs',
  async (req, res) => {
    try {
      const result = await getContainerLogs(
        req.params.containerId
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

// ============================================================
// DOCKER MONITORING
// ============================================================

app.get('/api/docker/monitoring', async (req, res) => {
  try {
    const result = await getDockerMonitoring();

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Docker monitoring error:', error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get(
  '/api/docker/containers/:containerId/stats',
  async (req, res) => {
    try {
      const result = await getContainerStats(
        req.params.containerId
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Docker container stats error:', error);

      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);
// ============================================================
// DOCKER IMAGES
// ============================================================

app.get('/api/docker/images', async (req, res) => {
  try {
    const result = await getImages();

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/docker/images/pull', async (req, res) => {
  try {
    const image =
      req.body?.image ||
      req.body?.name;

    if (!image) {
      return res.status(400).json({
        success: false,
        error: 'image is required.'
      });
    }

    const result = await pullImage(image);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get(
  '/api/docker/images/:imageId/inspect',
  async (req, res) => {
    try {
      const result = await inspectImage(
        req.params.imageId
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

app.delete(
  '/api/docker/images/:imageId',
  async (req, res) => {
    try {
      const result = await removeImage(
        req.params.imageId
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

// ============================================================
// DOCKER VOLUMES
// ============================================================

app.get('/api/docker/volumes', async (req, res) => {
  try {
    const result = await getVolumes();

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/docker/volumes', async (req, res) => {
  try {
    const result = await createVolume(req.body);

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get(
  '/api/docker/volumes/:volumeName',
  async (req, res) => {
    try {
      const result = await inspectVolume(
        req.params.volumeName
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

app.delete(
  '/api/docker/volumes/:volumeName',
  async (req, res) => {
    try {
      const result = await removeVolume(
        req.params.volumeName
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);
// ============================================================
// KUBERNETES
// ============================================================

// Cluster information
app.get('/api/kubernetes/cluster', async (req, res) => {
  try {
    const result = await getClusterInfo();

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Nodes
app.get('/api/kubernetes/nodes', async (req, res) => {
  try {
    const result = await getNodes();

    res.json({
      success: true,
      data: JSON.parse(result)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Pods
app.get('/api/kubernetes/pods', async (req, res) => {
  try {
    const namespace =
      String(req.query.namespace || 'default');

    const result = await getPods(namespace);

    res.json({
      success: true,
      data: JSON.parse(result)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Pod logs
app.get(
  '/api/kubernetes/pods/:podName/logs',
  async (req, res) => {
    try {
      const namespace =
        String(req.query.namespace || 'default');

      const result = await getPodLogs(
        req.params.podName,
        namespace
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

// Delete pod
app.delete(
  '/api/kubernetes/pods/:podName',
  async (req, res) => {
    try {
      const namespace =
        String(req.query.namespace || 'default');

      const result = await deletePod(
        req.params.podName,
        namespace
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

// Deployments
app.get(
  '/api/kubernetes/deployments',
  async (req, res) => {
    try {
      const namespace =
        String(req.query.namespace || 'default');

      const result =
        await getDeployments(namespace);

      res.json({
        success: true,
        data: JSON.parse(result)
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

// Scale deployment
app.post(
  '/api/kubernetes/deployments/:name/scale',
  async (req, res) => {
    try {
      const namespace =
        String(req.body?.namespace || 'default');

      const replicas =
        Number(req.body?.replicas);

      if (
        !Number.isInteger(replicas) ||
        replicas < 0 ||
        replicas > 20
      ) {
        return res.status(400).json({
          success: false,
          error: 'Replicas must be an integer between 0 and 20.'
        });
      }

      const result = await scaleDeployment(
        req.params.name,
        replicas,
        namespace
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

// Restart deployment
app.post(
  '/api/kubernetes/deployments/:name/restart',
  async (req, res) => {
    try {
      const namespace =
        String(req.body?.namespace || 'default');

      const result =
        await restartDeployment(
          req.params.name,
          namespace
        );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

// Delete deployment
app.delete(
  '/api/kubernetes/deployments/:name',
  async (req, res) => {
    try {
      const namespace =
        String(req.query.namespace || 'default');

      const result =
        await deleteDeployment(
          req.params.name,
          namespace
        );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

// Services
app.get(
  '/api/kubernetes/services',
  async (req, res) => {
    try {
      const namespace =
        String(req.query.namespace || 'default');

      const result =
        await getServices(namespace);

      res.json({
        success: true,
        data: JSON.parse(result)
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

// Namespaces
app.get(
  '/api/kubernetes/namespaces',
  async (req, res) => {
    try {
      const result =
        await getNamespaces();

      res.json({
        success: true,
        data: JSON.parse(result)
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

// Create namespace
app.post(
  '/api/kubernetes/namespaces',
  async (req, res) => {
    try {
      const name =
        String(req.body?.name || '').trim();

      if (!name) {
        return res.status(400).json({
          success: false,
          error: 'Namespace name is required.'
        });
      }

      const result =
        await createNamespace(name);

      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

// Delete namespace
app.delete(
  '/api/kubernetes/namespaces/:name',
  async (req, res) => {
    try {
      const result =
        await deleteNamespace(
          req.params.name
        );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

// Apply YAML
app.post(
  '/api/kubernetes/apply',
  async (req, res) => {
    try {
      const yaml =
        String(req.body?.yaml || '').trim();

      if (!yaml) {
        return res.status(400).json({
          success: false,
          error: 'Kubernetes YAML is required.'
        });
      }

      const result =
        await applyYaml(yaml);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

// ============================================================
// DOCKER NETWORKS
// ============================================================

app.get('/api/docker/networks', async (req, res) => {
  try {
    const result = await getNetworks();

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================
// DOCKER LEARNER LAB CONFIG
// ============================================================

app.get('/api/labs/config', (req, res) => {
  res.json({
    success: true,
    provider: 'docker',
    awsRequired: false,
    image: LAB_IMAGE,
    network: 'cartforge-labs',
    memoryMB: 512,
    cpu: 0.5,
    operatingSystem: 'Ubuntu 24.04',

    tools: [
      'Linux',
      'Git',
      'Docker CLI',
      'kubectl',
      'Terraform',
      'Ansible',
      'Python',
      'curl',
      'wget'
    ]
  });
});

// ============================================================
// DOCKER LEARNER LAB CREATE
// ============================================================

app.post('/api/labs/create', async (req, res) => {
  try {
    const {
      learnerId,
      userId,
      labName
    } = req.body || {};

    const result = await createLearnerDockerLab({
      learnerId:
        learnerId ||
        userId ||
        'anonymous',

      labName:
        labName ||
        'CartForge Learner Lab'
    });

    res.status(201).json({
      success: true,
      message:
        'CartForge Docker Learner Lab created successfully.',

      lab: {
        ...result,
        provider: 'docker',
        awsRequired: false
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================
// DOCKER LAB LIST
// ============================================================

app.get('/api/labs', async (req, res) => {
  try {
    const result =
      await listLearnerDockerLabs();

    res.json({
      success: true,
      labs: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================
// DOCKER LAB GET
// ============================================================

app.get(
  '/api/labs/:containerId',
  async (req, res) => {
    try {
      const result =
        await getLearnerDockerLab(
          req.params.containerId
        );

      res.json({
        success: true,
        lab: result
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        error: error.message
      });
    }
  }
);

// ============================================================
// DOCKER LAB COMMAND
// ============================================================

app.post(
  '/api/labs/:containerId/command',
  async (req, res) => {
    try {
      const command =
        req.body?.command ||
        req.body?.commandText;

      if (!command || !String(command).trim()) {
        return res.status(400).json({
          success: false,
          error: 'command is required.'
        });
      }

      const result =
        await executeLearnerDockerCommand(
          req.params.containerId,
          command
        );

      res.json({
        success: true,
        result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

// ============================================================
// DOCKER TERMINAL CLEANUP
// ============================================================

async function cleanupDockerTerminalSession(
  containerId
) {
  const terminal =
    dockerTerminalSessions.get(
      containerId
    );

  if (!terminal) {
    return;
  }

  if (terminal.cleanupTimer) {
    clearTimeout(
      terminal.cleanupTimer
    );

    terminal.cleanupTimer = null;
  }

  if (
    terminal.websocket &&
    terminal.websocket.readyState ===
    WebSocket.OPEN
  ) {
    try {
      terminal.websocket.close();
    } catch { }
  }

  if (terminal.process) {
    try {
      terminal.process.kill();
    } catch { }

    terminal.process = null;
  }

  dockerTerminalSessions.delete(
    containerId
  );
}

// ============================================================
// DOCKER LAB STOP
// ============================================================

app.post(
  '/api/labs/:containerId/stop',
  async (req, res) => {
    try {
      await cleanupDockerTerminalSession(
        req.params.containerId
      );

      const result =
        await stopLearnerDockerLab(
          req.params.containerId
        );

      res.json({
        success: true,
        result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

// ============================================================
// DOCKER LAB DESTROY
// ============================================================

app.delete(
  '/api/labs/:containerId',
  async (req, res) => {
    try {
      await cleanupDockerTerminalSession(
        req.params.containerId
      );

      const result =
        await destroyLearnerDockerLab(
          req.params.containerId
        );

      res.json({
        success: true,
        result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

// ============================================================
// DOCKER TERMINAL START
// ============================================================

app.post(
  '/api/labs/:containerId/terminal/start',
  async (req, res) => {
    try {
      const containerId =
        req.params.containerId;

      const lab =
        await getLearnerDockerLab(
          containerId
        );

      if (lab.state?.Status !== 'running') {
        return res.status(400).json({
          success: false,
          terminalReady: false,
          error:
            `Learner lab is not running. Current state: ${lab.state?.Status}`
        });
      }

      if (
        dockerTerminalSessions.has(
          containerId
        )
      ) {
        const existing =
          dockerTerminalSessions.get(
            containerId
          );

        return res.status(409).json({
          success: false,
          terminalReady: false,
          error:
            'A terminal session is already active.',
          sessionId:
            existing.sessionId,
          websocketPath:
            `/api/labs/${encodeURIComponent(containerId)}/terminal`
        });
      }

      const accessToken =
        crypto
          .randomBytes(32)
          .toString('hex');

      const sessionId =
        `docker-${crypto
          .randomBytes(8)
          .toString('hex')}`;

      const terminal = {
        accessToken,
        containerId,
        sessionId,
        process: null,
        websocket: null,
        createdAt:
          new Date().toISOString(),
        connected: false,
        cleanupTimer: null
      };

      terminal.cleanupTimer =
        setTimeout(() => {
          cleanupDockerTerminalSession(
            containerId
          ).catch(error => {
            console.error(
              'Docker terminal cleanup error:',
              error.message
            );
          });
        }, 60 * 1000);

      dockerTerminalSessions.set(
        containerId,
        terminal
      );

      res.json({
        success: true,
        terminalReady: true,
        provider: 'docker',
        awsRequired: false,
        containerId,
        sessionId,
        accessToken,
        websocketPath:
          `/api/labs/${encodeURIComponent(containerId)}/terminal`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        terminalReady: false,
        error: error.message
      });
    }
  }
);
// ============================================================
// SIMULATED AWS LEARNER LAB
// ============================================================

app.get(
  '/api/ec2/lab/config',
  (req, res) => {
    try {
      const config =
        getLearnerLabConfig();

      res.json({
        success: true,
        provider: 'simulation',
        awsRequired: false,
        awsLearnerLabs: false,
        ...config
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        provider: 'simulation',
        awsRequired: false,
        error: error.message
      });
    }
  }
);

// ============================================================
// CREATE SIMULATED LEARNER LAB
// ============================================================

app.post(
  '/api/ec2/lab/create',
  async (req, res) => {
    try {
      const body =
        req.body || {};

      const learnerId =
        body.learnerId ||
        body.userId ||
        body.studentId ||
        'anonymous';

      const result =
        await createLearnerLab({
          learnerId,

          labName:
            body.labName ||
            body.name ||
            'CartForge Learner Lab',

          instanceType:
            body.instanceType ||
            't3.micro',

          storage:
            body.storage ||
            body.storageSize ||
            8,

          image:
            body.image ||
            'Ubuntu 22.04'
        });

      res.status(201).json({
        success: true,
        provider: 'simulation',
        awsRequired: false,
        message:
          'CartForge simulated learner lab created successfully. No real AWS resource was created.',
        lab: result,
        instanceId:
          result.instanceId
      });
    } catch (error) {
      console.error(
        'Simulated learner lab creation error:',
        error
      );

      res.status(500).json({
        success: false,
        provider: 'simulation',
        awsRequired: false,
        error:
          error.message ||
          'Failed to create simulated learner lab.'
      });
    }
  }
);

// ============================================================
// GET SIMULATED LEARNER LAB
// ============================================================

app.get(
  '/api/ec2/lab/:instanceId',
  async (req, res) => {
    try {
      const result =
        await getLearnerLab(
          req.params.instanceId
        );

      res.json({
        success: true,
        provider: 'simulation',
        awsRequired: false,
        lab: result,
        instanceId:
          result.instanceId
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        provider: 'simulation',
        awsRequired: false,
        error: error.message
      });
    }
  }
);

// ============================================================
// SIMULATED TERMINAL STATUS
// ============================================================

app.get(
  '/api/ec2/lab/:instanceId/ssm-status',
  async (req, res) => {
    try {
      const result =
        await getLearnerLabSSMStatus(
          req.params.instanceId
        );

      res.json({
        success: true,
        provider: 'simulation',
        awsRequired: false,
        ssm: result,
        instanceId:
          result.instanceId,
        ready:
          result.terminalReady,
        online:
          result.connected,
        message:
          result.message
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        provider: 'simulation',
        awsRequired: false,
        error: error.message
      });
    }
  }
);

// ============================================================
// SIMULATED TERMINAL STATUS ALIAS
// ============================================================

app.get(
  '/api/ec2/lab/:instanceId/ssm',
  async (req, res) => {
    try {
      const result =
        await getLearnerLabSSMStatus(
          req.params.instanceId
        );

      res.json({
        success: true,
        provider: 'simulation',
        awsRequired: false,
        ssm: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        provider: 'simulation',
        awsRequired: false,
        error: error.message
      });
    }
  }
);

// ============================================================
// SIMULATED COMMAND
// ============================================================

app.post(
  '/api/ec2/lab/:instanceId/command',
  async (req, res) => {
    try {
      const command =
        req.body?.command ||
        req.body?.commandText;

      if (
        !command ||
        !String(command).trim()
      ) {
        return res.status(400).json({
          success: false,
          provider: 'simulation',
          error:
            'command is required.'
        });
      }

      const result =
        await executeLearnerLabCommand(
          req.params.instanceId,
          command
        );

      res.json({
        success: true,
        provider: 'simulation',
        awsRequired: false,
        result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        provider: 'simulation',
        awsRequired: false,
        error: error.message
      });
    }
  }
);

// ============================================================
// SIMULATED TERMINAL START
// ============================================================

app.post(
  '/api/ec2/lab/:instanceId/terminal/start',
  async (req, res) => {
    try {
      const instanceId =
        req.params.instanceId;

      const result =
        await startLearnerLabTerminalSession(
          instanceId
        );

      res.json({
        success: true,
        provider: 'simulation',
        awsRequired: false,

        terminalReady:
          result.terminalReady,

        instanceId,

        sessionId:
          result.sessionId,

        containerId:
          result.containerId,

        websocketPath:
          `/api/ec2/lab/${encodeURIComponent(instanceId)}/terminal`,

        message:
          'Simulated Docker terminal session created. No AWS SSM session was created.'
      });
    } catch (error) {
      console.error(
        'Simulated terminal start error:',
        error
      );

      res.status(500).json({
        success: false,
        provider: 'simulation',
        awsRequired: false,
        terminalReady: false,
        error: error.message
      });
    }
  }
);

// ============================================================
// SIMULATED TERMINAL STOP
// ============================================================

app.post(
  '/api/ec2/lab/:instanceId/terminal/stop',
  async (req, res) => {
    try {
      const sessionId =
        req.body?.sessionId;

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          provider: 'simulation',
          error:
            'sessionId is required.'
        });
      }

      const result =
        await terminateLearnerLabTerminalSession(
          sessionId
        );

      res.json({
        success: true,
        provider: 'simulation',
        awsRequired: false,
        sessionId,
        result,
        message:
          'Simulated Docker terminal session terminated.'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        provider: 'simulation',
        awsRequired: false,
        error: error.message
      });
    }
  }
);

// ============================================================
// SIMULATED TAG
// ============================================================

app.post(
  '/api/ec2/lab/:instanceId/tag',
  async (req, res) => {
    try {
      const tags =
        req.body?.tags ||
        req.body ||
        {};

      const result =
        await tagLearnerLab(
          req.params.instanceId,
          tags
        );

      res.json({
        success: true,
        provider: 'simulation',
        awsRequired: false,
        result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        provider: 'simulation',
        awsRequired: false,
        error: error.message
      });
    }
  }
);

// ============================================================
// DESTROY SIMULATED LEARNER LAB - DELETE
// ============================================================

app.delete(
  '/api/ec2/lab/:instanceId',
  async (req, res) => {
    try {
      const result =
        await destroyLearnerLab(
          req.params.instanceId
        );

      res.json({
        success: true,
        provider: 'simulation',
        awsRequired: false,
        result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        provider: 'simulation',
        awsRequired: false,
        error: error.message
      });
    }
  }
);

// ============================================================
// DESTROY SIMULATED LEARNER LAB - POST ALIAS
// ============================================================

app.post(
  '/api/ec2/lab/:instanceId/destroy',
  async (req, res) => {
    try {
      const result =
        await destroyLearnerLab(
          req.params.instanceId
        );

      res.json({
        success: true,
        provider: 'simulation',
        awsRequired: false,
        result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        provider: 'simulation',
        awsRequired: false,
        error: error.message
      });
    }
  }
);



// ============================================================
// AWS TERMINAL CLEANUP
// ============================================================

async function cleanupAwsTerminalSession(
  instanceId,
  terminateAwsSession = true
) {
  const terminal =
    awsTerminalSessions.get(
      instanceId
    );

  if (!terminal) {
    return;
  }

  /*
   * Stop the local session-manager-plugin process.
   */
  if (terminal.process) {
    try {
      terminal.process.kill();
    } catch { }

    terminal.process = null;
  }

  /*
   * Close browser WebSocket.
   */
  if (
    terminal.websocket &&
    terminal.websocket.readyState ===
    WebSocket.OPEN
  ) {
    try {
      terminal.websocket.close();
    } catch { }
  }

  /*
   * Terminate AWS SSM session.
   */
  if (
    terminateAwsSession &&
    terminal.sessionId
  ) {
    try {
      await terminateLearnerLabTerminalSession(
        terminal.sessionId
      );
    } catch (error) {
      console.warn(
        'AWS SSM session termination warning:',
        error.message
      );
    }
  }

  awsTerminalSessions.delete(
    instanceId
  );
}

// ============================================================
// HTTP SERVER
// ============================================================

const server = http.createServer(app);

// ============================================================
// WEBSOCKET SERVER
// ============================================================

const wss =
  new WebSocketServer({
    noServer: true
  });

// ============================================================
// WEBSOCKET UPGRADE
// ============================================================

server.on(
  'upgrade',
  (request, socket, head) => {
    try {
      const host =
        request.headers.host ||
        `localhost:${PORT}`;

      const requestUrl =
        new URL(
          request.url,
          `http://${host}`
        );

      const pathname =
        requestUrl.pathname;

      // --------------------------------------------------------
      // DOCKER TERMINAL
      // --------------------------------------------------------

      const dockerMatch =
        pathname.match(
          /^\/api\/labs\/([^/]+)\/terminal$/
        );

      if (dockerMatch) {
        const containerId =
          decodeURIComponent(
            dockerMatch[1]
          );

        const accessToken =
          requestUrl.searchParams.get(
            'accessToken'
          );

        if (!accessToken) {
          socket.write(
            'HTTP/1.1 401 Unauthorized\r\n\r\n'
          );
          socket.destroy();
          return;
        }

        const terminal =
          dockerTerminalSessions.get(
            containerId
          );

        if (!terminal) {
          socket.write(
            'HTTP/1.1 404 Not Found\r\n\r\n'
          );
          socket.destroy();
          return;
        }

        if (
          terminal.accessToken !==
          accessToken
        ) {
          socket.write(
            'HTTP/1.1 403 Forbidden\r\n\r\n'
          );
          socket.destroy();
          return;
        }

        wss.handleUpgrade(
          request,
          socket,
          head,
          websocket => {
            wss.emit(
              'connection',
              websocket,
              request,
              {
                type: 'docker',
                containerId
              }
            );
          }
        );

        return;
      }

      // --------------------------------------------------------
      // AWS TERMINAL
      // --------------------------------------------------------

      const awsMatch =
        pathname.match(
          /^\/api\/ec2\/lab\/([^/]+)\/terminal$/
        );

      if (awsMatch) {
        const instanceId =
          decodeURIComponent(
            awsMatch[1]
          );

        const accessToken =
          requestUrl.searchParams.get(
            'accessToken'
          );

        if (!accessToken) {
          socket.write(
            'HTTP/1.1 401 Unauthorized\r\n\r\n'
          );
          socket.destroy();
          return;
        }

        const terminal =
          awsTerminalSessions.get(
            instanceId
          );

        if (!terminal) {
          socket.write(
            'HTTP/1.1 404 Not Found\r\n\r\n'
          );
          socket.destroy();
          return;
        }

        if (
          terminal.accessToken !==
          accessToken
        ) {
          socket.write(
            'HTTP/1.1 403 Forbidden\r\n\r\n'
          );
          socket.destroy();
          return;
        }

        wss.handleUpgrade(
          request,
          socket,
          head,
          websocket => {
            wss.emit(
              'connection',
              websocket,
              request,
              {
                type: 'aws',
                instanceId
              }
            );
          }
        );

        return;
      }

      socket.destroy();
    } catch (error) {
      console.error(
        'WebSocket upgrade error:',
        error
      );

      socket.destroy();
    }
  }
);

// ============================================================
// DOCKER WEBSOCKET CONNECTION
// ============================================================

wss.on(
  'connection',
  async (
    websocket,
    request,
    context
  ) => {
    if (context.type !== 'docker') {
      return;
    }

    const containerId =
      context.containerId;

    const terminal =
      dockerTerminalSessions.get(
        containerId
      );

    if (!terminal) {
      websocket.close(
        1008,
        'Docker terminal session not found.'
      );
      return;
    }

    terminal.websocket =
      websocket;

    terminal.connected =
      true;

    if (terminal.cleanupTimer) {
      clearTimeout(
        terminal.cleanupTimer
      );

      terminal.cleanupTimer = null;
    }

    let lab;

    try {
      lab =
        await getLearnerDockerLab(
          containerId
        );
    } catch (error) {
      websocket.send(
        JSON.stringify({
          type: 'error',
          message:
            error.message
        })
      );

      await cleanupDockerTerminalSession(
        containerId
      );

      return;
    }

    if (
      lab.state?.Status !==
      'running'
    ) {
      websocket.send(
        JSON.stringify({
          type: 'error',
          message:
            'Learner lab is no longer running.'
        })
      );

      await cleanupDockerTerminalSession(
        containerId
      );

      return;
    }

    let terminalProcess;

    try {
      /*
       * node-pty is used only for the local Docker lab.
       * AWS uses session-manager-plugin below.
       */

      const nodePty =
        require('node-pty');

      terminalProcess =
        nodePty.spawn(
          'docker',
          [
            'exec',
            '-it',
            containerId,
            '/bin/bash',
            '-l'
          ],
          {
            name: 'xterm-color',
            cols: 120,
            rows: 30,
            cwd: process.cwd(),
            env: {
              ...process.env
            },
            useConpty: true
          }
        );
    } catch (error) {
      websocket.send(
        JSON.stringify({
          type: 'error',
          message:
            'Could not start Docker learner terminal.',
          details:
            error.message
        })
      );

      await cleanupDockerTerminalSession(
        containerId
      );

      return;
    }

    terminal.process =
      terminalProcess;

    terminalProcess.onData(
      data => {
        if (
          websocket.readyState ===
          WebSocket.OPEN
        ) {
          websocket.send(data);
        }
      }
    );

    websocket.on(
      'message',
      data => {
        if (!terminal.process) {
          return;
        }

        const message =
          Buffer.isBuffer(data)
            ? data.toString('utf8')
            : String(data);

        try {
          const parsed =
            JSON.parse(message);

          if (
            parsed?.type ===
            'resize'
          ) {
            const cols =
              Number(
                parsed.cols
              );

            const rows =
              Number(
                parsed.rows
              );

            if (
              Number.isInteger(cols) &&
              Number.isInteger(rows) &&
              cols > 0 &&
              rows > 0
            ) {
              terminal.process.resize(
                cols,
                rows
              );
            }

            return;
          }
        } catch {
          // Normal terminal input.
        }

        try {
          terminal.process.write(
            message
          );
        } catch (error) {
          console.error(
            'Docker PTY input error:',
            error.message
          );
        }
      }
    );

    terminalProcess.onExit(
      async ({
        exitCode,
        signal
      }) => {
        if (
          websocket.readyState ===
          WebSocket.OPEN
        ) {
          try {
            websocket.send(
              JSON.stringify({
                type: 'closed',
                code: exitCode,
                signal
              })
            );
          } catch { }

          try {
            websocket.close();
          } catch { }
        }

        await cleanupDockerTerminalSession(
          containerId
        );
      }
    );

    websocket.on(
      'close',
      async () => {
        await cleanupDockerTerminalSession(
          containerId
        );
      }
    );

    websocket.on(
      'error',
      async error => {
        console.error(
          'Docker WebSocket error:',
          error.message
        );

        await cleanupDockerTerminalSession(
          containerId
        );
      }
    );

    if (
      websocket.readyState ===
      WebSocket.OPEN
    ) {
      websocket.send(
        JSON.stringify({
          type: 'connected',
          provider: 'docker',
          awsRequired: false,
          containerId,
          sessionId:
            terminal.sessionId,
          message:
            'CartForge Docker terminal connected.'
        })
      );
    }
  }
);

// ============================================================
// AWS SSM WEBSOCKET CONNECTION
// ============================================================

wss.on(
  'connection',
  async (
    websocket,
    request,
    context
  ) => {
    if (context.type !== 'aws') {
      return;
    }

    const instanceId =
      context.instanceId;

    const terminal =
      awsTerminalSessions.get(
        instanceId
      );

    if (!terminal) {
      websocket.close(
        1008,
        'AWS terminal session not found.'
      );
      return;
    }

    terminal.websocket =
      websocket;

    terminal.connected =
      true;

    /*
     * AWS session-manager-plugin expects this exact
     * session information.
     */
    const sessionPayload =
      JSON.stringify({
        SessionId:
          terminal.sessionId,

        StreamUrl:
          terminal.streamUrl,

        TokenValue:
          terminal.tokenValue
      });

    console.log('');
    console.log(
      '================================================'
    );
    console.log(
      'Starting AWS SSM session-manager-plugin'
    );
    console.log(
      `Instance: ${instanceId}`
    );
    console.log(
      `Session:  ${terminal.sessionId}`
    );
    console.log(
      `Region:   ${terminal.region}`
    );
    console.log(
      '================================================'
    );

    let pluginProcess;

    try {
      pluginProcess =
        spawn(
          SSM_PLUGIN_PATH,
          [
            sessionPayload,
            terminal.region,
            'StartSession'
          ],
          {
            windowsHide: true,
            stdio: [
              'pipe',
              'pipe',
              'pipe'
            ]
          }
        );
    } catch (error) {
      console.error(
        'Could not start session-manager-plugin:',
        error
      );

      websocket.send(
        JSON.stringify({
          type: 'error',
          message:
            'Could not start AWS session-manager-plugin.',
          details:
            error.message
        })
      );

      await cleanupAwsTerminalSession(
        instanceId,
        true
      );

      return;
    }

    terminal.process =
      pluginProcess;

    /*
     * session-manager-plugin communicates with the
     * AWS SSM data channel through stdin/stdout.
     *
     * Its stdout is forwarded to the browser terminal.
     */
    pluginProcess.stdout.on(
      'data',
      data => {
        if (
          websocket.readyState ===
          WebSocket.OPEN
        ) {
          websocket.send(data);
        }
      }
    );

    pluginProcess.stderr.on(
      'data',
      data => {
        const message =
          data.toString();

        console.log(
          'SSM plugin:',
          message.trim()
        );
      }
    );

    pluginProcess.on(
      'error',
      async error => {
        console.error(
          'SSM plugin process error:',
          error.message
        );

        if (
          websocket.readyState ===
          WebSocket.OPEN
        ) {
          websocket.send(
            JSON.stringify({
              type: 'error',
              message:
                'AWS SSM terminal process failed.',
              details:
                error.message
            })
          );
        }

        await cleanupAwsTerminalSession(
          instanceId,
          true
        );
      }
    );

    pluginProcess.on(
      'exit',
      async (
        code,
        signal
      ) => {
        console.log(
          `AWS SSM plugin exited. code=${code}, signal=${signal}`
        );

        if (
          websocket.readyState ===
          WebSocket.OPEN
        ) {
          try {
            websocket.send(
              JSON.stringify({
                type: 'closed',
                code,
                signal
              })
            );
          } catch { }

          try {
            websocket.close();
          } catch { }
        }

        await cleanupAwsTerminalSession(
          instanceId,
          false
        );
      }
    );

    /*
     * Browser → SSM plugin
     */
    websocket.on(
      'message',
      data => {
        if (
          !terminal.process ||
          terminal.process.stdin.destroyed
        ) {
          return;
        }

        const message =
          Buffer.isBuffer(data)
            ? data.toString('utf8')
            : String(data);

        /*
         * xterm resize messages are handled here.
         *
         * SSM itself does not expose the same PTY resize
         * interface as node-pty, so resize metadata is
         * currently ignored.
         */

        try {
          const parsed =
            JSON.parse(message);

          if (
            parsed?.type ===
            'resize'
          ) {
            return;
          }
        } catch {
          // Normal shell input.
        }

        try {
          terminal.process.stdin.write(
            message
          );
        } catch (error) {
          console.error(
            'AWS SSM terminal input error:',
            error.message
          );
        }
      }
    );

    websocket.on(
      'close',
      async () => {
        await cleanupAwsTerminalSession(
          instanceId,
          true
        );
      }
    );

    websocket.on(
      'error',
      async error => {
        console.error(
          'AWS terminal WebSocket error:',
          error.message
        );

        await cleanupAwsTerminalSession(
          instanceId,
          true
        );
      }
    );

    if (
      websocket.readyState ===
      WebSocket.OPEN
    ) {
      websocket.send(
        JSON.stringify({
          type: 'connected',
          provider: 'aws',
          awsRequired: true,
          instanceId,
          sessionId:
            terminal.sessionId,
          message:
            'CartForge AWS SSM terminal connected.'
        })
      );
    }
  }
);
// ============================================================
// DOCKER COMPOSE API
// ============================================================

// ------------------------------------------------------------
// LIST COMPOSE PROJECTS
// GET /api/docker/compose/projects
// ------------------------------------------------------------

app.get(
  "/api/docker/compose/projects",
  async (req, res) => {
    try {
      const result =
        await listComposeProjects();

      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error(
        "Compose project list error:",
        error
      );

      res.status(500).json({
        success: false,
        error:
          error.message ||
          "Failed to list Compose projects"
      });
    }
  }
);

// ------------------------------------------------------------
// CREATE COMPOSE PROJECT
// POST /api/docker/compose/projects
// ------------------------------------------------------------

app.post(
  "/api/docker/compose/projects",
  async (req, res) => {
    try {
      const {
        projectName,
        composeFile,
        yaml
      } = req.body || {};

      const composeContent =
        composeFile ?? yaml;

      if (
        !projectName ||
        !String(projectName).trim()
      ) {
        return res.status(400).json({
          success: false,
          error:
            "Compose project name is required"
        });
      }

      if (
        !composeContent ||
        !String(composeContent).trim()
      ) {
        return res.status(400).json({
          success: false,
          error:
            "Docker Compose YAML is required"
        });
      }

      const result =
        await createComposeProject({
          projectName,
          composeFile:
            composeContent
        });

      res.status(201).json(result);
    } catch (error) {
      console.error(
        "Compose project creation error:",
        error
      );

      res.status(500).json({
        success: false,
        error:
          error.message ||
          "Failed to create Compose project"
      });
    }
  }
);

// ------------------------------------------------------------
// START COMPOSE PROJECT
// POST /api/docker/compose/projects/:projectName/up
// ------------------------------------------------------------

app.post(
  "/api/docker/compose/projects/:projectName/up",
  async (req, res) => {
    try {
      const {
        projectName
      } = req.params;

      const result =
        await composeUp(
          projectName
        );

      res.json(result);
    } catch (error) {
      console.error(
        "Compose up error:",
        error
      );

      res.status(500).json({
        success: false,
        error:
          error.message ||
          "Failed to start Compose project"
      });
    }
  }
);

// ------------------------------------------------------------
// STOP / REMOVE COMPOSE PROJECT
// POST /api/docker/compose/projects/:projectName/down
// ------------------------------------------------------------

app.post(
  "/api/docker/compose/projects/:projectName/down",
  async (req, res) => {
    try {
      const {
        projectName
      } = req.params;

      const result =
        await composeDown(
          projectName
        );

      res.json(result);
    } catch (error) {
      console.error(
        "Compose down error:",
        error
      );

      res.status(500).json({
        success: false,
        error:
          error.message ||
          "Failed to stop Compose project"
      });
    }
  }
);

// ------------------------------------------------------------
// RESTART COMPOSE PROJECT
// POST /api/docker/compose/projects/:projectName/restart
// ------------------------------------------------------------

app.post(
  "/api/docker/compose/projects/:projectName/restart",
  async (req, res) => {
    try {
      const {
        projectName
      } = req.params;

      const result =
        await composeRestart(
          projectName
        );

      res.json(result);
    } catch (error) {
      console.error(
        "Compose restart error:",
        error
      );

      res.status(500).json({
        success: false,
        error:
          error.message ||
          "Failed to restart Compose project"
      });
    }
  }
);

// ------------------------------------------------------------
// COMPOSE PROJECT STATUS
// GET /api/docker/compose/projects/:projectName
// ------------------------------------------------------------

app.get(
  "/api/docker/compose/projects/:projectName",
  async (req, res) => {
    try {
      const {
        projectName
      } = req.params;

      const result =
        await composePs(
          projectName
        );

      res.json(result);
    } catch (error) {
      console.error(
        "Compose status error:",
        error
      );

      res.status(500).json({
        success: false,
        error:
          error.message ||
          "Failed to get Compose project status"
      });
    }
  }
);

// ------------------------------------------------------------
// VALIDATE COMPOSE PROJECT
// GET /api/docker/compose/projects/:projectName/validate
// ------------------------------------------------------------

app.get(
  "/api/docker/compose/projects/:projectName/validate",
  async (req, res) => {
    try {
      const {
        projectName
      } = req.params;

      const result =
        await validateComposeProject(
          projectName
        );

      res.json(result);
    } catch (error) {
      console.error(
        "Compose validation error:",
        error
      );

      res.status(400).json({
        success: false,
        error:
          error.message ||
          "Compose configuration is invalid"
      });
    }
  }
);

// ------------------------------------------------------------
// COMPOSE LOGS
// GET /api/docker/compose/projects/:projectName/logs
// GET /api/docker/compose/projects/:projectName/logs?service=web
// ------------------------------------------------------------

app.get(
  "/api/docker/compose/projects/:projectName/logs",
  async (req, res) => {
    try {
      const {
        projectName
      } = req.params;

      const {
        service
      } = req.query;

      const result =
        await composeLogs(
          projectName,
          service
        );

      res.json(result);
    } catch (error) {
      console.error(
        "Compose logs error:",
        error
      );

      res.status(500).json({
        success: false,
        error:
          error.message ||
          "Failed to get Compose logs"
      });
    }
  }
);

// ------------------------------------------------------------
// DELETE COMPOSE PROJECT FILES
// DELETE /api/docker/compose/projects/:projectName
// ------------------------------------------------------------

app.delete(
  "/api/docker/compose/projects/:projectName",
  async (req, res) => {
    try {
      const {
        projectName
      } = req.params;

      const result =
        await deleteComposeProject(
          projectName
        );

      res.json(result);
    } catch (error) {
      console.error(
        "Compose project deletion error:",
        error
      );

      res.status(500).json({
        success: false,
        error:
          error.message ||
          "Failed to delete Compose project"
      });
    }
  }
);
// ============================================================
// JENKINS INTEGRATION
// ============================================================

function getJenkinsConfig() {
  const baseUrl = String(process.env.JENKINS_URL || '').replace(/\/+$/, '');
  const username = String(process.env.JENKINS_USER || '');
  const token = String(process.env.JENKINS_TOKEN || '');

  if (!baseUrl || !username || !token) {
    throw new Error(
      'Jenkins configuration is missing. Set JENKINS_URL, JENKINS_USER and JENKINS_TOKEN in .env'
    );
  }

  return {
    baseUrl,
    username,
    token,
  };
}

function jenkinsRequest(path, options = {}) {
  const { baseUrl, username, token } = getJenkinsConfig();

  const target = new URL(path, `${baseUrl}/`);

  const auth = Buffer
    .from(`${username}:${token}`)
    .toString('base64');

  const headers = {
    Accept: 'application/json',
    Authorization: `Basic ${auth}`,
    ...(options.headers || {}),
  };

  return new Promise((resolve, reject) => {
    const protocol =
      target.protocol === 'https:'
        ? require('https')
        : require('http');

    const request = protocol.request(
      target,
      {
        method: options.method || 'GET',
        headers,
      },
      (response) => {
        let body = '';

        response.setEncoding('utf8');

        response.on('data', (chunk) => {
          body += chunk;
        });

        response.on('end', () => {
          const contentType =
            String(response.headers['content-type'] || '');

          let data = body;

          if (contentType.includes('application/json')) {
            try {
              data = body ? JSON.parse(body) : {};
            } catch {
              data = body;
            }
          }

          if (
            response.statusCode >= 200 &&
            response.statusCode < 300
          ) {
            resolve({
              statusCode: response.statusCode,
              headers: response.headers,
              data,
            });
            return;
          }

          const error = new Error(
            `Jenkins returned HTTP ${response.statusCode}`
          );

          error.statusCode = response.statusCode;
          error.data = data;

          reject(error);
        });
      }
    );

    request.on('error', reject);

    request.setTimeout(15000, () => {
      request.destroy(
        new Error('Jenkins request timed out')
      );
    });

    request.end();
  });
}


// ------------------------------------------------------------
// Jenkins status
// ------------------------------------------------------------

app.get('/api/jenkins/status', async (req, res) => {
  try {
    const result = await jenkinsRequest('/api/json');

    res.json({
      success: true,
      connected: true,
      statusCode: result.statusCode,
      jenkins: result.data,
    });
  } catch (error) {
    console.error(
      'Jenkins status error:',
      error.message
    );

    res.status(error.statusCode || 500).json({
      success: false,
      connected: false,
      error: error.message,
      details: error.data || null,
    });
  }
});


// ------------------------------------------------------------
// Jenkins jobs
// ------------------------------------------------------------

app.get('/api/jenkins/jobs', async (req, res) => {
  try {
    const tree =
      'jobs[name,url,color,displayName,lastBuild[number,result,timestamp,duration]]';

    const result = await jenkinsRequest(
      `/api/json?tree=${encodeURIComponent(tree)}`
    );

    res.json({
      success: true,
      jobs: result.data.jobs || [],
    });
  } catch (error) {
    console.error(
      'Jenkins jobs error:',
      error.message
    );

    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message,
      details: error.data || null,
    });
  }
});


// ------------------------------------------------------------
// Trigger Jenkins build
// ------------------------------------------------------------

app.post(
  '/api/jenkins/job/:jobName/build',
  async (req, res) => {
    try {
      const jobName =
        decodeURIComponent(req.params.jobName);

      const path =
        `/job/${encodeURIComponent(jobName)}/build`;

      const result =
        await jenkinsRequest(path, {
          method: 'POST',
        });

      res.status(202).json({
        success: true,
        message: 'Jenkins build triggered.',
        statusCode: result.statusCode,
      });
    } catch (error) {
      console.error(
        'Jenkins build trigger error:',
        error.message
      );

      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message,
        details: error.data || null,
      });
    }
  }
);


// ------------------------------------------------------------
// Jenkins build information
// ------------------------------------------------------------

app.get(
  '/api/jenkins/job/:jobName/:buildNumber',
  async (req, res) => {
    try {
      const jobName =
        decodeURIComponent(req.params.jobName);

      const buildNumber =
        encodeURIComponent(req.params.buildNumber);

      const path =
        `/job/${encodeURIComponent(jobName)}/${buildNumber}/api/json`;

      const result =
        await jenkinsRequest(path);

      res.json({
        success: true,
        build: result.data,
      });
    } catch (error) {
      console.error(
        'Jenkins build information error:',
        error.message
      );

      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message,
        details: error.data || null,
      });
    }
  }
);


// ------------------------------------------------------------
// Jenkins console output
// ------------------------------------------------------------

app.get(
  '/api/jenkins/job/:jobName/:buildNumber/console',
  async (req, res) => {
    try {
      const jobName =
        decodeURIComponent(req.params.jobName);

      const buildNumber =
        encodeURIComponent(req.params.buildNumber);

      const path =
        `/job/${encodeURIComponent(jobName)}/${buildNumber}/consoleText`;

      const result =
        await jenkinsRequest(path);

      res.type('text/plain').send(
        typeof result.data === 'string'
          ? result.data
          : JSON.stringify(result.data, null, 2)
      );
    } catch (error) {
      console.error(
        'Jenkins console error:',
        error.message
      );

      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message,
        details: error.data || null,
      });
    }
  }
);


// ============================================================
// 404
// ============================================================

app.use(
  (req, res) => {
    res.status(404).json({
      success: false,
      error:
        `Route not found: ${req.method} ${req.originalUrl}`
    });
  }
);

// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================

app.use(
  (err, req, res, next) => {
    console.error(
      'Unhandled API error:',
      err
    );

    if (res.headersSent) {
      return next(err);
    }

    res.status(500).json({
      success: false,
      error:
        err.message ||
        'Internal server error.'
    });
  }
);

// ============================================================
// START SERVER
// ============================================================



server.listen(
  PORT,
  async () => {
    console.log('');
    console.log(
      '=============================================='
    );
    console.log(
      '       CARTFORGE BACKEND STARTED'
    );
    console.log(
      '=============================================='
    );
    console.log(
      `API:          http://localhost:${PORT}`
    );
    console.log(
      `Health:       http://localhost:${PORT}/health`
    );
    console.log(
      `API Health:   http://localhost:${PORT}/api/health`
    );
    console.log(
      'AWS Labs:     SIMULATION MODE (real AWS endpoints disabled)'
    );
    console.log(
      `AWS Region:   ${AWS_REGION}`
    );
    console.log(
      'Learner Lab:  Simulated AWS resources (no real AWS provisioning)'
    );
    console.log(
      'Docker Labs:  ENABLED'
    );
    console.log(
      `Lab Image:    ${LAB_IMAGE}`
    );
    console.log(
      `SSM Plugin:   ${SSM_PLUGIN_PATH}`
    );
    console.log(
      '=============================================='
    );

    try {
      await ensureLearnerLabNetwork();

      console.log(
        'CartForge Docker learner network ready: cartforge-labs'
      );
    } catch (error) {
      console.error(
        'Docker learner network initialization:',
        error.message
      );
    }

    console.log('');
  }
);


// ============================================================
// GRACEFUL SHUTDOWN
// ============================================================

async function shutdown(signal) {
  console.log(
    `${signal} received. Cleaning up CartForge terminals...`
  );

  const dockerIds =
    Array.from(
      dockerTerminalSessions.keys()
    );

  for (const containerId of dockerIds) {
    try {
      await cleanupDockerTerminalSession(
        containerId
      );
    } catch (error) {
      console.error(
        'Docker terminal cleanup error:',
        error.message
      );
    }
  }

  const awsIds =
    Array.from(
      awsTerminalSessions.keys()
    );

  for (const instanceId of awsIds) {
    try {
      await cleanupAwsTerminalSession(
        instanceId,
        true
      );
    } catch (error) {
      console.error(
        'AWS terminal cleanup error:',
        error.message
      );
    }
  }

  server.close(() => {
    console.log(
      'CartForge backend stopped.'
    );

    process.exit(0);
  });
}

process.on(
  'SIGINT',
  () => shutdown('SIGINT')
);

process.on(
  'SIGTERM',
  () => shutdown('SIGTERM')
);







