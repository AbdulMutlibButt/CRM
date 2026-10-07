"use client";

import { useSyncExternalStore } from "react";
import { z } from "zod";

export const employeeModuleIds = ["dashboard", "customers", "billing", "payments", "recovery", "tickets", "network", "devices", "reports", "staff", "settings", "technician"] as const;
export const customerModuleIds = ["portal", "packages", "my-billing", "support", "service-status", "upgrades"] as const;
export const moduleIds = [...employeeModuleIds, ...customerModuleIds] as const;
export type ModuleId = typeof moduleIds[number];
export type AccountType = "customer" | "employee";

export const moduleLabels: Record<ModuleId, string> = {
  dashboard: "Dashboard", customers: "Customers", billing: "Billing", payments: "Payments",
  recovery: "Recovery", tickets: "Tickets", network: "Network", devices: "Devices",
  reports: "Reports", staff: "Staff", settings: "Settings", technician: "Technician mobile",
  portal: "My dashboard", packages: "Internet packages", "my-billing": "Payments & schedule",
  support: "Support conversation", "service-status": "Service status", upgrades: "Upgrades & devices",
};

const userSchema = z.object({
  id: z.string().min(1).max(100),
  name: z.string().min(1).max(100),
  username: z.string().min(3).max(50),
  salt: z.string().min(1),
  passwordHash: z.string().min(1),
  modules: z.array(z.enum(moduleIds)).min(1),
  accountType: z.enum(["customer", "employee"]).default("employee"),
  customerId: z.string().default(""),
  active: z.boolean(),
  createdAt: z.string(),
});
const usersSchema = z.array(userSchema).max(100);
export type AccessUser = z.infer<typeof userSchema>;

const usersKey = "speed-vision-access-users-v1";
const usersEvent = "speed-vision-access-users";
let usersSnapshot: AccessUser[] | null = null;
const listeners = new Set<() => void>();

function readUsers(): AccessUser[] {
  if (!usersSnapshot) {
    try { usersSnapshot = usersSchema.parse(JSON.parse(localStorage.getItem(usersKey) || "[]")); }
    catch { usersSnapshot = []; }
  }
  return usersSnapshot;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const sync = (event: StorageEvent) => { if (event.key === usersKey) { usersSnapshot = null; listener(); } };
  window.addEventListener("storage", sync);
  window.addEventListener(usersEvent, listener);
  return () => { listeners.delete(listener); window.removeEventListener("storage", sync); window.removeEventListener(usersEvent, listener); };
}

function saveUsers(change: (users: AccessUser[]) => AccessUser[]) {
  const current = usersSchema.parse(JSON.parse(localStorage.getItem(usersKey) || "[]"));
  const next = usersSchema.parse(change(current));
  if (new Set(next.map(user => user.username.toLowerCase())).size !== next.length) throw new Error("Username already exists.");
  localStorage.setItem(usersKey, JSON.stringify(next));
  usersSnapshot = next;
  listeners.forEach(listener => listener());
  window.dispatchEvent(new Event(usersEvent));
}

const encode = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
const decode = (value: string) => Uint8Array.from(atob(value), char => char.charCodeAt(0));
async function derive(password: string, salt: Uint8Array) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: salt as BufferSource, iterations: 120000 }, key, 256);
  return encode(new Uint8Array(bits));
}

export function useAccessUsers() { return useSyncExternalStore(subscribe, readUsers, () => [] as AccessUser[]); }

function validModules(accountType: AccountType, modules: ModuleId[]) {
  const allowed = accountType === "customer" ? customerModuleIds : employeeModuleIds;
  const selected = modules.filter((module): module is ModuleId => (allowed as readonly string[]).includes(module));
  if (!selected.length) throw new Error(`Select at least one ${accountType} module.`);
  return [...new Set(selected)];
}

export async function createAccessUser(input: { name: string; username: string; password: string; modules: ModuleId[]; accountType: AccountType; customerId?: string; active: boolean }) {
  const username = input.username.trim().toLowerCase();
  if (!/^[a-z0-9._-]{3,50}$/.test(username) || username === "test") throw new Error("Use a unique 3–50 character username with letters, numbers, dots, dashes or underscores.");
  if (input.password.length < 6) throw new Error("Password must contain at least 6 characters.");
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const user: AccessUser = { id: crypto.randomUUID(), name: input.name.trim(), username, salt: encode(salt), passwordHash: await derive(input.password, salt), modules: validModules(input.accountType, input.modules), accountType: input.accountType, customerId: input.accountType === "customer" ? input.customerId || "" : "", active: input.active, createdAt: new Date().toISOString() };
  saveUsers(users => [...users, user]);
}

export async function updateAccessUser(id: string, input: { name: string; username: string; password?: string; modules: ModuleId[]; accountType: AccountType; customerId?: string; active: boolean }) {
  const username = input.username.trim().toLowerCase();
  if (!/^[a-z0-9._-]{3,50}$/.test(username) || username === "test") throw new Error("Use a unique 3–50 character username with letters, numbers, dots, dashes or underscores.");
  let passwordRecord: Pick<AccessUser, "salt" | "passwordHash"> | null = null;
  if (input.password) {
    if (input.password.length < 6) throw new Error("Password must contain at least 6 characters.");
    const salt = crypto.getRandomValues(new Uint8Array(16));
    passwordRecord = { salt: encode(salt), passwordHash: await derive(input.password, salt) };
  }
  saveUsers(users => users.map(user => user.id === id ? { ...user, name: input.name.trim(), username, modules: validModules(input.accountType, input.modules), accountType: input.accountType, customerId: input.accountType === "customer" ? input.customerId || "" : "", active: input.active, ...(passwordRecord || {}) } : user));
}

export async function authenticateAccessUser(usernameInput: string, password: string): Promise<{ username: string; name: string; modules: ModuleId[]; accountType: AccountType; customerId: string; admin: boolean } | null> {
  const username = usernameInput.trim().toLowerCase();
  if (username === "test" && password === "123456") return { username: "test", name: "Test administrator", modules: [...employeeModuleIds], accountType: "employee", customerId: "", admin: true };
  const user = readUsers().find(candidate => candidate.username === username && candidate.active);
  if (!user || !password) return null;
  const candidate = await derive(password, decode(user.salt));
  if (candidate !== user.passwordHash) return null;
  return { username: user.username, name: user.name, modules: user.modules, accountType: user.accountType, customerId: user.customerId, admin: false };
}

export function accessIdentity(username: string | null, users: AccessUser[]) {
  if (username === "test") return { username: "test", name: "Test administrator", modules: [...employeeModuleIds] as ModuleId[], accountType: "employee" as const, customerId: "", admin: true };
  const user = users.find(candidate => candidate.username === username && candidate.active);
  return user ? { username: user.username, name: user.name, modules: user.modules, accountType: user.accountType, customerId: user.customerId, admin: false } : null;
}
