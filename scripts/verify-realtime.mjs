/**
 * Verificação rápida: login + STOMP via proxy Next (/ws-kumbu/chat).
 * Uso: node scripts/verify-realtime.mjs [email] [password]
 */
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const email = process.argv[2] ?? "admin@kumbu.app";
const password = process.argv[3] ?? "Admin123!";
const apiBase = "http://127.0.0.1:8080/api/v1";
const wsEndpoint = "http://127.0.0.1:3000/ws-kumbu/chat";

async function login() {
  const res = await fetch(`${apiBase}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Login falhou (${res.status}): ${text}`);
  }
  const data = await res.json();
  const token = data.accessToken ?? data.access_token;
  if (!token) throw new Error("Resposta de login sem accessToken");
  return token;
}

function connectStomp(token) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("STOMP timeout (15s)")), 15_000);
    const client = new Client({
      reconnectDelay: 0,
      webSocketFactory: () => new SockJS(wsEndpoint),
      connectHeaders: { Authorization: `Bearer ${token}` },
      onConnect: () => {
        clearTimeout(timeout);
        let subs = 0;
        client.subscribe("/user/queue/notifications", () => {
          subs += 1;
        });
        client.subscribe("/user/queue/messages", () => {
          subs += 1;
        });
        setTimeout(() => {
          client.deactivate();
          resolve({ connected: true, subscriptions: subs });
        }, 500);
      },
      onStompError: (frame) => {
        clearTimeout(timeout);
        reject(new Error(`STOMP error: ${frame.headers?.message ?? "unknown"}`));
      },
      onWebSocketClose: () => {
        /* handled by timeout or success */
      },
    });
    client.activate();
  });
}

async function main() {
  console.log("1. Login…", email);
  const token = await login();
  console.log("   OK — token obtido");

  console.log("2. SockJS info (proxy)…");
  const info = await fetch(`${wsEndpoint}/info`).then((r) => r.json());
  if (!info.websocket) throw new Error("SockJS info sem websocket");
  console.log("   OK — websocket:", info.websocket);

  console.log("3. STOMP CONNECT + subscrições…");
  const result = await connectStomp(token);
  console.log("   OK — ligado, subscrições:", result.subscriptions);

  console.log("\n✓ Tempo real verificado com sucesso.");
}

main().catch((err) => {
  console.error("\n✗ Falha:", err.message);
  process.exit(1);
});
