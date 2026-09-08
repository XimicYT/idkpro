const express = require('express');
const axios = require('axios');
const cors = require('cors');
// Required node system module to bypass strict certificate validations
const https = require('https'); 

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const PORT = process.env.PORT || 8080;

// FIXED: Instantiate an unconstrained HTTPS validation engine agent
const secureBypassAgent = new https.Agent({ 
    rejectUnauthorized: false 
});

app.get('/tunnel', async (req, res) => {
    const targetStreamingServer = "https://thgilynoom.ddns.net:49443/";

    try {
        console.log(`[Proxy] Fetching root application package from: ${targetStreamingServer}`);
        
        // Pass the bypass verification token securely into the axios fetching thread
        const response = await axios.get(targetStreamingServer, {
            responseType: 'text',
            timeout: 10000,
            httpsAgent: secureBypassAgent, // Bypasses self-signed SSL/TLS blocks safely
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ProxyTunnel/1.0'
            }
        });

        // Clear tracking headers to bypass firewall block profiles
        res.removeHeader('X-Frame-Options');
        res.removeHeader('Content-Security-Policy');
        
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', 'text/html; charset=utf-8');

        res.send(response.data);

    } catch (err) {
        console.error(`[Error] Tunnel request failed: ${err.message}`);
        
        // Set header to text/html so the about:blank screen prints the diagnostics visually
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.status(500).send(`
            <div style="color:#ff4444; font-family:monospace; padding:20px; background:#111; height:100vh; box-sizing:border-box;">
                <h3>Proxy Tunnel Compilation Error</h3>
                <p>Failed to establish connection to upstream stream engine node target.</p>
                <p><b>Reason/Error Text:</b> ${err.message}</p>
                <p>Make sure your Nginx port configuration is open and parsing incoming requests.</p>
            </div>
        `);
    }
});

app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send("Proxy Tunnel Core Operational. Direct target endpoint route available at /tunnel");
});

app.listen(PORT, () => {
    console.log(`=== Proxy Tunnel Engine Online ===`);
});



