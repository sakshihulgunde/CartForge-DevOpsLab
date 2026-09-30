'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const {
    createLearnerDockerLab,
    getLearnerDockerLab,
    executeLearnerDockerCommand,
    destroyLearnerDockerLab
} = require('./docker.service');

const AWS_REGION =
    process.env.AWS_REGION ||
    process.env.AWS_DEFAULT_REGION ||
    'ap-south-1';

const LABS_FILE = path.join(
    __dirname,
    '..',
    'data',
    'simulated-aws-labs.json'
);

const labs = new Map();

/* ============================================================
   PERSISTENCE
   ============================================================ */

function loadLabs() {
    if (!fs.existsSync(LABS_FILE)) {
        return;
    }

    try {
        const data = JSON.parse(
            fs.readFileSync(LABS_FILE, 'utf8')
        );

        Object.keys(data).forEach((id) => {
            labs.set(id, data[id]);
        });
    } catch (error) {
        console.error(
            'Could not load simulated labs:',
            error.message
        );
    }
}

function saveLabs() {
    fs.mkdirSync(
        path.dirname(LABS_FILE),
        { recursive: true }
    );

    const data = {};

    labs.forEach((lab, id) => {
        data[id] = lab;
    });

    fs.writeFileSync(
        LABS_FILE,
        JSON.stringify(data, null, 2),
        'utf8'
    );
}

/* ============================================================
   HELPERS
   ============================================================ */

function newInstanceId() {
    return (
        'sim-i-' +
        crypto.randomBytes(6).toString('hex')
    );
}

function newPrivateIp() {
    return (
        '10.0.0.' +
        (Math.floor(Math.random() * 200) + 20)
    );
}

function formatLab(lab) {
    return {
        success: true,
        provider: 'simulation',
        awsRequired: false,

        instanceId: lab.instanceId,
        containerId: lab.containerId,

        learnerId: lab.learnerId,
        labName: lab.labName,

        instanceType: lab.instanceType,
        image: lab.image,
        storage: lab.storage,
        privateIp: lab.privateIp,

        state: lab.state,
        tags: lab.tags,

        region: AWS_REGION,

        terminalReady:
            lab.state === 'running',

        createdAt: lab.createdAt,
        updatedAt: lab.updatedAt,

        message:
            'Simulated EC2 learner lab. No real AWS resource was created.'
    };
}

/* ============================================================
   CONFIG
   ============================================================ */

function getLearnerLabConfig() {
    return {
        success: true,

        enabled: true,
        provider: 'simulation',
        awsRequired: false,
        awsLearnerLabs: false,

        region: AWS_REGION,

        allowedInstanceTypes: [
            't3.micro'
        ],

        allowedStorage: [
            8,
            10,
            20,
            30
        ],

        operatingSystems: [
            'Ubuntu 22.04'
        ],

        maxLabsPerLearner: 1,

        billing: {
            realAwsBilling: false,
            estimatedCost: 0,
            currency: 'USD'
        },

        terminal: {
            enabled: true,
            provider: 'docker',
            isolated: true
        }
    };
}

/* ============================================================
   CREATE SIMULATED EC2 LAB
   ============================================================ */

async function createLearnerLab(options = {}) {
    const learnerId =
        options.learnerId || 'anonymous';

    const labName =
        options.labName ||
        'CartForge Learner Lab';

    const instanceType =
        options.instanceType ||
        't3.micro';

    const storage =
        Number(options.storage) || 10;

    const image =
        options.image ||
        'Ubuntu 22.04';

    /*
     * IMPORTANT:
     * This creates a Docker learner lab only.
     * It does NOT create an AWS EC2 instance.
     */

    const dockerLab =
        await createLearnerDockerLab({
            learnerId,
            labName
        });

    const containerId =
        dockerLab.containerId ||
        dockerLab.id ||
        dockerLab.Id;

    if (!containerId) {
        throw new Error(
            'Docker learner lab was created but no container ID was returned'
        );
    }

    const now =
        new Date().toISOString();

    const instanceId =
        newInstanceId();

    const lab = {
        instanceId,
        containerId,

        learnerId,
        labName,

        instanceType,
        storage,
        image,

        privateIp:
            newPrivateIp(),

        state: 'running',

        tags: {
            Name: labName,
            LearnerId: String(learnerId),
            CartForge: 'true',
            Provider: 'simulation'
        },

        dockerLab,

        createdAt: now,
        updatedAt: now
    };

    labs.set(
        instanceId,
        lab
    );

    saveLabs();

    return formatLab(lab);
}

/* ============================================================
   GET SIMULATED EC2 LAB
   ============================================================ */

