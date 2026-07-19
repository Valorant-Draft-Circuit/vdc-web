"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

const RECONNECT_BASE_DELAY_MS = 1000;
const RECONNECT_MAX_DELAY_MS = 15000;
const FALLBACK_POLL_MS = 15000;

export default function VetoLiveConnector({ matchID }: { matchID: number }) {
  const router = useRouter();
  const attemptRef = useRef(0);

  useEffect(() => {
    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
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

    function connect() {
      if (disposed) return;
      const protocol = window.location.protocol === "https:" ? "wss" : "ws";
      socket = new WebSocket(
        `${protocol}://${window.location.host}/ws/veto?matchID=${matchID}`,
      );
      socket.onopen = () => {
        attemptRef.current = 0;
        stopPollingFallback();
      };
      socket.onmessage = () => router.refresh();
      socket.onclose = () => {
        if (disposed) return;
        startPollingFallback();
        const delay = Math.min(
          RECONNECT_BASE_DELAY_MS * 2 ** attemptRef.current,
          RECONNECT_MAX_DELAY_MS,
        );
        attemptRef.current += 1;
        reconnectTimer = setTimeout(connect, delay);
      };
      socket.onerror = () => socket?.close();
    }

    connect();
    return () => {
      disposed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      stopPollingFallback();
      socket?.close();
    };
  }, [matchID, router]);

  return null;
}
