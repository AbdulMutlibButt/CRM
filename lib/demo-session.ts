"use client";

import { useSyncExternalStore } from "react";

// Browser-local demo session only. Server-side authentication is not configured.
const key = "speed-vision-demo-session-user";
const eventName = "speed-vision-demo-session";
let fallback: string | null = null;

function readSession() {
  try { return localStorage.getItem(key); }
  catch { return fallback; }
}

function subscribe(listener: () => void) {
  const onStorage = (event: StorageEvent) => { if (event.key === key || event.key === null) listener(); };
  window.addEventListener(eventName, listener);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(eventName, listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useDemoSession() {
  const username = useSyncExternalStore(subscribe, readSession, () => null);
  const setSession = (value: string | null) => {
    fallback = value;
    try { if (value) localStorage.setItem(key, value); else localStorage.removeItem(key); } catch { /* Retain the in-memory view when storage is unavailable. */ }
    window.dispatchEvent(new Event(eventName));
  };
  return [username, setSession] as const;
}
