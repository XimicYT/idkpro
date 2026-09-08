const express = require('express');
const axios = require('axios');
const cors = require('cors');
const https = require('https'); 

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const PORT = process.env.PORT || 8080;

const secureBypassAgent = new https.Agent({ 
    rejectUnauthorized: false 
});

app.get('/tunnel', async (req, res) => {
    const targetStreamingServer = "https://thgilynoom.ddns.net:49443/";

    try {
        console.log(`[Proxy] Fetching root application package from: ${targetStreamingServer}`);
        
        const response = await axios.get(targetStreamingServer, {
            responseType: 'text',
            timeout: 10000,
            httpsAgent: secureBypassAgent,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ProxyTunnel/1.0'
            }
        });

        let htmlContent = response.data;

        // FIX: Inject a global base tag into the HTML head container.
        // This forces all sub-folder assets, scripts, and media buffers to fetch cleanly 
        // from your true server origin despite the address bar reading 'about:blank'.
        const baseHrefTag = `<head><base href="${targetStreamingServer}">`;
        htmlContent = htmlContent.replace(/<head>/i, baseHrefTag);

        // Clear tracking headers to bypass firewall block profiles
        res.removeHeader('X-Frame-Options');
        res.removeHeader('Content-Security-Policy');
        
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', 'text/html; charset=utf-8');

        res.send(htmlContent);

    } catch (err) {
        console.error(`[Error] Tunnel request failed: ${err.message}`);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.status(500).send(`<div style="color:red;font-family:monospace;padding:20px;background:#111;"><h3>Tunnel Fault</h3>${err.message}</div>`);
    }
});

app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send("Proxy Tunnel Core Operational.");
});

app.listen(PORT, () => {
    console.log(`=== Proxy Tunnel Engine Online ===`);
});



