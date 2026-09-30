
'use strict';

require('dotenv').config();

const {
  EC2Client,
  RunInstancesCommand,
  DescribeInstancesCommand,
  TerminateInstancesCommand,
  CreateTagsCommand
} = require('@aws-sdk/client-ec2');

const {
  SSMClient,
  DescribeInstanceInformationCommand,
  SendCommandCommand,
  GetCommandInvocationCommand,
  StartSessionCommand,
  TerminateSessionCommand
} = require('@aws-sdk/client-ssm');

const {
  fromLoginCredentials
} = require('@aws-sdk/credential-providers');

/*
|--------------------------------------------------------------------------
| CartForge Learner Lab - AWS EC2 + SSM Service
|--------------------------------------------------------------------------
|
| Architecture:
|
| CartForge Frontend
|       |
|       v
| CartForge Node API
|       |
|       +---- AWS EC2 API
|       |
|       +---- AWS SSM API
|                    |
|                    v
|              Dedicated Learner EC2
|
| IMPORTANT:
| - This does NOT use the old/classroom EC2 instance.
| - Only instances tagged Project=CartForge can be managed by this service.
| - Only t3.micro is allowed by default.
| - Storage is restricted to 8/10/20/30 GB.
|
|--------------------------------------------------------------------------
*/

const REGION =
  process.env.AWS_REGION ||
  process.env.AWS_DEFAULT_REGION ||
  'ap-south-1';

const AMI_ID =
  process.env.CARTFORGE_LAB_AMI_ID ||
  process.env.AWS_AMI_ID ||
  '';

const SUBNET_ID =
  process.env.CARTFORGE_LAB_SUBNET_ID ||
  process.env.AWS_SUBNET_ID ||
  '';

const SECURITY_GROUP_ID =
  process.env.CARTFORGE_LAB_SECURITY_GROUP_ID ||
  process.env.AWS_SECURITY_GROUP_ID ||
  '';

const IAM_INSTANCE_PROFILE =
  process.env.CARTFORGE_LAB_IAM_INSTANCE_PROFILE ||
  process.env.AWS_IAM_INSTANCE_PROFILE ||
  'CartForgeLearnerLabRole';

const KEY_NAME =
  process.env.CARTFORGE_LAB_KEY_NAME ||
  process.env.AWS_KEY_NAME ||
  '';

const ALLOWED_INSTANCE_TYPES = ['t3.micro'];
const ALLOWED_STORAGE = [8, 10, 20, 30];

const DEFAULT_INSTANCE_TYPE = 't3.micro';
const DEFAULT_STORAGE = 8;

const ec2Client = new EC2Client({
  region: REGION,
  credentials: fromLoginCredentials()
});

const ssmClient = new SSMClient({
  region: REGION,
  credentials: fromLoginCredentials()
});

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function validateLearnerId(learnerId) {
  if (!learnerId) {
    return 'anonymous';
  }

  return String(learnerId)
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .substring(0, 64) || 'anonymous';
}

function validateLabName(labName) {
  const name =
    String(labName || 'cartforge-learner-lab')
      .trim()
      .replace(/[^a-zA-Z0-9._-]/g, '-')
      .substring(0, 40);

  return name || 'cartforge-learner-lab';
}

function validateInstanceType(instanceType) {
  const type = instanceType || DEFAULT_INSTANCE_TYPE;

  if (!ALLOWED_INSTANCE_TYPES.includes(type)) {
    throw new Error(
      `Instance type '${type}' is not allowed. ` +
      `Allowed types: ${ALLOWED_INSTANCE_TYPES.join(', ')} `
    );
  }

  return type;
}

function validateStorage(storage) {
  const value = Number(storage || DEFAULT_STORAGE);

  if (!ALLOWED_STORAGE.includes(value)) {
    throw new Error(
      `Storage '${value} GB' is not allowed. ` +
      `Allowed storage: ${ALLOWED_STORAGE.join(', ')} GB`
    );
  }

  return value;
}

