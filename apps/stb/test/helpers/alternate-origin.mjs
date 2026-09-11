import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';

import { APP_ROOT, resolveStaticAsset } from '../../server/main.mjs';

export const ALTERNATE_PORT = 4318;
export const ALTERNATE_ORIGIN = 'http://localhost:4318';
export const ALTERNATE_HOST = 'localhost:4318';

function sendText(res, status, body) {
  const payload = Buffer.from(body, 'utf8');
  res.writeHead(status, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Content-Length': payload.length,
  });
  res.end(payload);
}

async function handleRequest(req, res) {
  if (req.headers.host !== ALTERNATE_HOST) {
    sendText(res, 403, 'Forbidden host');
    return;
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    sendText(res, 405, 'Method not allowed');
    return;
  }
  const asset = resolveStaticAsset(req.url);
  if (!asset) {
    sendText(res, 404, 'Not found');
    return;
  }
  const absolutePath = path.resolve(APP_ROOT, asset.relativePath);
  const relative = path.relative(APP_ROOT, absolutePath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    sendText(res, 404, 'Not found');
    return;
  }
  const bytes = await fs.readFile(absolutePath);
  res.writeHead(200, {
    'Content-Type': asset.contentType,
    'Content-Length': bytes.length,
  });
  res.end(req.method === 'HEAD' ? undefined : bytes);
}

export async function startAlternateOriginServer() {
  const server = http.createServer((req, res) => {
    handleRequest(req, res).catch(() => {
      if (!res.headersSent) {
        sendText(res, 500, 'Test origin failed');
      }
    });
  });
  await new Promise((resolve, reject) => {
    const onError = (error) => {
      server.close();
      if (error.code === 'EADDRINUSE') {
        reject(
          new Error(
            `Test-only alternate origin failed: port ${ALTERNATE_PORT} is occupied. The product origin remains 4317.`,
          ),
        );
        return;
      }
      reject(error);
    };
    server.once('error', onError);
    server.listen({ host: '127.0.0.1', port: ALTERNATE_PORT, exclusive: true }, () => {
      server.off('error', onError);
      resolve();
    });
  });
  return {
    origin: ALTERNATE_ORIGIN,
    port: ALTERNATE_PORT,
    close() {
      return new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    },
  };
}
