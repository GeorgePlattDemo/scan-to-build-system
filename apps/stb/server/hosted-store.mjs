import http from 'node:http';

import { STORE_PATHS } from '../shared/contracts.mjs';
import { createStoreAdapter } from './store-adapter.mjs';
import { handleStorePost } from './main.mjs';

export const PUBLIC_REVIEW_ORIGIN = 'https://georgeplattdemo.github.io';

function sendText(res, status, body, extraHeaders = {}) {
  const payload = Buffer.from(body, 'utf8');
  res.writeHead(status, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Content-Length': payload.length,
    ...extraHeaders,
  });
  res.end(payload);
}

function applyCors(res) {
  res.setHeader('Access-Control-Allow-Origin', PUBLIC_REVIEW_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '600');
  res.setHeader('Vary', 'Origin');
}

function isStorePath(pathname) {
  return pathname === STORE_PATHS.offering || pathname === STORE_PATHS.job;
}

function requestPath(req) {
  try {
    return new URL(req.url ?? '/', 'http://stb.invalid').pathname;
  } catch {
    return '';
  }
}

function closeServer(server) {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

export async function startHostedStore({
  host = process.env.HOST?.trim() || '0.0.0.0',
  port = Number(process.env.PORT || 4317),
  storeAdapter,
} = {}) {
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error('Hosted Store Zero requires a valid PORT.');
  }

  const adapter = storeAdapter ?? (await createStoreAdapter());
  if (adapter.ready !== true) {
    const details = adapter.inspection?.details;
    throw new Error(
      'Hosted Store Zero refused to start because the pinned Store source is unavailable: ' +
        (typeof details === 'string' ? details : JSON.stringify(details ?? adapter.inspection ?? null)),
    );
  }

  const server = http.createServer((req, res) => {
    const pathname = requestPath(req);

    if (pathname === '/healthz') {
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        sendText(res, 405, 'Method not allowed', { Allow: 'GET, HEAD' });
        return;
      }
      sendText(res, 200, 'ok');
      return;
    }

    if (!isStorePath(pathname)) {
      sendText(res, 404, 'Not found');
      return;
    }

    if (req.headers.origin !== PUBLIC_REVIEW_ORIGIN) {
      sendText(res, 403, 'Forbidden origin');
      return;
    }

    applyCors(res);

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.method !== 'POST') {
      sendText(res, 405, 'Method not allowed', { Allow: 'POST, OPTIONS' });
      return;
    }

    handleStorePost(req, res, adapter).catch(() => {
      if (!res.headersSent) {
        sendText(res, 500, 'Internal error');
      } else {
        res.destroy();
      }
    });
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen({ host, port, exclusive: true }, resolve);
  });

  const address = server.address();
  return {
    host,
    port: typeof address === 'object' && address ? address.port : port,
    address,
    storeReady: true,
    storeInspection: adapter.inspection ?? null,
    async close() {
      await closeServer(server);
    },
  };
}