function validateRequiredAwsConfig() {
  const missing = [];

  if (!AMI_ID) {
    missing.push('CARTFORGE_LAB_AMI_ID / AWS_AMI_ID');
  }

  if (!SUBNET_ID) {
    missing.push('CARTFORGE_LAB_SUBNET_ID / AWS_SUBNET_ID');
  }

  if (!SECURITY_GROUP_ID) {
    missing.push(
      'CARTFORGE_LAB_SECURITY_GROUP_ID / AWS_SECURITY_GROUP_ID'
    );
  }

  if (!IAM_INSTANCE_PROFILE) {
    missing.push(
      'CARTFORGE_LAB_IAM_INSTANCE_PROFILE / AWS_IAM_INSTANCE_PROFILE'
    );
  }

  if (missing.length > 0) {
    throw new Error(
      `CartForge AWS Learner Lab configuration is incomplete. ` +
      `Missing: ${missing.join(', ')} `
    );
  }
}

function getInstanceFromResponse(response) {
  return response?.Reservations?.[0]?.Instances?.[0] || null;
}

function getTagValue(tags, key) {
  const tag = (tags || []).find(item => item.Key === key);
  return tag?.Value || null;
}

function isCartForgeLearnerLab(instance) {
  if (!instance) {
    return false;
  }

  const project = getTagValue(instance.Tags, 'Project');
  const environment = getTagValue(instance.Tags, 'Environment');
  const managedBy = getTagValue(instance.Tags, 'ManagedBy');

  return (
    project === 'CartForge' &&
    environment === 'LearnerLab' &&
    managedBy === 'CartForge'
  );
}

function formatInstance(instance) {
  if (!instance) {
    return null;
  }

  const tags = instance.Tags || [];

  return {
    instanceId: instance.InstanceId,

    name:
      getTagValue(tags, 'Name') ||
      getTagValue(tags, 'LabName') ||
      'CartForge Learner Lab',

    labName:
      getTagValue(tags, 'LabName') ||
      getTagValue(tags, 'Name') ||
      'CartForge Learner Lab',

    learnerId:
      getTagValue(tags, 'LearnerId') ||
      'anonymous',

    project: getTagValue(tags, 'Project'),
    environment: getTagValue(tags, 'Environment'),
    managedBy: getTagValue(tags, 'ManagedBy'),

    state: instance.State?.Name || 'unknown',

    instanceType: instance.InstanceType || DEFAULT_INSTANCE_TYPE,

    privateIp:
      instance.PrivateIpAddress ||
      null,

    publicIp:
      instance.PublicIpAddress ||
      null,

    privateDns:
      instance.PrivateDnsName ||
      null,

    publicDns:
      instance.PublicDnsName ||
      null,

    availabilityZone:
      instance.Placement?.AvailabilityZone ||
      null,

    subnetId:
      instance.SubnetId ||
      null,

    securityGroupIds:
      (instance.SecurityGroups || []).map(
        group => group.GroupId
      ),

    launchTime:
      instance.LaunchTime ||
      null,

    imageId:
      instance.ImageId ||
      null,

    architecture:
      instance.Architecture ||
      null,

    rootDevice:
      instance.RootDeviceName ||
      '/dev/sda1',

    tags
  };
}

/*
|--------------------------------------------------------------------------
| Create Learner Lab
|--------------------------------------------------------------------------
*/

