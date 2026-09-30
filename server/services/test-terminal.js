const WebSocket = require("ws");

const instanceId = "i-095df5db5c56441ee";

// Paste the NEW accessToken here locally.
// Do NOT send the token to me.
const accessToken = ": 9dbfd642805d5ff391d252d12b85c581bbf8f9297254c7a141bc5d483e2ad00f";

const url =
    `ws://localhost:5000/api/ec2/lab/${instanceId}/terminal?accessToken=${accessToken}`;

console.log("Connecting to:");
console.log(`ws://localhost:5000/api/ec2/lab/${instanceId}/terminal`);

const ws = new WebSocket(url);

ws.on("open", () => {
    console.log("");
    console.log("======================================");
    console.log("WEBSOCKET CONNECTED");
    console.log("======================================");
    console.log("");

    console.log("Sending test command...");

    // Session Manager Plugin uses its own protocol,
    // so for now we only test whether the connection
    // reaches the backend/plugin.
});

ws.on("message", (data) => {
    console.log("");
    console.log("----- MESSAGE FROM CARTFORGE -----");

    if (Buffer.isBuffer(data)) {
        console.log(data.toString());
    } else {
        console.log(data);
    }

    console.log("----------------------------------");
});

ws.on("error", (error) => {
    console.error("");
    console.error("WEBSOCKET ERROR:");
    console.error(error.message);
});

ws.on("close", (code, reason) => {
    console.log("");
    console.log(
        `WebSocket closed. Code=${code} Reason=${reason.toString()}`
    );
});

setTimeout(() => {
    console.log("");
    console.log("Closing test after 20 seconds...");
    ws.close();
}, 20000);