async function getLearnerLab(instanceId) {
    const lab =
        labs.get(instanceId);

    if (!lab) {
        throw new Error(
            'Simulated learner lab was not found'
        );
    }

    try {
        const dockerLab =
            await getLearnerDockerLab(
                lab.containerId
            );

        lab.dockerLab =
            dockerLab;

        if (
            dockerLab &&
            dockerLab.state &&
            dockerLab.state.Running
        ) {
            lab.state = 'running';
        } else {
            lab.state = 'stopped';
        }
    } catch (error) {
        lab.state = 'stopped';
    }

    lab.updatedAt =
        new Date().toISOString();

    saveLabs();

    return formatLab(lab);
}

/* ============================================================
   SIMULATED SSM STATUS
   ============================================================ */

async function getLearnerLabSSMStatus(
    instanceId
) {
    const lab =
        labs.get(instanceId);

    if (!lab) {
        throw new Error(
            'Simulated learner lab was not found'
        );
    }

    const running =
        lab.state === 'running';

    return {
        success: true,

        provider: 'simulation',
        awsRequired: false,

        instanceId,
        containerId:
            lab.containerId,

        status:
            running
                ? 'Online'
                : 'Offline',

        connected: running,

        ssmManaged: false,

        terminalReady: running,

        message:
            'Simulated terminal uses the CartForge Docker learner lab.'
    };
}

/* ============================================================
   EXECUTE COMMAND
   ============================================================ */

async function executeLearnerLabCommand(
    instanceId,
    command
) {
    const lab =
        labs.get(instanceId);

    if (!lab) {
        throw new Error(
            'Simulated learner lab was not found'
        );
    }

    if (lab.state !== 'running') {
        throw new Error(
            'Simulated learner lab is not running'
        );
    }

    if (
        !command ||
        !String(command).trim()
    ) {
        throw new Error(
            'Command is required'
        );
    }

    const result =
        await executeLearnerDockerCommand(
            lab.containerId,
            command
        );

    return {
        success: true,

        provider: 'simulation',
        awsRequired: false,

        instanceId,
        containerId:
            lab.containerId,

        command,

        result
    };
}

/* ============================================================
   START TERMINAL SESSION
   ============================================================ */

async function startLearnerLabTerminalSession(
    instanceId
) {
    const lab =
        labs.get(instanceId);

    if (!lab) {
        throw new Error(
            'Simulated learner lab was not found'
        );
    }

    if (lab.state !== 'running') {
        throw new Error(
            'Simulated learner lab is not running'
        );
    }

    return {
        success: true,

        provider: 'simulation',
        awsRequired: false,

        instanceId,

        containerId:
            lab.containerId,

        sessionId:
            'sim-session-' +
            crypto.randomBytes(8).toString('hex'),

        region:
            AWS_REGION,

        terminalReady: true,

        message:
            'Simulated terminal session created.'
    };
}

/* ============================================================
   TERMINATE TERMINAL SESSION
   ============================================================ */

async function terminateLearnerLabTerminalSession(
    sessionId
) {
    return {
        success: true,

        provider: 'simulation',
        awsRequired: false,

        sessionId,

        message:
            'Simulated terminal session closed.'
    };
}

/* ============================================================
   TAG LAB
   ============================================================ */

async function tagLearnerLab(
    instanceId,
    tags
) {
    const lab =
        labs.get(instanceId);

    if (!lab) {
        throw new Error(
            'Simulated learner lab was not found'
        );
    }

    lab.tags =
        Object.assign(
            {},
            lab.tags || {},
            tags || {}
        );

    lab.updatedAt =
        new Date().toISOString();

    saveLabs();

    return formatLab(lab);
}

/* ============================================================
   DESTROY LAB
   ============================================================ */

async function destroyLearnerLab(
    instanceId
) {
    const lab =
        labs.get(instanceId);

    if (!lab) {
        throw new Error(
            'Simulated learner lab was not found'
        );
    }

    try {
        await destroyLearnerDockerLab(
            lab.containerId
        );
    } finally {
        lab.state =
            'terminated';

        lab.updatedAt =
            new Date().toISOString();

        labs.delete(
            instanceId
        );

        saveLabs();
    }

    return {
        success: true,

        provider: 'simulation',
        awsRequired: false,

        instanceId,

        containerId:
            lab.containerId,

        state:
            'terminated',

        message:
            'Simulated learner lab destroyed. No real AWS resource was created.'
    };
}

/* ============================================================
   INITIALIZE
   ============================================================ */

loadLabs();

/* ============================================================
   EXPORTS
   ============================================================ */

module.exports = {
    getLearnerLabConfig,
    createLearnerLab,
    getLearnerLab,
    destroyLearnerLab,
    tagLearnerLab,
    getLearnerLabSSMStatus,
    executeLearnerLabCommand,
    startLearnerLabTerminalSession,
    terminateLearnerLabTerminalSession
};