async function createLearnerLab(options = {}) {
  validateRequiredAwsConfig();

  const learnerId = validateLearnerId(
    options.learnerId ||
    options.userId ||
    options.studentId
  );

  const labName = validateLabName(
    options.labName ||
    options.name
  );

  const instanceType = validateInstanceType(
    options.instanceType
  );

  const storage = validateStorage(
    options.storage ||
    options.storageSize
  );

  /*
   * IMPORTANT:
   * No existing EC2 instance is reused.
   * RunInstances always creates a NEW dedicated learner instance.
   */

  const tags = [
    {
      Key: 'Project',
      Value: 'CartForge'
    },
    {
      Key: 'Environment',
      Value: 'LearnerLab'
    },
    {
      Key: 'ManagedBy',
      Value: 'CartForge'
    },
    {
      Key: 'LearnerId',
      Value: learnerId
    },
    {
      Key: 'LabName',
      Value: labName
    },
    {
      Key: 'Name',
      Value: labName
    }
  ];

  const params = {
    ImageId: AMI_ID,

    InstanceType: instanceType,

    MinCount: 1,
    MaxCount: 1,

    SubnetId: SUBNET_ID,

    SecurityGroupIds: [
      SECURITY_GROUP_ID
    ],

    IamInstanceProfile: {
      Name: IAM_INSTANCE_PROFILE
    },

    BlockDeviceMappings: [
      {
        DeviceName: '/dev/sda1',

        Ebs: {
          VolumeSize: storage,
          VolumeType: 'gp3',
          DeleteOnTermination: true,
          Encrypted: true
        }
      }
    ],

    TagSpecifications: [
      {
        ResourceType: 'instance',
        Tags: tags
      },

      {
        ResourceType: 'volume',
        Tags: tags
      }
    ]
  };

  if (KEY_NAME) {
    params.KeyName = KEY_NAME;
  }

  console.log('');
  console.log('================================================');
  console.log('Creating CartForge AWS Learner Lab');
  console.log('================================================');
  console.log(`Region:        ${REGION} `);
  console.log(`Lab Name:      ${labName} `);
  console.log(`Learner ID:    ${learnerId} `);
  console.log(`Instance Type: ${instanceType} `);
  console.log(`Storage:       ${storage} GB`);
  console.log(`AMI:           ${AMI_ID} `);
  console.log(`Subnet:        ${SUBNET_ID} `);
  console.log(`SecurityGroup: ${SECURITY_GROUP_ID} `);
  console.log('================================================');
  console.log('');

  const command = new RunInstancesCommand(params);

  const response = await ec2Client.send(command);

  const instance = getInstanceFromResponse(response);

  if (!instance?.InstanceId) {
    throw new Error(
      'AWS created the request but did not return an EC2 instance ID.'
    );
  }

  console.log(
    `CartForge Learner Lab created: ${instance.InstanceId} `
  );

  return formatInstance(instance);
}

/*
|--------------------------------------------------------------------------
| Get Learner Lab
|--------------------------------------------------------------------------
*/

async function getLearnerLab(instanceId) {
  if (!instanceId) {
    throw new Error('instanceId is required.');
  }

  const response = await ec2Client.send(
    new DescribeInstancesCommand({
      InstanceIds: [instanceId]
    })
  );

  const instance = getInstanceFromResponse(response);

  if (!instance) {
    throw new Error(
      `Learner Lab instance '${instanceId}' was not found.`
    );
  }

  /*
   * SECURITY CHECK
   *
   * CartForge must never accidentally control the user's
   * classroom/old EC2 instance.
   */

  if (!isCartForgeLearnerLab(instance)) {
    throw new Error(
      `Instance '${instanceId}' is not a CartForge Learner Lab.`
    );
  }

  return formatInstance(instance);
}

/*
|--------------------------------------------------------------------------
| Verify CartForge Learner Lab
|--------------------------------------------------------------------------
*/

async function verifyCartForgeLab(instanceId) {
  if (!instanceId) {
    return false;
  }

  try {
    const response = await ec2Client.send(
      new DescribeInstancesCommand({
        InstanceIds: [instanceId]
      })
    );

    const instance = getInstanceFromResponse(response);

    if (!instance) {
      return false;
    }

    return isCartForgeLearnerLab(instance);
  } catch (error) {
    console.error(
      'verifyCartForgeLab error:',
      error.message
    );

    return false;
  }
}

/*
|--------------------------------------------------------------------------
| Tag Learner Lab
|--------------------------------------------------------------------------
*/

