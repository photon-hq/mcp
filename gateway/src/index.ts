import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

interface RouteEntry {
  path: string;
  target: string;
}

function loadRoutes(): RouteEntry[] {
  const routes: RouteEntry[] = [];

  for (const [key, value] of Object.entries(process.env)) {
    if (key.startsWith("ROUTE_") && value) {
      const serviceName = key.replace("ROUTE_", "").toLowerCase();
      routes.push({ path: `/${serviceName}`, target: value });
    }
  }

  return routes;
}

const routes = loadRoutes();

if (routes.length === 0) {
  console.error("No ROUTE_* environment variables found. Gateway has nothing to proxy.");
  process.exit(1);
}

for (const route of routes) {
  console.log(`Routing ${route.path}/* -> ${route.target}`);

  app.use(
    route.path,
    createProxyMiddleware({
      target: route.target,
      changeOrigin: true,
      ws: true,
      on: {
        error(err, _req, res) {
          console.error(`Proxy error for ${route.path}:`, err.message);
          if ("writeHead" in res && typeof res.writeHead === "function") {
            (res as express.Response).status(502).json({
              jsonrpc: "2.0",
              error: { code: -32000, message: "Service unavailable" },
              id: null,
            });
          }
        },
      },
    }),
  );
}

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    routes: routes.map((r) => ({ path: r.path, target: r.target })),
  });
});

app.use((_req, res) => {
  res.status(404).json({
    jsonrpc: "2.0",
    error: { code: -32601, message: "Unknown service path" },
    id: null,
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Gateway listening on :${PORT}`);
  console.log(`Active routes: ${routes.map((r) => r.path).join(", ")}`);
});
