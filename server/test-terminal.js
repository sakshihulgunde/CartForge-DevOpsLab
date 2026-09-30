const http = require("http");
const WebSocket = require("ws");

const INSTANCE_ID = "i-095df5db5c56441ee";
const BACKEND_HOST = "localhost";
const BACKEND_PORT = 5000;

function startTerminalSession() {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({});

    const request = http.request(
      {
        hostname: BACKEND_HOST,
        port: BACKEND_PORT,
        path: `/api/ec2/lab/${INSTANCE_ID}/terminal/start`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (response) => {
        let data = "";

        response.on("data", (chunk) => {
          data += chunk;
        });

        response.on("end", () => {
          try {
            const result = JSON.parse(data);

            if (!response.statusCode || response.statusCode >= 400) {
              reject(
                new Error(
                  result.message ||
                    result.error ||
                    `HTTP ${response.statusCode}`
                )
              );
              return;
            }

            if (!result.success) {
              reject(
                new Error(
                  result.message ||
                    result.error ||
                    "Terminal session could not be started."
                )
              );
              return;
            }

            resolve(result);
          } catch (error) {
            reject(
              new Error(
                `Invalid response from CartForge backend: ${data}`
              )
            );
          }
        });
      }
    );

    request.on("error", reject);

    request.write(body);
    request.end();
  });
}

async function main() {
  console.log("======================================");
  console.log("CARTFORGE REAL EC2 TERMINAL TEST");
  console.log("======================================");
  console.log("");

  console.log("Starting CartForge terminal session...");

  let session;

  try {
    session = await startTerminalSession();
  } catch (error) {
    console.error("");
    console.error("Terminal start failed:");
    console.error(error.message);
    console.error("");
    console.error(
      "If it says a terminal session is already active, restart jenkins-api.js once."
    );
    process.exit(1);
  }

  console.log("");
  console.log("Terminal session created successfully.");
  console.log(`Instance: ${session.instanceId}`);
  console.log(`Session: ${session.sessionId}`);
  console.log(`WebSocket path: ${session.websocketPath}`);
  console.log("");
  console.log("Connecting WebSocket...");
  console.log("");

  const wsUrl =
    `ws://${BACKEND_HOST}:${BACKEND_PORT}` +
    `${session.websocketPath}` +
    `?accessToken=${encodeURIComponent(session.accessToken)}`;

  const ws = new WebSocket(wsUrl);

  let commandIndex = 0;

  const commands = [
    "whoami",
    "pwd",
    "uname -a",
    "docker --version",
  ];

  let commandTimer = null;

  ws.on("open", () => {
    console.log("======================================");
    console.log("WEBSOCKET CONNECTED");
    console.log("======================================");
    console.log("");

    console.log("Waiting for the real EC2 shell...");
  });

  ws.on("message", (data) => {
    const message = data.toString();

    console.log("----- MESSAGE FROM CARTFORGE -----");
    console.log(message);
    console.log("----------------------------------");
    console.log("");

    /*
     * Once the shell prompt appears, start sending
     * real Linux commands through the WebSocket.
     */
    if (message.includes("$") || message.includes("#")) {
      if (commandIndex < commands.length) {
        const command = commands[commandIndex];

        commandIndex++;

        console.log(`>>> Sending real EC2 command: ${command}`);
        console.log("");

        ws.send(command + "\n");

        /*
         * Give the command time to execute before
         * sending the next command.
         */
        clearTimeout(commandTimer);

        commandTimer = setTimeout(() => {
          if (commandIndex < commands.length && ws.readyState === WebSocket.OPEN) {
            const nextCommand = commands[commandIndex];

            commandIndex++;

            console.log(`>>> Sending real EC2 command: ${nextCommand}`);
            console.log("");

            ws.send(nextCommand + "\n");
          }
        }, 2500);
      } else {
        console.log("");
        console.log("======================================");
        console.log("ALL REAL EC2 COMMANDS SENT");
        console.log("======================================");
        console.log("");

        setTimeout(() => {
          console.log("Closing WebSocket test...");
          ws.close();
        }, 3000);
      }
    }
  });

  ws.on("error", (error) => {
    console.error("");
    console.error("WEBSOCKET ERROR:");
    console.error(error.message);
    console.error("");
  });

  ws.on("close", (code, reason) => {
    clearTimeout(commandTimer);

    console.log("");
    console.log("WebSocket closed.");
    console.log(`Code=${code}`);
    console.log(`Reason=${reason.toString()}`);
    console.log("");

    process.exit(0);
  });

  setTimeout(() => {
    if (ws.readyState === WebSocket.OPEN) {
      console.log("");
      console.log("Test timeout reached. Closing WebSocket...");
      ws.close();
    }
  }, 30000);
}

main();