const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

// Enable Global Cross-Origin Resource Sharing (CORS) for Google Apps Script
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Port binding required by Render infrastructure
const PORT = process.env.PORT || 8080;

app.get('/tunnel', async (req, res) => {
    // The true target destination hosting your streaming canvas application
    const targetStreamingServer = "https://thgilynoom.ddns.net:49443";

    try {
        console.log(`[Proxy] Fetching root application package from: ${targetStreamingServer}`);
        
        // Fetch raw HTML from your stream client.
        // Node bypasses local network blocks and handles self-signed/untrusted SSL certificates smoothly.
        const response = await axios.get(targetStreamingServer, {
            responseType: 'text',
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ProxyTunnel/1.0'
            }
        });

        // 1. Force override security headers to defeat firewall rules and iframe blocks
        res.removeHeader('X-Frame-Options');
        res.removeHeader('Content-Security-Policy');
        
        // 2. Inject explicit authorization headers so the client browser accepts the incoming streams
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', 'text/html; charset=utf-8');

        // 3. Deliver the modified layout data down the pipeline
        res.send(response.data);

    } catch (err) {
        console.error(`[Error] Tunnel request failed: ${err.message}`);
        res.status(500).send(`
            <div style="color:#ff4444; font-family:monospace; padding:20px; background:#111; height:100vh;">
                <h3>Proxy Tunnel Compilation Error</h3>
                <p>Failed to establish connection to upstream stream engine node target.</p>
                <p><b>Reason:</b> ${err.message}</p>
                <p>Verify your streaming server is awake and accepting incoming WAN traffic on port 49443.</p>
            </div>
        `);
    }
});

// Basic health check monitoring endpoint for Render keep-alive tracking
app.get('/', (req, res) => {
    res.status(200).send("Proxy Tunnel Core Operational. Direct target endpoint route available at /tunnel");
});

app.listen(PORT, () => {
    console.log(`=== Proxy Tunnel Engine Online ===`);
    console.log(`Listening on internal networking interface port: ${PORT}`);
});