async function tagLearnerLab(instanceId, tags = {}) {
  if (!instanceId) {
    throw new Error('instanceId is required.');
  }

  const isValid = await verifyCartForgeLab(instanceId);

  if (!isValid) {
    throw new Error(
      'Refusing to tag this instance because it is not a CartForge Learner Lab.'
    );
  }

  const awsTags = Object.entries(tags)
    .map(([Key, Value]) => ({
      Key,
      Value: String(Value)
    }));

  if (awsTags.length === 0) {
    return {
      success: true,
      instanceId,
      message: 'No additional tags supplied.'
    };
  }

  await ec2Client.send(
    new CreateTagsCommand({
      Resources: [instanceId],
      Tags: awsTags
    })
  );

  return {
    success: true,
    instanceId,
    tags: awsTags
  };
}

/*
|--------------------------------------------------------------------------
| Destroy Learner Lab
|--------------------------------------------------------------------------
*/

async function destroyLearnerLab(instanceId) {
  if (!instanceId) {
    throw new Error('instanceId is required.');
  }

  const response = await ec2Client.send(
    new DescribeInstancesCommand({
      InstanceIds: [instanceId]
    })
  );

  const instance = getInstanceFromResponse(response);

  if (!instance) {
    throw new Error(
      `Instance '${instanceId}' was not found.`
    );
  }

  if (!isCartForgeLearnerLab(instance)) {
    throw new Error(
      `Refusing to terminate '${instanceId}'. ` +
      `It is not a CartForge Learner Lab.`
    );
  }

  console.log(
    `Terminating CartForge Learner Lab: ${instanceId} `
  );

  const terminateResponse = await ec2Client.send(
    new TerminateInstancesCommand({
      InstanceIds: [instanceId]
    })
  );

  const terminated =
    terminateResponse.TerminatingInstances?.[0];

  return {
    success: true,

    instanceId,

    previousState:
      terminated?.PreviousState?.Name ||
      instance.State?.Name ||
      'unknown',

    currentState:
      terminated?.CurrentState?.Name ||
      'shutting-down',

    message:
      'CartForge Learner Lab termination requested.'
  };
}

/*
|--------------------------------------------------------------------------
| SSM Status
|--------------------------------------------------------------------------
*/

async function getLearnerLabSSMStatus(instanceId) {
  if (!instanceId) {
    throw new Error('instanceId is required.');
  }

  const isValid = await verifyCartForgeLab(instanceId);

  if (!isValid) {
    throw new Error(
      'This instance is not a CartForge Learner Lab.'
    );
  }

  let lab;

  try {
    lab = await getLearnerLab(instanceId);
  } catch (error) {
    return {
      instanceId,
      ready: false,
      online: false,
      state: 'unknown',
      message: error.message
    };
  }

  if (
    lab.state !== 'running'
  ) {
    return {
      instanceId,
      ready: false,
      online: false,
      state: lab.state,
      message:
        `EC2 instance is currently '${lab.state}'. ` +
        `SSM will become available after the instance is running.`
    };
  }

  const response = await ssmClient.send(
    new DescribeInstanceInformationCommand({})
  );

  const information =
    (response.InstanceInformationList || [])
      .find(
        item =>
          item.InstanceId === instanceId
      );

  if (!information) {
    return {
      instanceId,
      ready: false,
      online: false,
      state: lab.state,
      message:
        'EC2 is running but SSM agent is not registered yet.'
    };
  }

  const pingStatus =
    information.PingStatus || 'Unknown';

  const online =
    pingStatus === 'Online';

  return {
    instanceId,

    ready: online,

    online,

    state: lab.state,

    pingStatus,

    platformName:
      information.PlatformName ||
      'Linux',

    platformVersion:
      information.PlatformVersion ||
      null,

    agentVersion:
      information.AgentVersion ||
      null,

    computerName:
      information.ComputerName ||
      null,

    message: online
      ? 'CartForge Learner Lab is ready for SSM commands and terminal access.'
      : 'SSM agent is registered but currently offline.'
  };
}

