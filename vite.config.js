import { defineConfig } from 'vite';

/**
 * Custom Vite Plugin to provide a built-in CORS Proxy middleware
 * This forwards API calls from the browser through the local Vite dev/preview server,
 * bypassing browser Cross-Origin Resource Sharing (CORS) blocks completely.
 */
function corsProxyPlugin() {
  return {
    name: 'cors-proxy-middleware',
    configureServer(server) {
      addProxyMiddleware(server.middlewares);
    },
    configurePreviewServer(server) {
      addProxyMiddleware(server.middlewares);
    }
  };
}

function addProxyMiddleware(middlewares) {
  middlewares.use('/api-proxy', async (req, res) => {
    // Set permissive CORS headers for the frontend client
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', '*');

    // Handle preflight OPTIONS request immediately
    if (req.method === 'OPTIONS') {
      res.statusCode = 200;
      res.end();
      return;
    }

    try {
      const parsedReqUrl = new URL(req.url, 'http://localhost');
      const targetUrl = req.headers['x-target-url'] || parsedReqUrl.searchParams.get('url');

      if (!targetUrl) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          error: 'Missing Target URL',
          message: 'Please provide target URL in x-target-url header or ?url= query parameter'
        }));
        return;
      }

      // Read incoming request body if present
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      const bodyBuffer = Buffer.concat(chunks);

      // Clone and sanitize headers to forward
      const forwardHeaders = {};
      for (const [key, value] of Object.entries(req.headers)) {
        const lowerKey = key.toLowerCase();
        if (!['host', 'x-target-url', 'connection', 'content-length'].includes(lowerKey)) {
          forwardHeaders[key] = value;
        }
      }

      console.log(`\x1b[36m[CORS Proxy]\x1b[0m Forwarding ${req.method} request to: \x1b[35m${targetUrl}\x1b[0m`);

      // Make server-to-server request (no browser CORS restrictions apply here)
      const fetchResponse = await fetch(targetUrl, {
        method: req.method,
        headers: forwardHeaders,
        body: ['GET', 'HEAD'].includes(req.method) ? undefined : bodyBuffer
      });

      res.statusCode = fetchResponse.status;

      // Pass along content headers
      fetchResponse.headers.forEach((value, key) => {
        const lower = key.toLowerCase();
        if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(lower)) {
          res.setHeader(key, value);
        }
      });
      res.setHeader('Access-Control-Allow-Origin', '*');

      const responseBuffer = await fetchResponse.arrayBuffer();
      res.end(Buffer.from(responseBuffer));
    } catch (err) {
      console.error(`\x1b[31m[CORS Proxy Error]\x1b[0m ${err.message}`);
      res.statusCode = 502;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        error: 'CORS Proxy Gateway Error',
        message: err.message,
        hint: 'Check if the target server is reachable and active.'
      }));
    }
  });
}

export default defineConfig({
  plugins: [corsProxyPlugin()],
  server: {
    port: 5173,
    host: true
  },
  preview: {
    port: 4173,
    host: true
  }
});
