"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

const RECONNECT_BASE_DELAY_MS = 1000;
const RECONNECT_MAX_DELAY_MS = 15000;
const FALLBACK_POLL_MS = 15000;
const CONNECT_TIMEOUT_MS = 5000;

export default function VetoLiveConnector({ matchID }: { matchID: number }) {
  const router = useRouter();
  const attemptRef = useRef(0);

  useEffect(() => {
    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let connectTimeoutTimer: ReturnType<typeof setTimeout> | null = null;
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    let disposed = false;

    function startPollingFallback() {
      if (pollTimer) return;
      pollTimer = setInterval(() => {
        if (document.visibilityState === "visible") router.refresh();
      }, FALLBACK_POLL_MS);
    }

    function stopPollingFallback() {
      if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
    }

    function clearConnectTimeout() {
      if (connectTimeoutTimer) {
        clearTimeout(connectTimeoutTimer);
        connectTimeoutTimer = null;
      }
    }

    function connect() {
      if (disposed) return;
      const protocol = window.location.protocol === "https:" ? "wss" : "ws";
      const pendingSocket = new WebSocket(
        `${protocol}://${window.location.host}/ws/veto?matchID=${matchID}`,
      );
      socket = pendingSocket;
      // Dev servers without the ws endpoint can hang the upgrade forever
      // (never open, never error), so a pending handshake must be killed
      // explicitly or neither the socket nor the polling fallback ever runs.
      connectTimeoutTimer = setTimeout(() => {
        if (pendingSocket.readyState === WebSocket.CONNECTING) {
          pendingSocket.close();
        }
      }, CONNECT_TIMEOUT_MS);
      pendingSocket.onopen = () => {
        attemptRef.current = 0;
        clearConnectTimeout();
        stopPollingFallback();
      };
      pendingSocket.onmessage = () => router.refresh();
      pendingSocket.onclose = () => {
        clearConnectTimeout();
        if (disposed) return;
        startPollingFallback();
        const delay = Math.min(
          RECONNECT_BASE_DELAY_MS * 2 ** attemptRef.current,
          RECONNECT_MAX_DELAY_MS,
        );
        attemptRef.current += 1;
        reconnectTimer = setTimeout(connect, delay);
      };
      pendingSocket.onerror = () => pendingSocket.close();
    }

    startPollingFallback();
    connect();
    return () => {
      disposed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      clearConnectTimeout();
      stopPollingFallback();
      socket?.close();
    };
  }, [matchID, router]);

  return null;
}