/*
|--------------------------------------------------------------------------
| Execute Command Through SSM
|--------------------------------------------------------------------------
*/

async function executeLearnerLabCommand(
  instanceId,
  command,
  options = {}
) {
  if (!instanceId) {
    throw new Error('instanceId is required.');
  }

  if (!command || !String(command).trim()) {
    throw new Error('command is required.');
  }

  const isValid = await verifyCartForgeLab(instanceId);

  if (!isValid) {
    throw new Error(
      'Refusing to execute command on a non-CartForge instance.'
    );
  }

  const ssmStatus =
    await getLearnerLabSSMStatus(instanceId);

  if (!ssmStatus.online) {
    throw new Error(
      ssmStatus.message ||
      'Learner Lab is not currently available through SSM.'
    );
  }

  const timeoutSeconds =
    Number(options.timeoutSeconds || 60);

  const commandResponse = await ssmClient.send(
    new SendCommandCommand({
      InstanceIds: [instanceId],

      DocumentName: 'AWS-RunShellScript',

      Parameters: {
        commands: [
          String(command)
        ]
      },

      TimeoutSeconds:
        Math.max(
          10,
          Math.min(timeoutSeconds, 300)
        )
    })
  );

  const commandId =
    commandResponse.Command?.CommandId;

  if (!commandId) {
    throw new Error(
      'SSM did not return a command ID.'
    );
  }

  /*
   * Wait for command completion.
   */

  const maxAttempts = 30;

  let lastInvocation = null;

  for (
    let attempt = 0;
    attempt < maxAttempts;
    attempt++
  ) {
    await new Promise(
      resolve => setTimeout(resolve, 1000)
    );

    try {
      const invocation =
        await ssmClient.send(
          new GetCommandInvocationCommand({
            CommandId: commandId,
            InstanceId: instanceId
          })
        );

      lastInvocation = invocation;

      const status =
        invocation.Status;

      if (
        [
          'Success',
          'Cancelled',
          'TimedOut',
          'Failed',
          'Cancelling'
        ].includes(status)
      ) {
        return {
          success:
            status === 'Success',

          instanceId,

          commandId,

          status,

          command,

          stdout:
            invocation.StandardOutputContent ||
            '',

          stderr:
            invocation.StandardErrorContent ||
            '',

          responseCode:
            invocation.ResponseCode,

          executionStartDateTime:
            invocation.ExecutionStartDateTime ||
            null,

          executionEndDateTime:
            invocation.ExecutionEndDateTime ||
            null
        };
      }
    } catch (error) {
      /*
       * SSM may need a few seconds before the invocation
       * becomes available. Continue polling.
       */

      lastInvocation = null;
    }
  }

  return {
    success: false,

    instanceId,

    commandId,

    status:
      lastInvocation?.Status ||
      'InProgress',

    command,

    stdout:
      lastInvocation?.StandardOutputContent ||
      '',

    stderr:
      lastInvocation?.StandardErrorContent ||
      '',

    message:
      'SSM command is still running. Poll the command again if required.'
  };
}

/*
|--------------------------------------------------------------------------
| Start Real SSM Terminal Session
|--------------------------------------------------------------------------
*/

