import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  FIXED_HOST,
  FIXED_ORIGIN,
  FIXED_PORT,
  LOOPBACK_ADDRESSES,
  MAX_STORE_REQUEST_BYTES,
  STATIC_ASSETS,
  STORE_PATHS,
  isAllowedHost,
  isAllowedOrigin,
} from '../shared/contracts.mjs';
import {
  ADAPTER_ERROR_CODES,
  adapterErrorBody,
  httpStatusForAdapterCode,
  isJsonContentType,
} from '../shared/store-wire.mjs';
import { createStoreAdapter } from './store-adapter.mjs';

export const APP_ROOT = fileURLToPath(new URL('..', import.meta.url));

export { isAllowedHost, isAllowedOrigin };

export function resolveStaticAsset(requestUrl) {
  if (typeof requestUrl !== 'string' || requestUrl.length === 0) {
    return null;
  }

  const rawPath = extractRawPath(requestUrl);
  if (rawPath === null) {
    return null;
  }

  let decoded;
  try {
    decoded = decodeURIComponent(rawPath);
  } catch {
    return null;
  }

  if (!decoded.startsWith('/') || decoded.includes('\0') || decoded.includes('\\')) {
    return null;
  }

  const collapsed = decoded.replace(/\/{2,}/g, '/');
  const segments = collapsed.split('/');
  if (segments.includes('..') || segments.includes('.')) {
    return null;
  }

  return STATIC_ASSETS[collapsed] ?? null;
}

function extractRawPath(requestUrl) {
  const withoutFragment = requestUrl.split('#')[0];
  const withoutQuery = withoutFragment.split('?')[0];
  if (withoutQuery.startsWith('http://') || withoutQuery.startsWith('https://')) {
    const schemeEnd = withoutQuery.indexOf('://');
    const afterScheme = withoutQuery.slice(schemeEnd + 3);
    const pathStart = afterScheme.indexOf('/');
    if (pathStart === -1) {
      return '/';
    }
    return afterScheme.slice(pathStart);
  }
  return withoutQuery;
}


function sendText(res, status, body, extraHeaders = {}) {
  const payload = Buffer.from(body, 'utf8');
  res.writeHead(status, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Content-Length': payload.length,
    ...extraHeaders,
  });
  res.end(payload);
}

function sendJson(res, status, body) {
  const payload = Buffer.from(JSON.stringify(body), 'utf8');
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': payload.length,
  });
  res.end(payload);
}

function isStorePath(pathname) {
  return pathname === STORE_PATHS.offering || pathname === STORE_PATHS.job;
}

async function readRequestBody(req, maxBytes) {
  const chunks = [];
  let size = 0;
  let exceeded = false;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxBytes) {
      exceeded = true;
      continue;
    }
    chunks.push(chunk);
  }
  if (exceeded) {
    const error = new Error('request body exceeds 64 KiB');
    error.code = ADAPTER_ERROR_CODES.REQUEST_TOO_LARGE;
    throw error;
  }
  return Buffer.concat(chunks);
}

async function handleStorePost(req, res, adapter) {
  if (!isJsonContentType(req.headers['content-type'])) {
    try {
      await readRequestBody(req, MAX_STORE_REQUEST_BYTES);
    } catch {
      // drain only; the diagnostic is the content type
    }
    sendJson(
      res,
      httpStatusForAdapterCode(ADAPTER_ERROR_CODES.INVALID_CONTENT_TYPE),
      adapterErrorBody(ADAPTER_ERROR_CODES.INVALID_CONTENT_TYPE, 'Content-Type must be application/json'),
    );
    return;
  }

  let raw;
  try {
    raw = await readRequestBody(req, MAX_STORE_REQUEST_BYTES);
  } catch (error) {
    if (error.code === ADAPTER_ERROR_CODES.REQUEST_TOO_LARGE) {
      sendJson(
        res,
        httpStatusForAdapterCode(ADAPTER_ERROR_CODES.REQUEST_TOO_LARGE),
        adapterErrorBody(ADAPTER_ERROR_CODES.REQUEST_TOO_LARGE, 'request body exceeds 64 KiB'),
      );
      return;
    }
    sendJson(
      res,
      400,
      adapterErrorBody(ADAPTER_ERROR_CODES.MALFORMED_REQUEST, 'request body could not be read'),
    );
    return;
  }

  let body;
  try {
    body = JSON.parse(raw.toString('utf8'));
  } catch {
    sendJson(
      res,
      400,
      adapterErrorBody(ADAPTER_ERROR_CODES.MALFORMED_REQUEST, 'request body is not valid JSON'),
    );
    return;
  }

  const result = await adapter.dispatch(body);
  sendJson(res, result.status, result.body);
}

