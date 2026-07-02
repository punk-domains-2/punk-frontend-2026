const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "out");
const PORT = Number(process.env.PORT) || 8080;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".webmanifest": "application/manifest+json",
  ".txt": "text/plain; charset=utf-8",
};

function resolveFile(urlPath) {
  const pathname = decodeURIComponent(urlPath.split("?")[0].split("#")[0]);
  const safePath = pathname.replace(/^\/+/, "");

  const candidates = [
    safePath,
    `${safePath}.html`,
    path.join(safePath, "index.html"),
  ].map((p) => path.normalize(p).replace(/^(\.\.(\/|\\|$))+/, ""));

  for (const candidate of candidates) {
    const filePath = path.join(ROOT, candidate);
    if (!filePath.startsWith(ROOT)) continue;
    try {
      const stat = fs.statSync(filePath);
      if (stat.isFile()) return filePath;
    } catch {
      /* not found */
    }
  }

  return null;
}

function sendFile(res, filePath, statusCode = 200) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";
  res.writeHead(statusCode, {
    "Content-Type": contentType,
    "Cache-Control":
      ext === ".html" ? "no-cache" : "public, max-age=31536000, immutable",
  });
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer((req, res) => {
  if (!req.url) {
    res.writeHead(400);
    res.end("Bad Request");
    return;
  }

  const filePath = resolveFile(req.url) ?? resolveFile("/");
  if (!filePath) {
    const notFound = path.join(ROOT, "404.html");
    if (fs.existsSync(notFound)) {
      sendFile(res, notFound, 404);
      return;
    }
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
    return;
  }

  sendFile(res, filePath);
});

server.listen(PORT);
