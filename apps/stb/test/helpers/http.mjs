import http from 'node:http';
import net from 'node:net';

import { FIXED_HOST, FIXED_PORT } from '../../shared/contracts.mjs';

export function rawRequest({
  hostname = '127.0.0.1',
  port = FIXED_PORT,
  path = '/',
  method = 'GET',
  headers = {},
  body = undefined,
} = {}) {
  return new Promise((resolve, reject) => {
    const payload = body === undefined || body === null ? null : Buffer.from(body);
    const request = http.request(
      {
        hostname,
        port,
        path,
        method,
        headers: {
          Host: FIXED_HOST,
          ...(payload ? { 'Content-Length': String(payload.length) } : {}),
          ...headers,
        },
      },
      (response) => {
        const chunks = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => {
          resolve({
            status: response.statusCode,
            headers: response.headers,
            body: Buffer.concat(chunks).toString('utf8'),
            bytes: Buffer.concat(chunks),
          });
        });
      },
    );
    request.on('error', reject);
    if (payload) {
      request.write(payload);
    }
    request.end();
  });
}

export function postJson(path, body, extraHeaders = {}) {
  return rawRequest({
    method: 'POST',
    path,
    headers: {
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

export function occupyPort(host, port) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', reject);
    server.listen({ host, port, exclusive: true }, () => {
      resolve({
        async close() {
          await new Promise((closeResolve, closeReject) => {
            server.close((error) => {
              if (error) {
                closeReject(error);
                return;
              }
              closeResolve();
            });
          });
        },
      });
    });
  });
}

export function connect(host, port) {
  return new Promise((resolve) => {
    const socket = net.connect({ host, port });
    socket.once('connect', () => {
      socket.end();
      resolve({ connected: true });
    });
    socket.once('error', (error) => {
      resolve({ connected: false, code: error.code });
    });
  });
}