async function handleRequest(req, res, adapter) {
  if (!isAllowedHost(req.headers.host)) {
    sendText(res, 403, 'Forbidden host');
    return;
  }

  if (req.headers.origin !== undefined && !isAllowedOrigin(req.headers.origin)) {
    sendText(res, 403, 'Forbidden origin');
    return;
  }

  const rawPath = extractRawPath(req.url ?? '');
  const pathname = rawPath === null ? '' : rawPath.split('?')[0];

  if (isStorePath(pathname)) {
    if (req.method === 'POST') {
      await handleStorePost(req, res, adapter);
      return;
    }
    sendText(res, 405, 'Method not allowed', { Allow: 'POST' });
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    sendText(res, 405, 'Method not allowed', { Allow: 'GET, HEAD' });
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

  let bytes;
  try {
    bytes = await fs.readFile(absolutePath);
  } catch {
    sendText(res, 500, 'Asset unreadable');
    return;
  }

  res.writeHead(200, {
    'Content-Type': asset.contentType,
    'Content-Length': bytes.length,
  });
  res.end(req.method === 'HEAD' ? undefined : bytes);
}

function listen(server, host, port) {
  return new Promise((resolve, reject) => {
    const onError = (error) => {
      server.off('listening', onListening);
      reject(error);
    };
    const onListening = () => {
      server.off('error', onError);
      resolve(server.address());
    };
    server.once('error', onError);
    server.once('listening', onListening);
    server.listen({ host, port, exclusive: true });
  });
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

function occupiedError(port, cause) {
  const error = new Error(
    `STB static host failed: port ${port} is occupied on loopback. Refusing to select another port.`,
  );
  error.code = 'EADDRINUSE';
  error.cause = cause;
  return error;
}

export async function startServer({ port = FIXED_PORT, storeAdapter } = {}) {
  const adapter = storeAdapter ?? (await createStoreAdapter());
  const servers = [];

  try {
    for (const host of LOOPBACK_ADDRESSES) {
      const server = http.createServer((req, res) => {
        handleRequest(req, res, adapter).catch(() => {
          if (!res.headersSent) {
            sendText(res, 500, 'Internal error');
          }
        });
      });
      try {
        await listen(server, host, port);
        servers.push(server);
      } catch (error) {
        server.close();
        if (error.code === 'EADDRINUSE') {
          throw occupiedError(port, error);
        }
        if (error.code === 'EADDRNOTAVAIL' || error.code === 'EAFNOSUPPORT') {
          continue;
        }
        throw error;
      }
    }
  } catch (error) {
    await Promise.allSettled(servers.map(closeServer));
    throw error;
  }

  if (servers.length === 0) {
    throw new Error('STB static host failed: no loopback address could be bound.');
  }

  return {
    port,
    origin: FIXED_ORIGIN,
    addresses: servers.map((server) => server.address()),
    storeReady: adapter.ready === true,
    storeInspection: adapter.inspection ?? null,
    storeAdapter: adapter,
    async close() {
      await Promise.all(servers.map(closeServer));
    },
  };
}

function launchedAsMain() {
  const entry = process.argv[1];
  if (!entry) {
    return false;
  }
  return import.meta.url === pathToFileURL(path.resolve(entry)).href;
}

if (launchedAsMain()) {
  try {
    await startServer();
    console.log(`STB static host listening at ${FIXED_ORIGIN} (loopback only, host ${FIXED_HOST})`);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
