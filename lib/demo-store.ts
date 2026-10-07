"use client";
import { useSyncExternalStore } from "react";
import { z } from "zod";

const text = z.string().max(4000);
const id = z.string().min(1).max(100);
const money = z.number().int().nonnegative().max(100000000000);
const customerSchema = z.object({ id, name: text.min(1), phone: text, area: text, username: text, monthlyFee: money, status: z.enum(["Active", "Suspended", "Trial", "Disconnected"]), ip: text, plan: text, notes: text, promise: text });
const staffSchema = z.object({ id, name: text.min(1), role: text, area: text, status: z.enum(["Online", "On route", "Offline"]) });
const deviceSchema = z.object({ id, name: text, ip: text, area: text, customerId: text, status: z.enum(["Online", "Offline", "Degraded"]), lastAction: text });
const alertSchema = z.object({ id, title: text, area: text, severity: z.enum(["Warning", "Critical"]), status: z.enum(["Open", "Resolved"]), createdAt: text, ticketId: text });
export const storeSchema = z.object({
  version: z.literal(2),
  customers: z.array(customerSchema).max(10000),
  invoices: z.array(z.object({ id, customerId: id, period: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/), amount: money, dueDate: text })).max(50000),
  payments: z.array(z.object({ id, invoiceId: id, amount: money, date: text, method: z.enum(["Cash", "Bank Transfer", "JazzCash", "Easypaisa", "Raast", "Cheque"]), reference: text })).max(50000),
  tickets: z.array(z.object({ id, customerId: id, subject: text, priority: z.enum(["Low", "Medium", "High", "Critical"]), status: z.enum(["Open", "In progress", "Resolved"]), assignedTo: text.nullable(), createdAt: text, resolvedAt: text.nullable(), messages: z.array(z.object({ id, author: text, text, createdAt: text })).max(1000) })).max(10000),
  staff: z.array(staffSchema).max(1000), devices: z.array(deviceSchema).max(10000), alerts: z.array(alertSchema).max(10000),
  expenses: z.array(z.object({ id, category: text, amount: money, date: text, notes: text })).max(10000),
  settings: z.object({ company: text.min(1), billingDay: z.number().int().min(1).max(28), dueDay: z.number().int().min(1).max(28), salesTax: z.number().min(0).max(100), withholdingTax: z.number().min(0).max(100), dark: z.boolean(), urdu: z.boolean(), integrations: z.record(text) }),
});
export type Store = z.infer<typeof storeSchema>;
export type DemoCustomer = Store["customers"][number];
export const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Karachi", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
export const newId = (prefix: string) => `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
export function seed(): Store {
  return {
    version: 2, customers: [], invoices: [], payments: [], tickets: [],
    staff: [{ id: "S1", name: "Hamza Iqbal", role: "Field technician", area: "Gulshan", status: "Online" }, { id: "S2", name: "Areej Fatima", role: "Support agent", area: "Head office", status: "Online" }],
    devices: [],
    alerts: [], expenses: [], settings: { company: "Speed vision", billingDay: 1, dueDay: 10, salesTax: 0, withholdingTax: 0, dark: false, urdu: false, integrations: {} },
  };
}
const key = "speed-vision-crm-v1";
let snapshot: Store | null = null;
let storageError = "";
const listeners = new Set<() => void>();
function read() {
  if (!snapshot) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) snapshot = seed();
      else {
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        if (parsed.version === 1) {
          snapshot = storeSchema.parse({ ...parsed, version: 2, customers: [], invoices: [], payments: [], tickets: [], devices: [], alerts: [] });
          localStorage.setItem(key, JSON.stringify(snapshot));
        } else snapshot = validateBackup(parsed);
      }
    }
    catch { storageError = "Saved data could not be read. Export a backup before replacing browser data."; snapshot = seed(); }
  }
  return snapshot;
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  const sync = (event: StorageEvent) => { if (event.key === key) { snapshot = null; listener(); } };
  window.addEventListener("storage", sync);
  return () => { listeners.delete(listener); window.removeEventListener("storage", sync); };
}
export function useStore() { return useSyncExternalStore(subscribe, read, () => null); }
export function getStorageError() { return storageError; }
export function updateStore(change: (current: Store) => Store) {
  if (storageError) throw new Error(storageError);
  const currentRaw = localStorage.getItem(key);
  const current = currentRaw ? validateBackup(JSON.parse(currentRaw)) : read();
  const next = storeSchema.parse(change(current));
  localStorage.setItem(key, JSON.stringify(next));
  snapshot = next;
  listeners.forEach(listener => listener());
}
export function validateBackup(input: unknown): Store {
  const data = storeSchema.parse(input);
  for (const rows of [data.customers, data.invoices, data.payments, data.tickets, data.staff, data.devices, data.alerts, data.expenses]) {
    if (new Set(rows.map(row => row.id)).size !== rows.length) throw new Error("Backup contains duplicate IDs.");
  }
  if (data.invoices.some(i => !data.customers.some(c => c.id === i.customerId)) || data.tickets.some(t => !data.customers.some(c => c.id === t.customerId)) || data.payments.some(p => !data.invoices.some(i => i.id === p.invoiceId))) throw new Error("Backup has missing linked records.");
  if (new Set(data.customers.map(c => c.username.toLowerCase())).size !== data.customers.length) throw new Error("Backup contains duplicate usernames.");
  if (new Set(data.invoices.map(i => `${i.customerId}:${i.period}`)).size !== data.invoices.length) throw new Error("Backup contains duplicate monthly invoices.");
  if (data.tickets.some(t => t.assignedTo && !data.staff.some(s => s.id === t.assignedTo)) || data.devices.some(d => d.customerId && !data.customers.some(c => c.id === d.customerId)) || data.alerts.some(a => a.ticketId && !data.tickets.some(t => t.id === a.ticketId))) throw new Error("Backup has missing assignments or linked devices/incidents.");
  if (data.invoices.some(i => data.payments.filter(p => p.invoiceId === i.id).reduce((n, p) => n + p.amount, 0) > i.amount)) throw new Error("Backup contains overpaid invoices.");
  return data;
}
export function restoreStore(input: unknown) {
  const next = validateBackup(input);
  localStorage.setItem(key, JSON.stringify(next)); snapshot = next; storageError = "";
  listeners.forEach(listener => listener());
}
