import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import type { Socket } from 'node:net';

const DEFAULT_PROXY_HOST = 'proxy.apify.com';
const DEFAULT_PROXY_PORT = '8000';

function proxyAuthorization() {
  const password = process.env.APIFY_PROXY_PASSWORD;
  if (!password) return null;

  const username = process.env.APIFY_PROXY_USERNAME || 'auto';
  return `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
}

function openProxyTunnel(target: URL, authorization: string): Promise<Socket> {
  const request = httpRequest({
    hostname: process.env.APIFY_PROXY_HOSTNAME || DEFAULT_PROXY_HOST,
    port: Number(process.env.APIFY_PROXY_PORT || DEFAULT_PROXY_PORT),
    method: 'CONNECT',
    path: `${target.hostname}:${target.port || '443'}`,
    headers: { 'Proxy-Authorization': authorization },
  });

  return new Promise((resolve, reject) => {
    request.once('connect', (response, socket, head) => {
      if (response.statusCode !== 200) {
        socket.destroy();
        reject(new Error(`Apify proxy tunnel failed with status ${response.statusCode}`));
        return;
      }
      if (head.length) socket.unshift(head);
      resolve(socket);
    });
    request.once('error', reject);
    request.end();
  });
}

export async function fetchJsonViaApifyProxy(url: string, headers: Record<string, string>) {
  const authorization = proxyAuthorization();
  if (!authorization) return fetch(url, { headers });

  const target = new URL(url);
  const socket = await openProxyTunnel(target, authorization);

  return new Promise<Response>((resolve, reject) => {
    const request = httpsRequest({
      hostname: target.hostname,
      port: Number(target.port || 443),
      path: `${target.pathname}${target.search}`,
      method: 'GET',
      headers,
      agent: false,
      createConnection: () => socket,
    }, (response) => {
      const chunks: Buffer[] = [];
      response.on('data', (chunk: Buffer) => chunks.push(chunk));
      response.once('end', () => {
        const body = Buffer.concat(chunks);
        resolve(new Response(body, {
          status: response.statusCode || 502,
          headers: response.headers as HeadersInit,
        }));
      });
    });

    request.once('error', (error) => {
      socket.destroy();
      reject(error);
    });
    request.end();
  });
}
