const connect = require("connect");
const serveStatic = require("serve-static");
const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");

const app = connect();
app.use(serveStatic(__dirname));

const PORT_HTTP = 8080;
const PORT_HTTPS = 8081;

// Start HTTP server
http.createServer(app).listen(PORT_HTTP, () => {
    console.log(`HTTP Server running at http://localhost:${PORT_HTTP}`);
    console.log(`(Note: WebXR might only work on localhost for HTTP)`);
});

// Start HTTPS server (Recommended for Meta Quest 3)
const certPath = path.join(__dirname, 'cert.pem');
const keyPath = path.join(__dirname, 'key.pem');

if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    const options = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath)
    };
    https.createServer(options, app).listen(PORT_HTTPS, () => {
        console.log(`HTTPS Server running at https://localhost:${PORT_HTTPS}`);
        console.log(`Use this for Meta Quest 3 access over network.`);
    });
} else {
    console.log("\n--- HTTPS NOT CONFIGURED ---");
    console.log("To use WebXR on Meta Quest 3, you need HTTPS.");
    console.log("Please generate a self-signed certificate:");
    console.log("  openssl req -nodes -new -x509 -keyout key.pem -out cert.pem");
    console.log("----------------------------\n");
}