async function startLearnerLabTerminalSession(instanceId) {
  const verified = await verifyCartForgeLab(instanceId);

  if (!verified.success) {
    return {
      success: false,
      error: verified.error || "CartForge learner lab verification failed.",
    };
  }

  const ssmStatus = await getLearnerLabSSMStatus(instanceId);

  if (!ssmStatus.success || !ssmStatus.ready || !ssmStatus.online) {
    return {
      success: false,
      error:
        ssmStatus.error ||
        "Learner lab is not ready for an SSM terminal session.",
      ssm: ssmStatus,
    };
  }

  try {
    console.log(
      `[CartForge][SSM] Starting interactive session for ${instanceId}`
    );

    const command = new StartSessionCommand({
      Target: instanceId,
    });

    const result = await ssmClient.send(command);

    console.log(
      "[CartForge][SSM] StartSession raw response:",
      JSON.stringify(
        {
          hasSession: Boolean(result && result.Session),
          sessionId: result?.Session?.SessionId || null,
          hasStreamUrl: Boolean(result?.Session?.StreamUrl),
          hasTokenValue: Boolean(result?.Session?.TokenValue),
        },
        null,
        2
      )
    );

    const session = result?.Session;

    if (!session) {
      return {
        success: false,
        error: "AWS SSM StartSession returned no Session object.",
      };
    }

    const sessionId = session.SessionId;
    const streamUrl = session.StreamUrl;
    const tokenValue = session.TokenValue;

    if (!sessionId || !streamUrl || !tokenValue) {
      return {
        success: false,
        error:
          "AWS SSM returned an incomplete terminal session. SessionId, StreamUrl, or TokenValue is missing.",
        session: {
          sessionId: sessionId || null,
          hasStreamUrl: Boolean(streamUrl),
          hasTokenValue: Boolean(tokenValue),
        },
      };
    }

    console.log(
      `[CartForge][SSM] Terminal session created: ${sessionId}`
    );

    return {
      success: true,
      instanceId,
      sessionId,
      streamUrl,
      tokenValue,
      region: AWS_REGION,
      target: instanceId,
      message: "AWS SSM terminal session created successfully.",
    };
  } catch (error) {
    console.error(
      "[CartForge][SSM] StartSession failed:",
      error
    );

    return {
      success: false,
      error:
        error?.message ||
        "Failed to create AWS SSM terminal session.",
      code: error?.name || null,
    };
  }
}
/*
|--------------------------------------------------------------------------
| Terminate SSM Terminal Session
|--------------------------------------------------------------------------
*/

async function terminateLearnerLabTerminalSession(
  sessionId
) {
  if (!sessionId) {
    throw new Error('sessionId is required.');
  }

  await ssmClient.send(
    new TerminateSessionCommand({
      SessionId: sessionId
    })
  );

  return {
    success: true,

    sessionId,

    message:
      'AWS SSM terminal session terminated.'
  };
}

/*
|--------------------------------------------------------------------------
| Configuration Information
|--------------------------------------------------------------------------
|
| This function DOES NOT create anything and DOES NOT incur an EC2
| creation charge. It is safe for the frontend to call.
|--------------------------------------------------------------------------
*/

function getLearnerLabConfig() {
  return {
    enabled: true,

    provider: 'aws',

    region: REGION,

    allowedInstanceTypes:
      [...ALLOWED_INSTANCE_TYPES],

    allowedStorage:
      [...ALLOWED_STORAGE],

    defaultInstanceType:
      DEFAULT_INSTANCE_TYPE,

    defaultStorage:
      DEFAULT_STORAGE,

    ubuntu: true,

    iamInstanceProfile:
      IAM_INSTANCE_PROFILE,

    configuration: {
      amiConfigured: Boolean(AMI_ID),
      subnetConfigured: Boolean(SUBNET_ID),
      securityGroupConfigured:
        Boolean(SECURITY_GROUP_ID),
      iamProfileConfigured:
        Boolean(IAM_INSTANCE_PROFILE)
    },

    architecture:
      'CartForge API -> Dedicated EC2 -> SSM',

    isolation:
      'Dedicated CartForge learner EC2 instance',

    note:
      'CartForge Learner Labs are separate from classroom or existing EC2 instances.'
  };
}

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

module.exports = {
  createLearnerLab,

  getLearnerLab,

  destroyLearnerLab,

  tagLearnerLab,

  verifyCartForgeLab,

  getLearnerLabSSMStatus,

  executeLearnerLabCommand,

  startLearnerLabTerminalSession,

  terminateLearnerLabTerminalSession,

  getLearnerLabConfig
};
