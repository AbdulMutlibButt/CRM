"use client";

import { useSyncExternalStore } from "react";
import { z } from "zod";

const messageSchema = z.object({ id: z.string(), sender: z.enum(["customer", "support"]), text: z.string().max(2000), at: z.string() });
const activitySchema = z.object({ id: z.string(), type: z.string(), text: z.string().max(500), at: z.string() });
const profileSchema = z.object({
  plan: z.string().default(""),
  monthlyFee: z.number().nonnegative().default(0),
  paymentMethod: z.string().default(""),
  paymentDate: z.string().default(""),
  lastPaymentDate: z.string().default(""),
  nextDueDate: z.string().default(""),
  paymentStatus: z.enum(["Not started", "Pending", "Paid"]).default("Not started"),
  packageStatus: z.enum(["Not selected", "Awaiting payment", "Awaiting approval", "Active", "Inactive"]).default("Not selected"),
  upgradeRequest: z.string().default(""),
  messages: z.array(messageSchema).max(100).default([]),
  activity: z.array(activitySchema).max(200).default([]),
});
export type PortalProfile = z.infer<typeof profileSchema>;
const profilesSchema = z.record(z.string(), profileSchema);
const key = "speed-vision-customer-portal-v1";
const eventName = "speed-vision-customer-portal";
let snapshot: Record<string, PortalProfile> | null = null;

function read() {
  if (!snapshot) {
    try { snapshot = profilesSchema.parse(JSON.parse(localStorage.getItem(key) || "{}")); }
    catch { snapshot = {}; }
  }
  return snapshot;
}
function subscribe(listener: () => void) {
  const sync = (event: StorageEvent) => { if (event.key === key) { snapshot = null; listener(); } };
  window.addEventListener("storage", sync); window.addEventListener(eventName, listener);
  return () => { window.removeEventListener("storage", sync); window.removeEventListener(eventName, listener); };
}
export function usePortalProfiles() { return useSyncExternalStore(subscribe, read, () => ({} as Record<string, PortalProfile>)); }
export function updatePortalProfile(username: string, change: (profile: PortalProfile) => PortalProfile) {
  const current = read();
  const base = profileSchema.parse(current[username] || {});
  const next = { ...current, [username]: profileSchema.parse(change(base)) };
  localStorage.setItem(key, JSON.stringify(next)); snapshot = next; window.dispatchEvent(new Event(eventName));
}
export function emptyPortalProfile() { return profileSchema.parse({}); }
