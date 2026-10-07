"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Activity, Users, CreditCard, Wallet, Headphones, Network, Router, FileBarChart, Settings, Wrench, LayoutDashboard, Menu, Plus, Moon, Sun, Bell, Search, Download, LogOut, X, UserCog, Package, MessageCircle, Wifi, ArrowUpCircle, CalendarClock } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { useDemoSession } from "@/lib/demo-session";
import { accessIdentity, authenticateAccessUser, createAccessUser, customerModuleIds, employeeModuleIds, moduleIds, moduleLabels, updateAccessUser, useAccessUsers, type AccountType, type ModuleId } from "@/lib/demo-access";
import { emptyPortalProfile, updatePortalProfile, usePortalProfiles } from "@/lib/customer-portal";
import LoginScreen from "@/components/login-screen";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useStore, updateStore, restoreStore, getStorageError, today, newId, type Store } from "@/lib/demo-store";
import { toPaisa, outstanding, recordPayment, previewBilling, invoiceStatus, resolveTicket, exportCsv, type Payment } from "@/lib/crm";

const navigation = [
  ["dashboard", "Dashboard", "ڈیش بورڈ", LayoutDashboard], ["customers", "Customers", "صارفین", Users],
  ["billing", "Billing", "بلنگ", CreditCard], ["payments", "Payments", "ادائیگیاں", Wallet],
  ["recovery", "Recovery", "وصولی", Activity], ["tickets", "Tickets", "شکایات", Headphones],
  ["network", "Network", "نیٹ ورک", Network], ["devices", "Devices", "آلات", Router],
  ["reports", "Reports", "رپورٹس", FileBarChart], ["staff", "Staff", "عملہ", Users],
  ["users", "Users & Access", "صارف رسائی", UserCog],
  ["settings", "Settings", "ترتیبات", Settings], ["technician", "Technician mobile", "ٹیکنیشن", Wrench],
  ["portal", "My dashboard", "میرا ڈیش بورڈ", LayoutDashboard], ["packages", "Internet packages", "پیکیجز", Package],
  ["my-billing", "Payments & schedule", "ادائیگی", CalendarClock], ["support", "Support conversation", "مدد", MessageCircle],
  ["service-status", "Service status", "سروس اسٹیٹس", Wifi], ["upgrades", "Upgrades & devices", "اپ گریڈ", ArrowUpCircle],
] as const;
type Screen = typeof navigation[number][0];
type Field = { key: string; label: string; type?: string; value?: string; options?: { value: string; label: string }[]; optional?: boolean; min?: string; max?: string; step?: string; visibleFor?: AccountType };
type Form = { title: string; description?: string; fields: Field[]; submit: (values: Record<string, string>) => void | Promise<void>; button?: string };
type Row = Record<string, string | number>;
const money = (amount: number) => new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount / 100);
const options = (values: string[]) => values.map(value => ({ value, label: value }));
const addMonth = (date: string) => { const value = new Date(`${date}T12:00:00Z`); value.setUTCMonth(value.getUTCMonth() + 1); return value.toISOString().slice(0, 10); };
const daysUntil = (date: string) => date ? Math.ceil((new Date(`${date}T12:00:00Z`).getTime() - new Date(`${today()}T12:00:00Z`).getTime()) / 86400000) : null;
const internetPackages = [
  { name: "Home 20", speed: "20 Mbps", fee: 280000, detail: "Everyday browsing and HD streaming" },
  { name: "Family 50", speed: "50 Mbps", fee: 450000, detail: "Multiple devices, gaming and 4K video" },
  { name: "Power 100", speed: "100 Mbps", fee: 750000, detail: "Heavy usage, work and smart homes" },
];
const errorText = (error: unknown) => error instanceof Error ? error.message : "Could not save. Please check your input.";
function download(name: string, contents: string, type = "text/csv;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const link = document.createElement("a"); link.href = url; link.download = name; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function whatsapp(phone: string, message: string) {
  let number = phone.replace(/\D/g, "");
  if (number.startsWith("0")) number = `92${number.slice(1)}`;
  if (!/^\d{10,15}$/.test(number)) throw new Error("Add a valid customer phone number first.");
  window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
}
function printRows(title: string, rows: Row[]) {
  const popup = window.open("", "_blank");
  if (!popup) throw new Error("Allow pop-ups to open the print preview.");
  const escape = (value: unknown) => String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
  const columns = rows.length ? Object.keys(rows[0]) : [];
  popup.opener = null;
  popup.document.write(`<html><head><title>${escape(title)}</title><style>body{font:14px system-ui;padding:32px;color:#172033}table{border-collapse:collapse;width:100%}td,th{padding:12px;border:1px solid #ddd;text-align:left}h1{color:#0575b5}@media print{button{display:none}}</style></head><body><h1>${escape(title)}</h1><p>Browser demo records · ${escape(today())}</p><button onclick="window.print()">Print / Save as PDF</button><table><thead><tr>${columns.map(c => `<th>${escape(c)}</th>`).join("")}</tr></thead><tbody>${rows.map(row => `<tr>${columns.map(c => `<td>${escape(row[c])}</td>`).join("")}</tr>`).join("")}</tbody></table></body></html>`);
  popup.document.close();
}
function Panel({ children }: { children: React.ReactNode }) { return <section className="crm-panel">{children}</section>; }
function DataTable({ title, rows, actions, search = "" }: { title: string; rows: Row[]; search?: string; actions?: (id: string) => React.ReactNode }) {
  const [query, setQuery] = useState(""); const [filter, setFilter] = useState(""); const [page, setPage] = useState(1);
  const [sort, setSort] = useState(""); const [descending, setDescending] = useState(false);
  const columns = rows.length ? Object.keys(rows[0]) : [];
  const filtered = rows.filter(row => (!filter || row.Status === filter) && Object.values(row).join(" ").toLowerCase().includes((search || query).trim().toLowerCase()));
  const sorted = [...filtered].sort((a, b) => sort ? String(a[sort]).localeCompare(String(b[sort]), undefined, { numeric: true }) * (descending ? -1 : 1) : 0);
  const pages = Math.max(1, Math.ceil(sorted.length / 8)); const current = Math.min(page, pages);
  return <Panel><div className="crm-toolbar"><label className="crm-search"><Search size={16} /><input aria-label={`Search ${title}`} placeholder={`Search ${title.toLowerCase()}...`} value={search || query} onChange={e => { setQuery(e.target.value); setPage(1); }} readOnly={!!search} /></label>
    {columns.includes("Status") && <select aria-label={`Filter ${title} status`} value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }}><option value="">All statuses</option>{[...new Set(rows.map(r => r.Status))].map(s => <option key={s}>{s}</option>)}</select>}
    <Button variant="outline" onClick={() => download(`${title}.csv`, exportCsv(sorted))}><Download size={16} /> Export CSV</Button></div>
    <div className="crm-table-scroll"><table><thead><tr>{columns.map(c => <th key={c}><button onClick={() => { setSort(c); setDescending(sort === c && !descending); }}>{c}{sort === c ? descending ? " ↓" : " ↑" : ""}</button></th>)}{actions && <th>Actions</th>}</tr></thead><tbody>{sorted.slice((current - 1) * 8, current * 8).map(row => <tr key={row.ID}>{columns.map(c => <td key={c}>{c === "Status" ? <span className="crm-status">{row[c]}</span> : row[c]}</td>)}{actions && <td><div className="crm-actions">{actions(String(row.ID))}</div></td>}</tr>)}</tbody></table></div>
    {!filtered.length && <p className="crm-empty">No records match. Add a record or change your search.</p>}
    <div className="crm-toolbar"><span>{sorted.length ? (current - 1) * 8 + 1 : 0}–{Math.min(current * 8, sorted.length)} of {sorted.length}</span><Button variant="outline" disabled={current <= 1} onClick={() => setPage(current - 1)}>Previous</Button><span>{current} / {pages}</span><Button variant="outline" disabled={current >= pages} onClick={() => setPage(current + 1)}>Next</Button></div>
  </Panel>;
}
function Editor({ form, close }: { form: Form; close: () => void }) {
  const [error, setError] = useState(""); const busy = useRef(false);
  const [accountType, setAccountType] = useState<AccountType>((form.fields.find(field => field.key === "accountType")?.value as AccountType) || "employee");
  return <Dialog open onOpenChange={open => { if (!open) close(); }}><DialogContent className="crm-editor max-h-[90vh] overflow-auto"><DialogHeader><DialogTitle>{form.title}</DialogTitle><DialogDescription>{form.description || "Changes are saved in this browser."}</DialogDescription></DialogHeader>
    <form onSubmit={async event => { event.preventDefault(); if (busy.current) return; busy.current = true; try { const values = Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>; await form.submit(values); close(); } catch (error) { setError(errorText(error)); } finally { busy.current = false; } }}>
      {form.fields.map(field => {
        if (field.visibleFor && field.visibleFor !== accountType) return null;
        if (field.type === "modules") {
          const available = accountType === "customer" ? customerModuleIds : employeeModuleIds;
          return <fieldset className="crm-module-picker" key={`${field.key}-${accountType}`}><legend>{field.label}</legend><p>{accountType === "customer" ? "Customer portal modules" : "Employee CRM & ERP modules"} — select what this user can open.</p><div>{available.map(id => <label key={id}><input type="checkbox" name={`module__${id}`} defaultChecked={(field.value || "").split(",").includes(id) || (accountType === "customer" && id === "portal")} /> <span>{moduleLabels[id]}</span></label>)}</div></fieldset>;
        }
        return <label className="crm-field" key={field.key}>{field.label}{field.options ? <select name={field.key} required={!field.optional} defaultValue={field.value ?? ""} onChange={field.key === "accountType" ? event => setAccountType(event.target.value as AccountType) : undefined}><option value="" disabled={!field.optional}>Select…</option>{field.options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : field.type === "textarea" ? <textarea name={field.key} required={!field.optional} defaultValue={field.value} maxLength={4000} /> : <input name={field.key} type={field.type || "text"} defaultValue={field.value} required={!field.optional} min={field.min} max={field.max} step={field.step} maxLength={4000} />}</label>;
      })}
      {error && <p role="alert" className="crm-error">{error}</p>}<div className="crm-actions"><Button type="button" variant="outline" onClick={close}>Cancel</Button><Button type="submit">{form.button || "Save"}</Button></div>
    </form></DialogContent></Dialog>;
}

export default function CRMWorkspace() {
  const data = useStore();
  const [screen, setScreen] = useState<Screen>("dashboard"); const [menu, setMenu] = useState(false);
  const accessUsers = useAccessUsers();
  const portalProfiles = usePortalProfiles();
  const [sessionUsername, setSessionUsername] = useDemoSession();
  const identity = accessIdentity(sessionUsername, accessUsers);
  const accessibleNavigation = navigation.filter(([id]) => identity?.admin ? id === "users" || (employeeModuleIds as readonly string[]).includes(id) : id !== "users" && identity?.modules.includes(id as ModuleId));
  const activeScreen: Screen = accessibleNavigation.some(([id]) => id === screen) ? screen : (accessibleNavigation[0]?.[0] || "dashboard");
  const [form, setForm] = useState<Form | null>(null); const [detail, setDetail] = useState<{ kind: "customer" | "ticket" | "staff" | "device"; id: string } | null>(null);
  const [globalSearch, setGlobalSearch] = useState("");
  const [technician, setTechnician] = useState(""); const [report, setReport] = useState("collections"); const [from, setFrom] = useState(""); const [to, setTo] = useState("");
  const restoreFile = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!data) return;
    try {
      const storedAccounts = JSON.parse(localStorage.getItem("speed-vision-access-users-v1") || "[]");
      if (Array.isArray(storedAccounts) && storedAccounts.length > 0 && accessUsers.length === 0) return;
    } catch { return; }
    const accounts = accessUsers.filter(user => user.accountType === "customer");
    const allowedIds = new Set(accounts.map(user => user.customerId || `CUS-${user.username}`));
    const customers: Store["customers"] = accounts.map(user => {
      const id = user.customerId || `CUS-${user.username}`; const current = data.customers.find(customer => customer.id === id || customer.username === user.username);
      const profile = portalProfiles[user.username] || emptyPortalProfile();
      return { id, name: user.name, phone: current?.phone || "", area: current?.area || "", username: user.username, monthlyFee: profile.monthlyFee || current?.monthlyFee || 0, status: !user.active ? "Disconnected" : current?.status || "Trial", ip: current?.ip || "", plan: current?.plan || profile.plan || "", notes: current?.notes || "Created automatically from Users & Access.", promise: current?.promise || "" };
    });
    const changed = JSON.stringify(customers) !== JSON.stringify(data.customers);
    if (!changed) return;
    updateStore(state => {
      const removedInvoiceIds = new Set(state.invoices.filter(invoice => !allowedIds.has(invoice.customerId)).map(invoice => invoice.id));
      const tickets = state.tickets.filter(ticket => allowedIds.has(ticket.customerId));
      const ticketIds = new Set(tickets.map(ticket => ticket.id));
      return { ...state, customers, invoices: state.invoices.filter(invoice => allowedIds.has(invoice.customerId)), payments: state.payments.filter(payment => !removedInvoiceIds.has(payment.invoiceId)), tickets, devices: state.devices.filter(device => !device.customerId || allowedIds.has(device.customerId)), alerts: state.alerts.filter(alert => !alert.ticketId || ticketIds.has(alert.ticketId)) };
    });
  }, [accessUsers, data, portalProfiles]);
  if (!data) return <main className="crm-loading">Loading Speed vision workspace…</main>;
  const run = (action: () => void) => { try { action(); } catch (error) { toast.error(errorText(error)); } };
  const save = (change: (state: Store) => Store, message = "Saved in this browser") => { updateStore(change); toast.success(message); };
  const go = (next: Screen) => { if (!accessibleNavigation.some(([id]) => id === next)) return; setScreen(next); setMenu(false); setDetail(null); setGlobalSearch(""); };
  const logout = () => { setForm(null); setDetail(null); setMenu(false); setGlobalSearch(""); setScreen("dashboard"); setSessionUsername(null); };
  const person = (id: string) => data.customers.find(c => c.id === id);
  const balance = (id: string) => data.invoices.filter(i => i.customerId === id).reduce((total, invoice) => total + outstanding(invoice, data.payments), 0);
  const customerOptions = data.customers.map(c => ({ value: c.id, label: `${c.name} — ${c.id}` }));
  const staffOptions = data.staff.map(s => ({ value: s.id, label: s.name }));
  const customerRows: Row[] = data.customers.map(c => { const profile = portalProfiles[c.username] || emptyPortalProfile(); const remaining = daysUntil(profile.nextDueDate); return { ID: c.id, Name: c.name, Phone: c.phone || "—", Area: c.area || "—", Username: c.username, Speed: c.plan || "Not selected", "Monthly fee": money(c.monthlyFee), Balance: money(balance(c.id)), "Last payment": profile.lastPaymentDate || "—", "Next payment": profile.nextDueDate || "—", Reminder: remaining === null ? "—" : remaining <= 0 ? "Due now" : remaining <= 7 ? `${remaining} days left` : `${remaining} days`, Status: c.status }; });
  const invoiceRows: Row[] = data.invoices.map(i => ({ ID: i.id, Customer: person(i.customerId)?.name || i.customerId, Period: i.period, Total: money(i.amount), Outstanding: money(outstanding(i, data.payments)), Due: i.dueDate, Status: invoiceStatus(i, data.payments, today()) }));
  const paymentRows: Row[] = data.payments.map(p => ({ ID: p.id, Invoice: p.invoiceId, Customer: person(data.invoices.find(i => i.id === p.invoiceId)?.customerId || "")?.name || "", Amount: money(p.amount), Date: p.date, Method: p.method, Reference: p.reference }));
  const ticketRows: Row[] = data.tickets.map(t => ({ ID: t.id, Customer: person(t.customerId)?.name || t.customerId, Issue: t.subject, Priority: t.priority, Status: t.status, Assigned: data.staff.find(s => s.id === t.assignedTo)?.name || "Unassigned", Created: t.createdAt.slice(0, 10) }));
  const deviceRows: Row[] = data.devices.map(d => ({ ID: d.id, Device: d.name, IP: d.ip, Area: d.area, Customer: person(d.customerId)?.name || "Infrastructure", Status: d.status, "Last demo action": d.lastAction }));
  const alertRows: Row[] = data.alerts.map(a => ({ ID: a.id, Alert: a.title, Area: a.area, Severity: a.severity, Status: a.status, Ticket: a.ticketId || "—", Created: a.createdAt.slice(0, 10) }));
  const accessRows: Row[] = [
    { ID: "admin-test", Name: "Test administrator", Username: "test", Type: "Administrator", "Linked customer": "—", "Visible modules": employeeModuleIds.length, Modules: "All employee modules", Status: "Active" },
    ...accessUsers.map(user => ({ ID: user.id, Name: user.name, Username: user.username, Type: user.accountType === "customer" ? "Customer" : "Employee", "CRM customer": user.accountType === "customer" ? data.customers.find(customer => customer.id === user.customerId || customer.username === user.username)?.id || "Syncing…" : "—", "Visible modules": user.modules.length, Modules: user.modules.map(id => moduleLabels[id]).join(", "), Status: user.active ? "Active" : "Disabled" })),
  ];
  const portalProfile = identity ? portalProfiles[identity.username] || emptyPortalProfile() : emptyPortalProfile();
  const linkedCustomer = identity?.accountType === "customer" ? data.customers.find(customer => customer.id === identity.customerId || customer.username === identity.username) : undefined;
  const customerInvoices = linkedCustomer ? data.invoices.filter(invoice => invoice.customerId === linkedCustomer.id) : [];
  const customerInvoiceRows: Row[] = customerInvoices.map(invoice => ({ ID: invoice.id, Period: invoice.period, Total: money(invoice.amount), Outstanding: money(outstanding(invoice, data.payments)), Due: invoice.dueDate, Status: invoiceStatus(invoice, data.payments, today()) }));
  const customerActivityRows: Row[] = accessUsers.filter(user => user.accountType === "customer").map(user => {
    const profile = portalProfiles[user.username] || emptyPortalProfile();
    const customer = data.customers.find(item => item.id === user.customerId || item.username === user.username);
    const latest = profile.activity.at(-1);
    const remaining = daysUntil(profile.nextDueDate);
    return { ID: user.id, Customer: customer?.name || user.name, Username: user.username, Package: profile.plan || "Not selected", Speed: customer?.plan.match(/\d+\s*Mbps/i)?.[0] || "—", Amount: profile.monthlyFee ? money(profile.monthlyFee) : "—", "Payment status": profile.paymentStatus, "Package access": profile.packageStatus, "Last payment": profile.lastPaymentDate || "—", "Next payment": profile.nextDueDate || "—", Reminder: remaining === null ? "—" : remaining <= 0 ? "Due now" : remaining <= 7 ? `${remaining} days left` : `${remaining} days`, "Latest activity": latest?.text || "New customer account — package selection required", Status: user.active ? "Active" : "Disabled" };
  });

  function editAccessUser(id?: string) {
    const user = accessUsers.find(candidate => candidate.id === id);
    const crmCustomer = user?.accountType === "customer" ? data!.customers.find(customer => customer.id === user.customerId || customer.username === user.username) : undefined;
    setForm({
      title: user ? `Edit access for ${user.name}` : "Add login user",
      description: "First choose Customer or Employee. The relevant portal or ERP modules will appear automatically.",
      fields: [
        { key: "accountType", label: "Account type", value: user?.accountType || "customer", options: [{ value: "customer", label: "Customer portal" }, { value: "employee", label: "Employee CRM & ERP" }] },
        { key: "name", label: "Full name", value: user?.name },
        { key: "username", label: "Login username", value: user?.username },
        { key: "password", label: user ? "New password (leave blank to keep current)" : "Password (minimum 6 characters)", type: "password", optional: !!user },
        { key: "phone", label: "Customer phone", value: crmCustomer?.phone || "", type: "tel", optional: true, visibleFor: "customer" },
        { key: "area", label: "Customer area", value: crmCustomer?.area || "", optional: true, visibleFor: "customer" },
        { key: "status", label: "Login status", value: user?.active === false ? "Disabled" : "Active", options: options(["Active", "Disabled"]) },
        { key: "modules", label: "Visible modules", type: "modules", value: (user?.modules || ["portal"]).join(",") },
      ],
      button: user ? "Save access" : "Create user",
      submit: async values => {
        const selected = moduleIds.filter(module => values[`module__${module}`] === "on");
        const normalizedUsername = values.username.trim().toLowerCase();
        const customerId = values.accountType === "customer" ? user?.customerId || crmCustomer?.id || `CUS-${normalizedUsername}` : "";
        const input = { name: values.name, username: values.username, password: values.password, modules: selected, accountType: values.accountType as AccountType, customerId, active: values.status === "Active" };
        if (user) await updateAccessUser(user.id, input); else await createAccessUser(input);
        if (input.accountType === "customer") updateStore(state => {
          const current = state.customers.find(customer => customer.id === customerId || customer.username === user?.username);
          const profile = portalProfiles[normalizedUsername] || emptyPortalProfile();
          const record: Store["customers"][number] = { id: customerId, name: input.name.trim(), phone: values.phone?.trim() || current?.phone || "", area: values.area?.trim() || current?.area || "", username: normalizedUsername, monthlyFee: profile.monthlyFee || current?.monthlyFee || 0, status: input.active ? current?.status || "Trial" : "Disconnected", ip: current?.ip || "", plan: profile.plan || current?.plan || "", notes: current?.notes || "Created automatically from Users & Access.", promise: current?.promise || "" };
          return { ...state, customers: current ? state.customers.map(customer => customer.id === current.id ? record : customer) : [...state.customers, record] };
        });
        if (input.accountType === "customer" && (!user || user.accountType !== "customer")) {
          const username = input.username.trim().toLowerCase(); const now = new Date().toISOString();
          updatePortalProfile(username, profile => ({ ...profile, activity: [...profile.activity.slice(-199), { id: newId("ACT"), type: "account", text: `New customer account created for ${input.name.trim()}`, at: now }], messages: [...profile.messages.slice(-99), { id: newId("CHAT"), sender: "support", text: "Welcome to Speed vision. Please choose your internet package to begin activation.", at: now }] }));
        }
        toast.success(user ? "User access updated" : "Login user created");
      },
    });
  }

  function editCustomer(id?: string) {
    const c = data!.customers.find(c => c.id === id);
    setForm({ title: c ? `Edit ${c.name}` : "Add customer", fields: [
      { key: "name", label: "Customer name", value: c?.name }, { key: "phone", label: "Phone", value: c?.phone, type: "tel" },
      { key: "area", label: "Service area", value: c?.area }, { key: "username", label: "Username", value: c?.username },
      { key: "ip", label: "IP address", value: c?.ip, optional: true }, { key: "plan", label: "Package", value: c?.plan },
      { key: "fee", label: "Monthly fee (PKR)", value: c ? String(c.monthlyFee / 100) : "", type: "number", min: "0.01", step: "0.01" },
      { key: "status", label: "Status", value: c?.status || "Active", options: options(["Active", "Suspended", "Trial", "Disconnected"]) },
      { key: "notes", label: "Internal notes", value: c?.notes, optional: true, type: "textarea" },
    ], submit: v => {
      if (!/^[+\d ()-]{10,20}$/.test(v.phone)) throw new Error("Enter a valid phone number.");
      const item = { id: c?.id || newId("KHI"), name: v.name.trim(), phone: v.phone.trim(), area: v.area.trim(), username: v.username.trim(), ip: v.ip.trim(), plan: v.plan.trim(), monthlyFee: toPaisa(v.fee), status: v.status as Store["customers"][number]["status"], notes: v.notes, promise: c?.promise || "" };
      save(state => {
        if (state.customers.some(other => other.id !== item.id && other.username.toLowerCase() === item.username.toLowerCase())) throw new Error("Username already exists.");
        return { ...state, customers: c ? state.customers.map(old => old.id === c.id ? item : old) : [...state.customers, item] };
      });
    } });
  }
  function manageCustomerService(id: string) {
    const customer = data!.customers.find(item => item.id === id); if (!customer) return;
    const user = accessUsers.find(item => item.customerId === id || item.username === customer.username);
    const speed = customer.plan.match(/\d+/)?.[0] || "20";
    setForm({ title: `Manage ${customer.name}`, description: "Update speed, monthly price and CRM service status. Speed/price changes create a pending payment update in the customer portal.", fields: [
      { key: "speed", label: "Internet speed (Mbps)", type: "number", min: "1", max: "10000", value: speed },
      { key: "fee", label: "Monthly fee (PKR)", type: "number", min: "0", step: "0.01", value: String(customer.monthlyFee / 100) },
      { key: "status", label: "Service status", value: customer.status, options: options(["Active", "Suspended", "Trial", "Disconnected"]) },
      { key: "notes", label: "Update note", type: "textarea", optional: true },
    ], button: "Update customer", submit: values => {
      const nextFee = toPaisa(values.fee); const nextPlan = `${Number(values.speed)} Mbps`; const changedPackage = nextFee !== customer.monthlyFee || nextPlan !== customer.plan;
      updateStore(state => {
        const period = today().slice(0, 7); const invoice = state.invoices.find(item => item.customerId === id && item.period === period);
        const invoices = changedPackage && invoice && !state.payments.some(payment => payment.invoiceId === invoice.id) ? state.invoices.map(item => item.id === invoice.id ? { ...item, amount: nextFee } : item) : state.invoices;
        return { ...state, customers: state.customers.map(item => item.id === id ? { ...item, plan: nextPlan, monthlyFee: nextFee, status: values.status as Store["customers"][number]["status"], notes: values.notes || item.notes } : item), invoices };
      });
      if (user) { const now = new Date().toISOString(); updatePortalProfile(user.username, profile => ({ ...profile, plan: nextPlan, monthlyFee: nextFee, paymentStatus: changedPackage ? "Pending" : profile.paymentStatus, packageStatus: values.status === "Active" ? changedPackage ? "Awaiting payment" : "Active" : "Inactive", activity: [...profile.activity.slice(-199), { id: newId("ACT"), type: "erp-update", text: changedPackage ? `ERP updated package to ${nextPlan} at ${money(nextFee)} — payment pending` : `ERP changed service status to ${values.status}`, at: now }], messages: [...profile.messages.slice(-99), { id: newId("CHAT"), sender: "support", text: changedPackage ? `Your package has been updated to ${nextPlan}. New monthly fee is ${money(nextFee)}; payment is pending.` : `Your service status is now ${values.status}.`, at: now }] })); }
      toast.success("Customer service updated");
    } });
  }
  function toggleCustomerService(id: string) {
    const customer = data!.customers.find(item => item.id === id); if (!customer) return;
    const user = accessUsers.find(item => item.customerId === id || item.username === customer.username); const activate = customer.status !== "Active"; const now = new Date().toISOString();
    updateStore(state => ({ ...state, customers: state.customers.map(item => item.id === id ? { ...item, status: activate ? "Active" : "Suspended" } : item) }));
    if (user) updatePortalProfile(user.username, profile => ({ ...profile, packageStatus: activate ? "Active" : "Inactive", activity: [...profile.activity.slice(-199), { id: newId("ACT"), type: "service", text: `ERP ${activate ? "activated" : "deactivated"} service`, at: now }], messages: [...profile.messages.slice(-99), { id: newId("CHAT"), sender: "support", text: `Your internet service has been ${activate ? "activated" : "deactivated"} by Speed vision.`, at: now }] }));
    toast.success(`Service ${activate ? "activated" : "deactivated"}`);
  }
  function paymentForm(invoiceId?: string) {
    const open = data!.invoices.filter(i => outstanding(i, data!.payments) > 0);
    if (!open.length) { toast.info("No unpaid invoices. Run billing first."); return; }
    const selected = open.find(i => i.id === invoiceId);
    setForm({ title: "Record payment", description: "Records a demo ledger entry. No money is transferred.", fields: [
      { key: "invoice", label: "Invoice", value: selected?.id, options: open.map(i => ({ value: i.id, label: `${person(i.customerId)?.name} · ${i.period} · due ${money(outstanding(i, data!.payments))}` })) },
      { key: "amount", label: "Amount (PKR)", value: selected ? String(outstanding(selected, data!.payments) / 100) : "", type: "number", min: "0.01", step: "0.01" },
      { key: "date", label: "Payment date", type: "date", value: today() }, { key: "method", label: "Method", value: "Cash", options: options(["Cash", "Bank Transfer", "JazzCash", "Easypaisa", "Raast", "Cheque"]) },
      { key: "reference", label: "Reference / notes", optional: true },
    ], submit: v => {
      const payment: Payment = { id: newId("RCP"), invoiceId: v.invoice, amount: toPaisa(v.amount), date: v.date, method: v.method as Payment["method"], reference: v.reference };
      save(state => { const invoice = state.invoices.find(i => i.id === v.invoice); if (!invoice) throw new Error("Invoice not found."); return { ...state, payments: recordPayment(invoice, state.payments, payment) }; }, `Payment saved: ${payment.id}`);
      go("payments");
    } });
  }
  function billingRun() {
    setForm({ title: "Preview monthly billing", description: "Only active customers without an invoice for this month are included. Tax settings are applied to the monthly fee.", button: "Preview", fields: [
      { key: "period", label: "Billing month", type: "month", value: today().slice(0, 7) }, { key: "due", label: "Due date", type: "date", value: `${today().slice(0, 7)}-${String(data!.settings.dueDay).padStart(2, "0")}` },
    ], submit: v => {
      const build = (state: Store) => previewBilling(state.customers.map(c => ({ ...c, monthlyFee: Math.round(c.monthlyFee * (1 + (state.settings.salesTax + state.settings.withholdingTax) / 100)) })), state.invoices, v.period, v.due);
      const preview = build(data!);
      if (!preview.length) throw new Error("All active customers have already been billed for this month.");
      // Schedule the confirmation after the current editor closes.
      setTimeout(() => setForm({ title: "Confirm invoice run", description: `${preview.length} invoices · total ${money(preview.reduce((sum, i) => sum + i.amount, 0))}. Existing invoices will not be duplicated.`, fields: [], button: "Generate invoices", submit: () => save(state => ({ ...state, invoices: [...state.invoices, ...build(state)] }), "Invoices generated") }), 0);
    } });
  }
  function editTicket(id?: string, subject = "") {
    const t = data!.tickets.find(t => t.id === id);
    if (!data!.customers.length) { toast.info("Add a customer first."); return; }
    setForm({ title: t ? `Edit ${t.id}` : "Create ticket", fields: [
      { key: "customerId", label: "Customer", value: t?.customerId, options: customerOptions },
      { key: "subject", label: "Issue", value: t?.subject || subject },
      { key: "priority", label: "Priority", value: t?.priority || "Medium", options: options(["Low", "Medium", "High", "Critical"]) },
      { key: "assignedTo", label: "Assigned staff", value: t?.assignedTo || "", options: staffOptions, optional: true },
      { key: "status", label: "Status", value: t?.status || "Open", options: options(["Open", "In progress", "Resolved"]) },
    ], submit: v => save(state => {
      const record: Store["tickets"][number] = { id: t?.id || newId("TK"), customerId: v.customerId, subject: v.subject.trim(), priority: v.priority as Store["tickets"][number]["priority"], status: v.status as Store["tickets"][number]["status"], assignedTo: v.assignedTo || null, createdAt: t?.createdAt || new Date().toISOString(), resolvedAt: v.status === "Resolved" ? t?.resolvedAt || new Date().toISOString() : null, messages: state.tickets.find(old => old.id === id)?.messages || [] };
      return { ...state, tickets: t ? state.tickets.map(old => old.id === id ? record : old) : [...state.tickets, record] };
    }) });
  }
  function editStaff(id?: string) {
    const s = data!.staff.find(s => s.id === id);
    setForm({ title: s ? "Edit staff" : "Add staff", fields: [{ key: "name", label: "Name", value: s?.name }, { key: "role", label: "Role (demo assignment only)", value: s?.role }, { key: "area", label: "Area", value: s?.area }, { key: "status", label: "Availability", value: s?.status || "Online", options: options(["Online", "On route", "Offline"]) }], submit: v => save(state => {
      const item = { id: s?.id || newId("ST"), name: v.name.trim(), role: v.role, area: v.area, status: v.status as Store["staff"][number]["status"] };
      return { ...state, staff: s ? state.staff.map(old => old.id === s.id ? item : old) : [...state.staff, item] };
    }) });
  }
  function editDevice(id?: string) {
    const d = data!.devices.find(d => d.id === id);
    setForm({ title: d ? "Edit device" : "Add device", fields: [{ key: "name", label: "Name", value: d?.name }, { key: "ip", label: "IP address", value: d?.ip }, { key: "area", label: "Area", value: d?.area }, { key: "customerId", label: "Customer (optional)", value: d?.customerId, options: customerOptions, optional: true }, { key: "status", label: "Demo status", value: d?.status || "Online", options: options(["Online", "Offline", "Degraded"]) }], submit: v => save(state => {
      const item = { id: d?.id || newId("DEV"), name: v.name, ip: v.ip, area: v.area, customerId: v.customerId, status: v.status as Store["devices"][number]["status"], lastAction: d?.lastAction || "Manually added demo device" };
      return { ...state, devices: d ? state.devices.map(old => old.id === d.id ? item : old) : [...state.devices, item] };
    }) });
  }
  function addAlert() {
    setForm({ title: "Add network alert", fields: [{ key: "title", label: "Incident" }, { key: "area", label: "Affected area" }, { key: "severity", label: "Severity", value: "Warning", options: options(["Warning", "Critical"]) }], submit: v => save(state => ({ ...state, alerts: [...state.alerts, { id: newId("ALT"), title: v.title, area: v.area, severity: v.severity as "Warning" | "Critical", status: "Open", ticketId: "", createdAt: new Date().toISOString() }] })) });
  }
  function expenseForm() {
    setForm({ title: "Record expense", fields: [{ key: "category", label: "Category", options: options(["Bandwidth", "Salary", "Fuel", "Equipment", "Rent", "Other"]) }, { key: "amount", label: "Amount (PKR)", type: "number", min: "0.01", step: "0.01" }, { key: "date", label: "Date", type: "date", value: today() }, { key: "notes", label: "Notes", type: "textarea", optional: true }], submit: v => save(state => ({ ...state, expenses: [...state.expenses, { id: newId("EXP"), category: v.category, amount: toPaisa(v.amount), date: v.date, notes: v.notes }] })) });
  }
  function receipt(id: string, share = false) {
    const p = data!.payments.find(p => p.id === id)!;
    const invoice = data!.invoices.find(i => i.id === p.invoiceId)!;
    const customer = person(invoice.customerId)!;
    if (share) whatsapp(customer.phone, `${data!.settings.company}\nReceipt ${p.id}\n${customer.name}\nReceived ${money(p.amount)} on ${p.date} (${p.method}).\nInvoice ${p.invoiceId}\nRemaining ${money(outstanding(invoice, data!.payments))}`);
    else printRows(`${data!.settings.company} · Receipt ${p.id}`, paymentRows.filter(row => row.ID === id));
  }
  function reminder(id: string) { const c = person(id)!; whatsapp(c.phone, `${data!.settings.company}: Dear ${c.name}, your outstanding balance is ${money(balance(id))}. Please contact us to arrange payment.`); }
  function ticketActions(id: string) { return <><Button variant="outline" size="sm" onClick={() => setDetail({ kind: "ticket", id })}>Open</Button><Button variant="outline" size="sm" onClick={() => editTicket(id)}>Assign / edit</Button>{data!.tickets.find(t => t.id === id)?.status !== "Resolved" && <Button size="sm" onClick={() => run(() => save(s => ({ ...s, tickets: s.tickets.map(t => t.id === id ? resolveTicket(t, new Date().toISOString()) : t) }), "Ticket resolved"))}>Resolve</Button>}</>; }
  const recoveryRows: Row[] = data.customers.filter(c => balance(c.id) > 0).map(c => ({ ID: c.id, Customer: c.name, Phone: c.phone, Area: c.area, Outstanding: money(balance(c.id)), "Promise date": c.promise || "—", Status: data.invoices.some(i => i.customerId === c.id && invoiceStatus(i, data.payments, today()) === "Overdue") ? "Overdue" : "Due" }));
  const expenseRows: Row[] = data.expenses.map(e => ({ ID: e.id, Category: e.category, Amount: money(e.amount), Date: e.date, Notes: e.notes }));
  const rowsForReport: Record<string, Row[]> = { collections: paymentRows, invoices: invoiceRows, customers: customerRows, recovery: recoveryRows, tickets: ticketRows, expenses: expenseRows, devices: deviceRows };
  const reportRows = rowsForReport[report].filter(row => { const date = String(row.Date || row.Created || row.Due || ""); return (!from || !date || date >= from) && (!to || !date || date <= to); });

  function detailView() {
    if (!detail) return null;
    if (detail.kind === "customer") {
      const c = person(detail.id); if (!c) return <p>Customer no longer exists.</p>;
      return <><Panel><div className="crm-heading"><div><h2>{c.name}</h2><p>{c.id} · {c.username} · {c.status}</p></div><Button onClick={() => editCustomer(c.id)}>Edit customer</Button></div><div className="crm-stats"><div><small>Phone</small><strong>{c.phone}</strong></div><div><small>Area</small><strong>{c.area}</strong></div><div><small>Package</small><strong>{c.plan}</strong></div><div><small>Outstanding</small><strong>{money(balance(c.id))}</strong></div></div><p className="crm-notes">{c.notes || "No internal notes."}</p><div className="crm-actions"><Button variant="outline" onClick={() => run(() => whatsapp(c.phone, `Hello ${c.name}, this is ${data!.settings.company}.`))}>Compose WhatsApp</Button><Button variant="outline" onClick={() => editCustomer(c.id)}>Change package / notes</Button></div></Panel>
        <DataTable title="Customer invoices" rows={invoiceRows.filter(i => data!.invoices.find(x => x.id === i.ID)?.customerId === c.id)} actions={id => <Button size="sm" onClick={() => paymentForm(id)}>Record payment</Button>} />
        <DataTable title="Customer tickets" rows={ticketRows.filter(row => data!.tickets.find(t => t.id === row.ID)?.customerId === c.id)} actions={ticketActions} />
        <DataTable title="Customer devices" rows={deviceRows.filter(row => data!.devices.find(d => d.id === row.ID)?.customerId === c.id)} actions={id => <Button size="sm" onClick={() => setDetail({ kind: "device", id })}>Open</Button>} /></>;
    }
    if (detail.kind === "ticket") {
      const t = data!.tickets.find(t => t.id === detail.id)!; const c = person(t.customerId)!;
      return <Panel><div className="crm-heading"><div><h2>{t.id} · {t.subject}</h2><p>{c.name} · {t.priority} · {t.status} · {data!.staff.find(s => s.id === t.assignedTo)?.name || "Unassigned"}</p></div><Button onClick={() => editTicket(t.id)}>Edit / assign</Button></div><div className="crm-messages">{!t.messages.length && <p>No messages yet. Replies below are internal demo notes, not WhatsApp messages.</p>}{t.messages.map(m => <article key={m.id}><strong>{m.author}</strong><small>{new Date(m.createdAt).toLocaleString()}</small><p>{m.text}</p></article>)}</div><form className="crm-toolbar" onSubmit={event => { event.preventDefault(); const element = event.currentTarget; const message = String(new FormData(element).get("message") || "").trim(); if (!message) return; run(() => { save(s => ({ ...s, tickets: s.tickets.map(old => old.id === t.id ? { ...old, messages: [...old.messages, { id: newId("MSG"), author: "Demo operator", text: message, createdAt: new Date().toISOString() }] } : old) }), "Internal reply saved"); element.reset(); }); }}><input aria-label="Ticket reply" name="message" required maxLength={4000} placeholder="Add an internal reply…" /><Button type="submit">Save reply</Button></form><div className="crm-actions"><Button variant="outline" onClick={() => run(() => whatsapp(c.phone, `${data!.settings.company}: update on ticket ${t.id} (${t.subject}).`))}>Compose WhatsApp</Button><Button disabled={t.status === "Resolved"} onClick={() => run(() => save(s => ({ ...s, tickets: s.tickets.map(old => old.id === t.id ? resolveTicket(old, new Date().toISOString()) : old) })))}>Resolve ticket</Button></div></Panel>;
    }
    if (detail.kind === "staff") { const staff = data!.staff.find(s => s.id === detail.id)!; return <><Panel><h2>{staff.name}</h2><p>{staff.role} · {staff.area} · {staff.status}</p><Button onClick={() => editStaff(staff.id)}>Edit staff</Button></Panel><DataTable title="Assignments" rows={ticketRows.filter(row => data!.tickets.find(t => t.id === row.ID)?.assignedTo === staff.id)} actions={ticketActions} /></>; }
    const d = data!.devices.find(d => d.id === detail.id)!;
    return <Panel><h2>{d.name}</h2><p>{d.ip} · {d.area} · {d.status}</p><p className="crm-notes">{d.lastAction}</p><p>These actions only update the demo inventory. No router or ONU commands are sent.</p><div className="crm-actions"><Button variant="outline" onClick={() => editDevice(d.id)}>Edit device</Button><Button onClick={() => run(() => save(s => ({ ...s, devices: s.devices.map(old => old.id === d.id ? { ...old, status: "Online", lastAction: `Demo reboot completed at ${new Date().toLocaleString()}` } : old) }), "Demo reboot recorded"))}>Simulate reboot</Button><Button variant="outline" onClick={() => run(() => save(s => ({ ...s, devices: s.devices.map(old => old.id === d.id ? { ...old, status: old.status === "Offline" ? "Online" : "Offline", lastAction: `Demo status changed at ${new Date().toLocaleString()}` } : old) })))}>Toggle demo connection</Button></div></Panel>;
  }

  function choosePackage(plan: typeof internetPackages[number]) {
    if (!identity) return;
    const now = new Date().toISOString();
    updatePortalProfile(identity.username, profile => ({ ...profile, plan: plan.name, monthlyFee: plan.fee, paymentStatus: "Pending", packageStatus: "Awaiting payment", activity: [...profile.activity.slice(-199), { id: newId("ACT"), type: "package", text: `Selected ${plan.name} (${plan.speed}) — recover payment`, at: now }] }));
    if (linkedCustomer) updateStore(state => {
      const period = today().slice(0, 7); const invoice = state.invoices.find(item => item.customerId === linkedCustomer.id && item.period === period);
      return { ...state, customers: state.customers.map(customer => customer.id === linkedCustomer.id ? { ...customer, plan: `${plan.name} · ${plan.speed}`, monthlyFee: plan.fee } : customer), invoices: invoice ? state.invoices.map(item => item.id === invoice.id && !state.payments.some(payment => payment.invoiceId === item.id) ? { ...item, amount: plan.fee } : item) : [...state.invoices, { id: newId("INV"), customerId: linkedCustomer.id, period, amount: plan.fee, dueDate: `${period}-${String(state.settings.dueDay).padStart(2, "0")}` }] };
    });
    toast.success(`${plan.name} selected`); go("my-billing");
  }
  function collectPortalPayment(userId: string) {
    const user = accessUsers.find(candidate => candidate.id === userId); if (!user) throw new Error("Customer login not found.");
    const profile = portalProfiles[user.username] || emptyPortalProfile(); if (!profile.plan || !profile.monthlyFee) throw new Error("This customer has not selected a package yet.");
    const customer = user.customerId ? person(user.customerId) : undefined; const now = new Date().toISOString();
    if (customer) updateStore(state => {
      const period = (profile.nextDueDate || today()).slice(0, 7); let invoice = state.invoices.find(item => item.customerId === customer.id && item.period === period);
      let invoices = state.invoices;
      if (!invoice) { invoice = { id: newId("INV"), customerId: customer.id, period, amount: profile.monthlyFee, dueDate: `${period}-${String(state.settings.dueDay).padStart(2, "0")}` }; invoices = [...invoices, invoice]; }
      const due = outstanding(invoice, state.payments);
      const method = profile.paymentMethod === "Cash collection" || !profile.paymentMethod ? "Cash" : profile.paymentMethod as Payment["method"];
      const payments = due > 0 ? recordPayment(invoice, state.payments, { id: newId("RCP"), invoiceId: invoice.id, amount: due, date: today(), method, reference: `Customer portal · ${user.username}` }) : state.payments;
      return { ...state, invoices, payments };
    });
    updatePortalProfile(user.username, current => ({ ...current, paymentStatus: "Paid", packageStatus: current.packageStatus === "Active" ? "Active" : "Awaiting approval", lastPaymentDate: today(), nextDueDate: addMonth(current.nextDueDate || today()), activity: [...current.activity.slice(-199), { id: newId("ACT"), type: "payment", text: `Payment collected for ${current.plan}${current.packageStatus === "Active" ? " — monthly renewal" : " — activate package"}`, at: now }], messages: [...current.messages.slice(-99), { id: newId("CHAT"), sender: "support", text: current.packageStatus === "Active" ? `Monthly payment received for ${current.plan}. Thank you!` : `Payment received for ${current.plan}. Your package is waiting for activation approval.`, at: now }] }));
    toast.success(`Payment collected for ${user.name}`);
  }
  function sendPaymentReminder(userId: string) {
    const user = accessUsers.find(candidate => candidate.id === userId); if (!user) throw new Error("Customer login not found.");
    const now = new Date().toISOString();
    updatePortalProfile(user.username, profile => {
      if (!profile.plan) throw new Error("This customer has not selected a package yet.");
      const remaining = daysUntil(profile.nextDueDate);
      const text = remaining !== null && remaining > 0 ? `Payment reminder: your next ${profile.plan} payment of ${money(profile.monthlyFee)} is due in ${remaining} days (${profile.nextDueDate}).` : `Payment reminder: your ${profile.plan} package payment of ${money(profile.monthlyFee)} is pending. Please open Payments & schedule to complete it.`;
      return { ...profile, messages: [...profile.messages.slice(-99), { id: newId("CHAT"), sender: "support", text, at: now }], activity: [...profile.activity.slice(-199), { id: newId("ACT"), type: "reminder", text: "Support sent a payment reminder", at: now }] };
    });
    toast.success(`Reminder added to ${user.name}'s support conversation`);
  }
  function sendPackagePrompt(userId: string) {
    const user = accessUsers.find(candidate => candidate.id === userId); if (!user) throw new Error("Customer login not found.");
    const now = new Date().toISOString();
    updatePortalProfile(user.username, profile => ({ ...profile, messages: [...profile.messages.slice(-99), { id: newId("CHAT"), sender: "support", text: "Welcome! Please select an internet package from your portal so our ERP team can start activation.", at: now }], activity: [...profile.activity.slice(-199), { id: newId("ACT"), type: "prompt", text: "ERP sent package selection prompt", at: now }] }));
    toast.success(`Package prompt sent to ${user.name}`);
  }
  function activateCustomerPackage(userId: string) {
    const user = accessUsers.find(candidate => candidate.id === userId); if (!user) throw new Error("Customer login not found.");
    const profile = portalProfiles[user.username] || emptyPortalProfile();
    if (profile.paymentStatus !== "Paid") throw new Error("Collect payment before activating this package.");
    const now = new Date().toISOString();
    updatePortalProfile(user.username, current => ({ ...current, packageStatus: "Active", activity: [...current.activity.slice(-199), { id: newId("ACT"), type: "activation", text: `${current.plan} package activated from ERP`, at: now }], messages: [...current.messages.slice(-99), { id: newId("CHAT"), sender: "support", text: `Your ${current.plan} package is now active. Welcome to Speed vision!`, at: now }] }));
    if (user.customerId) updateStore(state => ({ ...state, customers: state.customers.map(customer => customer.id === user.customerId ? { ...customer, status: "Active" } : customer) }));
    toast.success(`${profile.plan} activated for ${user.name}`);
  }
  function portalActivityActions(userId: string) {
    const user = accessUsers.find(candidate => candidate.id === userId); const profile = user ? portalProfiles[user.username] || emptyPortalProfile() : emptyPortalProfile();
    const remaining = daysUntil(profile.nextDueDate); const renewalDue = remaining !== null && remaining <= 0; const dueSoon = remaining !== null && remaining <= 7;
    return <>{!profile.plan && <Button size="sm" variant="outline" onClick={() => run(() => sendPackagePrompt(userId))}>Prompt package</Button>}{profile.plan && (profile.paymentStatus !== "Paid" || renewalDue) && <Button size="sm" onClick={() => run(() => collectPortalPayment(userId))}>{renewalDue ? "Collect renewal" : "Collect payment"}</Button>}{profile.plan && (profile.paymentStatus === "Pending" || dueSoon) && <Button size="sm" variant="outline" onClick={() => run(() => sendPaymentReminder(userId))}>Send reminder</Button>}{profile.paymentStatus === "Paid" && profile.packageStatus !== "Active" && <Button size="sm" onClick={() => run(() => activateCustomerPackage(userId))}>Activate package</Button>}</>;
  }
  function paymentPreferenceForm() {
    if (!identity) return;
    setForm({ title: "Payment preference", description: "Choose a preferred payment method and monthly payment date.", fields: [
      { key: "method", label: "Payment method", value: portalProfile.paymentMethod || "Easypaisa", options: options(["Easypaisa", "JazzCash", "Bank Transfer", "Raast", "Cash collection"]) },
      { key: "date", label: "Preferred monthly payment date", type: "date", value: portalProfile.paymentDate || today() },
    ], submit: values => { const now = new Date().toISOString(); updatePortalProfile(identity.username, profile => ({ ...profile, paymentMethod: values.method, paymentDate: values.date, activity: [...profile.activity.slice(-199), { id: newId("ACT"), type: "schedule", text: `Payment scheduled for ${values.date} via ${values.method}`, at: now }] })); toast.success("Payment schedule saved"); } });
  }
  function supportConversationForm() {
    if (!identity) return;
    setForm({ title: "Ask support", description: "Send a query or complaint to the Speed vision support queue.", fields: [{ key: "message", label: "Your message", type: "textarea" }], button: "Send message", submit: values => {
      const message = values.message.trim(); if (!message) throw new Error("Enter your query or complaint.");
      const now = new Date().toISOString();
      updatePortalProfile(identity.username, profile => ({ ...profile, messages: [...profile.messages.slice(-98), { id: newId("CHAT"), sender: "customer", text: message, at: now }, { id: newId("CHAT"), sender: "support", text: "Thanks — your request is in our support queue. Our team will follow up shortly.", at: now }], activity: [...profile.activity.slice(-199), { id: newId("ACT"), type: "support", text: `Sent support query: ${message.slice(0, 80)}`, at: now }] }));
      if (linkedCustomer) updateStore(state => ({ ...state, tickets: [...state.tickets, { id: newId("TK"), customerId: linkedCustomer.id, subject: message.slice(0, 100), priority: "Medium", status: "Open", assignedTo: null, createdAt: now, resolvedAt: null, messages: [{ id: newId("MSG"), author: linkedCustomer.name, text: message, createdAt: now }] }] }));
      toast.success("Support request sent");
    } });
  }
  function upgradeRequestForm() {
    if (!identity) return;
    setForm({ title: "Request an upgrade", description: "Select an internet or device upgrade. The request will be added to the support queue.", fields: [
      { key: "request", label: "Upgrade / device", options: options(["Upgrade internet package", "Wi-Fi 6 router", "Mesh Wi-Fi system", "ONU replacement", "Static IP", "Coverage survey"]) },
      { key: "notes", label: "Details", type: "textarea", optional: true },
    ], button: "Submit request", submit: values => {
      const request = `${values.request}${values.notes ? ` — ${values.notes}` : ""}`; const now = new Date().toISOString();
      updatePortalProfile(identity.username, profile => ({ ...profile, upgradeRequest: request, activity: [...profile.activity.slice(-199), { id: newId("ACT"), type: "upgrade", text: `Requested ${values.request}`, at: now }] }));
      if (linkedCustomer) updateStore(state => ({ ...state, tickets: [...state.tickets, { id: newId("TK"), customerId: linkedCustomer.id, subject: request.slice(0, 100), priority: "Medium", status: "Open", assignedTo: null, createdAt: now, resolvedAt: null, messages: [] }] }));
      toast.success("Upgrade request submitted");
    } });
  }

  function settingsView() {
    return <><Panel><h2>Company & billing preferences</h2><p>Billing runs manually in this browser. An automatic monthly job requires a server.</p><form className="crm-settings-grid" onSubmit={event => { event.preventDefault(); const values = Object.fromEntries(new FormData(event.currentTarget)); run(() => save(s => ({ ...s, settings: { ...s.settings, company: String(values.company).trim(), billingDay: Number(values.billingDay), dueDay: Number(values.dueDay), salesTax: Number(values.salesTax), withholdingTax: Number(values.withholdingTax) } }))); }}>
      <label className="crm-field">Company name<input name="company" defaultValue={data!.settings.company} required /></label>
      <label className="crm-field">Preferred billing day<input name="billingDay" type="number" min="1" max="28" required defaultValue={data!.settings.billingDay} /></label>
      <label className="crm-field">Due day<input name="dueDay" type="number" min="1" max="28" required defaultValue={data!.settings.dueDay} /></label>
      <label className="crm-field">Sales tax % (demo configuration)<input name="salesTax" type="number" min="0" max="100" step="0.01" required defaultValue={data!.settings.salesTax} /></label>
      <label className="crm-field">Withholding tax % (demo configuration)<input name="withholdingTax" type="number" min="0" max="100" step="0.01" required defaultValue={data!.settings.withholdingTax} /></label><Button type="submit">Save settings</Button>
    </form><p>Rates start at zero and apply only to new invoice runs. Existing invoices are unchanged.</p></Panel>
      <Panel><h2>Backup & restore</h2><p>Data is specific to this browser and website address. Export a backup to move it to another browser or restore it later.</p><div className="crm-actions"><Button onClick={() => download(`speed-vision-backup-${today()}.json`, JSON.stringify(data, null, 2), "application/json")}>Download full backup</Button><Button variant="outline" onClick={() => restoreFile.current?.click()}>Restore backup</Button></div></Panel>
      <Panel><h2>Integration setup notes</h2><p>Save non-secret setup notes here. Real services are not connected. Do not enter API keys or passwords into browser storage.</p><div className="crm-integration-grid">{["MikroTik / RADIUS", "SNMP / OLT", "WhatsApp", "SMS", "Payment gateway", "Syslog"].map(name => <article key={name}><h3>{name}</h3><span className="crm-status">Not connected</span><p>{data!.settings.integrations[name] || "No setup notes saved."}</p><Button variant="outline" onClick={() => setForm({ title: `${name} setup notes`, description: "Demo configuration only. A server-side adapter is required for a live connection.", fields: [{ key: "notes", label: "Non-secret setup notes", value: data!.settings.integrations[name] || "", type: "textarea", optional: true }], submit: v => save(s => ({ ...s, settings: { ...s.settings, integrations: { ...s.settings.integrations, [name]: v.notes } } })) })}>Configure notes</Button></article>)}</div></Panel></>;
  }
  function content() {
    if (detail) return <><Button variant="outline" onClick={() => setDetail(null)}>← Back to {activeScreen}</Button>{detailView()}</>;
    switch (activeScreen) {
      case "portal": {
        const selectedPlan = portalProfile.plan || linkedCustomer?.plan || "Choose a package";
        const serviceState = portalProfile.packageStatus === "Active" ? "Active" : portalProfile.packageStatus === "Not selected" ? "Setup pending" : portalProfile.packageStatus;
        const latestSupportMessage = [...portalProfile.messages].reverse().find(message => message.sender === "support");
        return <><div className="crm-portal-hero"><div><span className="crm-kicker">WELCOME, {identity?.name.toUpperCase()}</span><h2>Your internet, under control.</h2><p>Manage your package, payment schedule, service health and support from one place.</p></div><span className={`crm-connection ${serviceState === "Active" ? "online" : ""}`}><Wifi size={18} /> {serviceState === "Active" ? "Service active" : serviceState}</span></div>{!portalProfile.plan && !linkedCustomer?.plan && <Panel><h2>Start by choosing your internet package</h2><p>Your billing and service preferences will unlock after package selection.</p><div className="crm-actions"><Button onClick={() => go("packages")}>Choose a package</Button></div></Panel>}<div className="crm-stats"><Panel><small>Current package</small><strong>{selectedPlan}</strong></Panel><Panel><small>Monthly fee</small><strong>{portalProfile.monthlyFee ? money(portalProfile.monthlyFee) : linkedCustomer ? money(linkedCustomer.monthlyFee) : "Not set"}</strong></Panel><Panel><small>Payment status</small><strong className={portalProfile.paymentStatus === "Paid" ? "crm-paid" : "crm-pending"}>{portalProfile.paymentStatus}</strong></Panel><Panel><small>Package access</small><strong className={portalProfile.packageStatus === "Active" ? "crm-paid" : "crm-pending"}>{portalProfile.packageStatus}</strong></Panel></div>{latestSupportMessage && <Panel><span className="crm-kicker">LATEST SUPPORT MESSAGE</span><h3>{latestSupportMessage.text}</h3><p>{new Date(latestSupportMessage.at).toLocaleString()}</p>{identity?.modules.includes("support") && <Button variant="outline" onClick={() => go("support")}>Open conversation</Button>}</Panel>}<div className="crm-portal-actions">{[["packages", "Choose / upgrade package", "Compare available speeds", Package], ["my-billing", "Payment & schedule", "Method, date and invoices", CalendarClock], ["support", "Ask Speed vision", "Queries and complaints", MessageCircle], ["service-status", "Check service", "Connection and outage status", Wifi], ["upgrades", "Devices & upgrades", "Router, mesh and ONU", ArrowUpCircle]].filter(([id]) => identity?.modules.includes(id as ModuleId)).map(([id, title, description, Icon]) => <button className="crm-panel" key={String(id)} onClick={() => go(id as Screen)}><Icon size={23} /><h3>{String(title)}</h3><p>{String(description)}</p></button>)}</div></>;
      }
      case "packages": return <><Panel><h2>Choose the right internet package</h2><p>Select a package now. You can return here later to request an upgrade.</p></Panel><div className="crm-package-grid">{internetPackages.map(plan => <article className={`crm-panel crm-package ${portalProfile.plan === plan.name ? "selected" : ""}`} key={plan.name}><span className="crm-kicker">{plan.speed}</span><h2>{plan.name}</h2><strong>{money(plan.fee)} <small>/ month</small></strong><p>{plan.detail}</p><Button onClick={() => choosePackage(plan)}>{portalProfile.plan === plan.name ? "Selected" : portalProfile.plan ? "Upgrade to this" : "Select package"}</Button></article>)}</div></>;
      case "my-billing": {
        const currentUser = accessUsers.find(user => user.username === identity?.username);
        return <><div className="crm-stats"><Panel><small>Package</small><strong>{portalProfile.plan || linkedCustomer?.plan || "Not selected"}</strong></Panel><Panel><small>Payment status</small><strong className={portalProfile.paymentStatus === "Paid" ? "crm-paid" : "crm-pending"}>{portalProfile.paymentStatus}</strong></Panel><Panel><small>Package access</small><strong className={portalProfile.packageStatus === "Active" ? "crm-paid" : "crm-pending"}>{portalProfile.packageStatus}</strong></Panel><Panel><small>Payment schedule</small><strong>{portalProfile.paymentDate || "Not scheduled"}</strong></Panel></div>{portalProfile.plan && portalProfile.paymentStatus !== "Paid" && <div className="crm-payment-alert"><div><strong>Payment pending</strong><p>Your selected package will remain pending until payment is recorded.</p></div>{currentUser && <Button onClick={() => run(() => collectPortalPayment(currentUser.id))}>Pay now (demo)</Button>}</div>}{portalProfile.paymentStatus === "Paid" && portalProfile.packageStatus !== "Active" && <div className="crm-payment-alert crm-approval-alert"><div><strong>Payment received — activation pending</strong><p>The ERP team will approve your package and you will receive a confirmation message here.</p></div></div>}<Panel><div className="crm-access-intro"><div><h2>Payment preference</h2><p>Set how and when you prefer to pay each month. Payment status also updates in the main ERP.</p></div><Button onClick={paymentPreferenceForm}>Set payment schedule</Button></div></Panel>{linkedCustomer ? <DataTable title="My invoices" rows={customerInvoiceRows} /> : <Panel><h2>No CRM customer linked</h2><p>Ask the administrator to link this login to your customer record to show invoices here.</p></Panel>}</>;
      }
      case "support": return <><Panel><div className="crm-access-intro"><div><h2>Speed vision support</h2><p>Ask a question or submit a complaint. Linked customer accounts also create a staff ticket.</p></div><Button onClick={supportConversationForm}><MessageCircle size={16} /> New message</Button></div></Panel><Panel><div className="crm-chat">{!portalProfile.messages.length && <p>No conversation yet. Start with any internet, billing or device question.</p>}{portalProfile.messages.map(message => <article className={message.sender} key={message.id}><strong>{message.sender === "customer" ? "You" : "Speed vision support"}</strong><p>{message.text}</p><small>{new Date(message.at).toLocaleString()}</small></article>)}</div></Panel></>;
      case "service-status": {
        const relevantDevices = linkedCustomer ? data!.devices.filter(device => device.customerId === linkedCustomer.id) : [];
        const offline = relevantDevices.some(device => device.status === "Offline"); const degraded = relevantDevices.some(device => device.status === "Degraded");
        const state = portalProfile.packageStatus !== "Active" ? portalProfile.packageStatus : linkedCustomer?.status !== "Active" ? linkedCustomer?.status || "Unknown" : offline ? "Offline" : degraded ? "Degraded" : "Online";
        return <><div className={`crm-service-orb ${state === "Online" ? "online" : state === "Degraded" ? "warning" : "offline"}`}><Wifi size={40} /><h2>{state}</h2><p>{state === "Online" ? "Your saved service record shows no current interruption." : "Your connection may need attention. Contact support to open a complaint."}</p></div><div className="crm-stats"><Panel><small>Account status</small><strong>{linkedCustomer?.status || "Active"}</strong></Panel><Panel><small>Registered devices</small><strong>{relevantDevices.length}</strong></Panel><Panel><small>Open area alerts</small><strong>{linkedCustomer ? data!.alerts.filter(alert => alert.area === linkedCustomer.area && alert.status !== "Resolved").length : 0}</strong></Panel></div><Panel><p>Status is based on saved CRM/network records in this browser. Live router or OLT polling requires a server integration.</p><Button onClick={supportConversationForm}>Report an issue</Button></Panel></>;
      }
      case "upgrades": return <><Panel><div className="crm-access-intro"><div><h2>Internet and device upgrades</h2><p>Request better speed, stronger Wi-Fi coverage, a router/ONU replacement or a static IP.</p></div><Button onClick={upgradeRequestForm}>Request upgrade</Button></div></Panel><div className="crm-portal-actions">{[["Wi-Fi 6 router", "Better speed and capacity for modern devices"], ["Mesh Wi-Fi", "Extend coverage across larger homes"], ["ONU replacement", "Request fibre terminal inspection or upgrade"], ["Static IP", "For remote access and business services"]].map(([title, description]) => <Panel key={title}><Router size={23} /><h3>{title}</h3><p>{description}</p></Panel>)}</div>{portalProfile.upgradeRequest && <Panel><h2>Latest request</h2><p>{portalProfile.upgradeRequest}</p><span className="crm-status">Submitted</span></Panel>}</>;
      case "dashboard": {
        const collections = data!.payments.filter(p => p.date === today()).reduce((sum, p) => sum + p.amount, 0);
        const outstandingTotal = data!.invoices.reduce((sum, i) => sum + outstanding(i, data!.payments), 0);
        const collected = data!.payments.reduce((sum, p) => sum + p.amount, 0);
        const spent = data!.expenses.reduce((sum, e) => sum + e.amount, 0);
        return <><div className="crm-stats">{[["Today's collection", money(collections)], ["Outstanding", money(outstandingTotal)], ["Active customers", String(data!.customers.filter(c => c.status === "Active").length)], ["Open tickets", String(data!.tickets.filter(t => t.status !== "Resolved").length)]].map(([label, value]) => <Panel key={label}><small>{label}</small><strong>{value}</strong></Panel>)}</div><div className="crm-two-col"><Panel><h2>Cash flow</h2><p>All saved demo transactions</p><div className="crm-stats"><div><small>Collected</small><strong>{money(collected)}</strong></div><div><small>Expenses</small><strong>{money(spent)}</strong></div><div><small>Net cash</small><strong>{money(collected - spent)}</strong></div></div><div className="crm-actions"><Button onClick={() => paymentForm()}>Record payment</Button><Button variant="outline" onClick={expenseForm}>Add expense</Button><Button variant="outline" onClick={() => go("reports")}>View reports</Button></div></Panel><Panel><h2>Network inventory</h2><p>Manually maintained demo statuses</p>{["Online", "Degraded", "Offline"].map(status => <div className="crm-summary-row" key={status}><span>{status}</span><strong>{data!.devices.filter(d => d.status === status).length}</strong></div>)}<Button variant="outline" onClick={() => go("network")}>Open network</Button></Panel></div>{customerActivityRows.length > 0 && <><Panel><h2>Customer portal updates</h2><p>Package selections, pending payments and customer actions sync here automatically.</p></Panel><DataTable title="Customer activity" rows={customerActivityRows} actions={portalActivityActions} /></>}<DataTable title="Priority tickets" rows={ticketRows.filter(t => t.Status !== "Resolved")} actions={ticketActions} /></>;
      }
      case "customers": return <><Panel><h2>Customers sync automatically</h2><p>Only Customer accounts created in Users & Access appear here. Add or disable customer logins there; package, payment and finance records update across CRM & ERP.</p><Button onClick={() => go("users")}><UserCog size={16} /> Open Users & Access</Button></Panel><DataTable title="Customers" rows={customerRows} search={globalSearch} actions={id => { const customer = person(id); return <><Button size="sm" variant="outline" onClick={() => setDetail({ kind: "customer", id })}>Open</Button><Button size="sm" variant="outline" onClick={() => manageCustomerService(id)}>Mbps / price</Button><Button size="sm" onClick={() => run(() => toggleCustomerService(id))}>{customer?.status === "Active" ? "Deactivate" : "Activate"}</Button></>; }} /></>;
      case "billing": return <><div className="crm-actions"><Button onClick={billingRun}>Preview / run billing</Button><Button variant="outline" onClick={() => paymentForm()}>Record payment</Button></div><DataTable title="Invoices" rows={invoiceRows} actions={id => <><Button size="sm" variant="outline" onClick={() => run(() => printRows(`${data!.settings.company} · Invoice`, invoiceRows.filter(i => i.ID === id)))}>Print / PDF</Button><Button size="sm" disabled={outstanding(data!.invoices.find(i => i.id === id)!, data!.payments) <= 0} onClick={() => paymentForm(id)}>Pay</Button></>} /></>;
      case "payments": return <><div className="crm-actions"><Button onClick={() => paymentForm()}>New payment</Button><Button variant="outline" onClick={expenseForm}>Record expense</Button></div><DataTable title="Payments" rows={paymentRows} actions={id => <><Button variant="outline" size="sm" onClick={() => run(() => receipt(id))}>Print receipt</Button><Button variant="outline" size="sm" onClick={() => run(() => receipt(id, true))}>WhatsApp receipt</Button></>} /><DataTable title="Expenses" rows={expenseRows} /></>;
      case "recovery": return <><Panel><h2>Collection follow-up</h2><p>Compose reminders individually. Sending requires confirmation in WhatsApp; this app does not send bulk messages.</p><Button variant="outline" onClick={() => download("reminder-list.csv", exportCsv(recoveryRows))}>Export reminder list</Button></Panel><DataTable title="Recovery" rows={recoveryRows} actions={id => <><Button size="sm" variant="outline" onClick={() => run(() => reminder(id))}>Remind</Button><Button size="sm" variant="outline" onClick={() => setForm({ title: "Promise to pay", fields: [{ key: "date", label: "Promise date", type: "date", value: person(id)?.promise || today() }], submit: v => save(s => ({ ...s, customers: s.customers.map(c => c.id === id ? { ...c, promise: v.date } : c) })) })}>Promise date</Button><Button size="sm" onClick={() => paymentForm(data!.invoices.find(i => i.customerId === id && outstanding(i, data!.payments) > 0)?.id)}>Collect</Button></>} /></>;
      case "tickets": return <><Button onClick={() => editTicket()}>Create ticket</Button><DataTable title="Tickets" rows={ticketRows} actions={ticketActions} /></>;
      case "network": return <><div className="crm-actions"><Button onClick={addAlert}>Add alert</Button><Button variant="outline" onClick={() => { setGlobalSearch(""); toast.info("Showing current saved demo inventory. Live polling is not configured."); }}>Refresh saved overview</Button></div><div className="crm-area-grid">{[...new Set(data!.devices.map(d => d.area))].map(area => <button className="crm-panel" key={area} onClick={() => { go("devices"); setGlobalSearch(area); }}><Network size={22} /><h3>{area}</h3><p>{data!.devices.filter(d => d.area === area).length} devices · {data!.devices.filter(d => d.area === area && d.status === "Offline").length} offline</p></button>)}</div><DataTable title="Alerts" rows={alertRows} actions={id => <><Button size="sm" disabled={data!.alerts.find(a => a.id === id)?.status === "Resolved"} onClick={() => run(() => save(s => ({ ...s, alerts: s.alerts.map(a => a.id === id ? { ...a, status: "Resolved" } : a) })))}>Resolve</Button><Button variant="outline" size="sm" onClick={() => { const a = data!.alerts.find(a => a.id === id)!; if (a.ticketId) { go("tickets"); setDetail({ kind: "ticket", id: a.ticketId }); return; } setForm({ title: "Create linked incident ticket", fields: [{ key: "customerId", label: "Affected customer", options: customerOptions }], submit: v => { const ticketId = newId("TK"); save(s => ({ ...s, alerts: s.alerts.map(old => old.id === id ? { ...old, ticketId } : old), tickets: [...s.tickets, { id: ticketId, customerId: v.customerId, subject: `${a.title} — ${a.area}`, priority: a.severity === "Critical" ? "Critical" : "Medium", status: "Open", assignedTo: null, createdAt: new Date().toISOString(), resolvedAt: null, messages: [] }] })); } }); }}>Incident ticket</Button></>} /></>;
      case "devices": return <><Button onClick={() => editDevice()}>Add device</Button><DataTable title="Devices" rows={deviceRows} search={globalSearch} actions={id => <Button size="sm" variant="outline" onClick={() => setDetail({ kind: "device", id })}>Manage</Button>} /></>;
      case "reports": return <><Panel><h2>Reports from saved records</h2><div className="crm-toolbar"><select aria-label="Report type" value={report} onChange={e => setReport(e.target.value)}>{Object.keys(rowsForReport).map(key => <option key={key}>{key}</option>)}</select><label>From <input aria-label="Report from date" type="date" value={from} onChange={e => setFrom(e.target.value)} /></label><label>To <input aria-label="Report to date" type="date" min={from} value={to} onChange={e => setTo(e.target.value)} /></label><Button variant="outline" onClick={() => { setFrom(""); setTo(""); }}>Clear dates</Button><Button onClick={() => run(() => printRows(`${data!.settings.company} · ${report}`, reportRows))}>Print / Save PDF</Button></div><p>Date filters apply to dated records; customer and device reports show the current inventory.</p></Panel><DataTable key={report} title={`${report} report`} rows={reportRows} /></>;
      case "staff": return <><Button onClick={() => editStaff()}>Add staff</Button><DataTable title="Staff" rows={data!.staff.map(s => ({ ID: s.id, Name: s.name, Role: s.role, Area: s.area, "Active assignments": data!.tickets.filter(t => t.assignedTo === s.id && t.status !== "Resolved").length, Status: s.status }))} actions={id => <><Button variant="outline" size="sm" onClick={() => setDetail({ kind: "staff", id })}>Assignments</Button><Button variant="outline" size="sm" onClick={() => editStaff(id)}>Edit</Button></>} /></>;
      case "users": return <><div className="crm-stats"><Panel><small>Total login users</small><strong>{accessRows.length}</strong></Panel><Panel><small>Customer accounts</small><strong>{accessUsers.filter(user => user.accountType === "customer").length}</strong></Panel><Panel><small>Employee accounts</small><strong>{accessUsers.filter(user => user.accountType === "employee").length}</strong></Panel><Panel><small>Pending payments</small><strong>{customerActivityRows.filter(row => row["Payment status"] === "Pending").length}</strong></Panel></div><Panel><div className="crm-access-intro"><div><h2>Customer & employee access</h2><p>Create logins and link customer accounts to CRM records. Customer actions and payment status appear below automatically.</p><p className="crm-security-note">Browser demo: passwords are hashed on this device, but production-grade security requires a server and database.</p></div><Button onClick={() => editAccessUser()}><Plus size={16} /> Add user</Button></div></Panel><DataTable title="Users & access" rows={accessRows} actions={id => id === "admin-test" ? <span className="crm-status">Fixed admin</span> : <Button size="sm" variant="outline" onClick={() => editAccessUser(id)}>Edit access</Button>} />{customerActivityRows.length > 0 && <DataTable title="Customer portal activity" rows={customerActivityRows} actions={portalActivityActions} />}</>;
      case "settings": return settingsView();
      case "technician": return <><Panel><h2>Field assignments</h2><label className="crm-field">Technician<select value={technician} onChange={e => setTechnician(e.target.value)}><option value="">All staff</option>{staffOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</select></label></Panel><div className="crm-area-grid">{data!.tickets.filter(t => t.status !== "Resolved" && (!technician || t.assignedTo === technician)).map(t => { const c = person(t.customerId)!; return <Panel key={t.id}><span className="crm-status">{t.priority}</span><h2>{t.subject}</h2><p>{c.name} · {c.area}</p><p>{data!.staff.find(s => s.id === t.assignedTo)?.name || "Unassigned"}</p><div className="crm-actions"><a className="crm-link" href={`tel:${c.phone.replace(/[^+\d]/g, "")}`}>Call</a><a className="crm-link" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${c.area}, Karachi`)}`} target="_blank" rel="noreferrer">Map</a><Button size="sm" onClick={() => setDetail({ kind: "ticket", id: t.id })}>Open job</Button><Button size="sm" variant="outline" onClick={() => run(() => save(s => ({ ...s, tickets: s.tickets.map(old => old.id === t.id ? resolveTicket(old, new Date().toISOString()) : old) })))}>Complete</Button></div></Panel>; })}</div>{!data!.tickets.some(t => t.status !== "Resolved" && (!technician || t.assignedTo === technician)) && <Panel>No open assignments for this selection.</Panel>}</>;
    }
  }
  if (!identity) return <LoginScreen company={data.settings.company} onLogin={async (username, password) => {
    const authenticated = await authenticateAccessUser(username, password);
    if (!authenticated) return false;
    setSessionUsername(authenticated.username);
    setScreen(authenticated.modules[0] || "dashboard");
    return true;
  }} />;
  return <div className={`crm-app ${data.settings.dark ? "crm-dark" : ""}`} dir={data.settings.urdu ? "rtl" : "ltr"}>
    {menu && <button className="crm-overlay" aria-label="Close navigation" onClick={() => setMenu(false)} />}
    <aside className={`crm-sidebar ${menu ? "crm-open" : ""}`}><div className="crm-brand"><Image src="/speed-vision-logo.jpg" alt="Speed vision logo" width={64} height={48} /><div><strong>{data.settings.company}</strong><small>FTTH Broadband</small></div><button className="crm-mobile-close" aria-label="Close navigation" onClick={() => setMenu(false)}><X size={20} /></button></div><div className="crm-user-card"><span>{identity.name}</span></div><p className="crm-nav-label">WORKSPACE</p><nav>{accessibleNavigation.map(([id, label, urdu, Icon]) => <button key={id} className={activeScreen === id ? "active" : ""} onClick={() => go(id)}><Icon size={19} /><span>{data.settings.urdu ? urdu : label}</span>{id === "tickets" && data.tickets.some(t => t.status !== "Resolved") && <b>{data.tickets.filter(t => t.status !== "Resolved").length}</b>}</button>)}</nav><button className="crm-signout" aria-label="Log out" onClick={logout}><LogOut size={18} /><span>{data.settings.urdu ? "لاگ آؤٹ" : "Log out"}</span></button></aside>
    <div className="crm-main"><header className="crm-header"><button className="crm-menu" aria-label="Open navigation" onClick={() => setMenu(true)}><Menu size={22} /></button>{identity.modules.includes("customers") ? <form className="crm-search" onSubmit={event => { event.preventDefault(); go("customers"); }}><Search size={17} /><input aria-label="Search customers globally" value={globalSearch} onChange={e => setGlobalSearch(e.target.value)} placeholder="Search customers, phone, username or IP…" />{globalSearch && <button type="button" aria-label="Clear search" onClick={() => setGlobalSearch("")}><X size={16} /></button>}</form> : <div className="crm-header-spacer" />}<button aria-label="Toggle dark mode" onClick={() => run(() => save(s => ({ ...s, settings: { ...s.settings, dark: !s.settings.dark } })))}>{data.settings.dark ? <Sun size={19} /> : <Moon size={19} />}</button><button aria-label="Toggle navigation language" onClick={() => run(() => save(s => ({ ...s, settings: { ...s.settings, urdu: !s.settings.urdu } })))}>{data.settings.urdu ? "EN" : "اردو"}</button>{identity.modules.includes("network") && <button aria-label="Open alerts" onClick={() => go("network")}><Bell size={19} /></button>}{(identity.modules.includes("payments") || identity.modules.includes("billing")) && <Button onClick={() => paymentForm()} aria-label="Add payment"><Plus size={17} /><span className="crm-payment-label">Add payment</span></Button>}<button className="crm-header-logout" aria-label="Log out" title="Log out" onClick={logout}><LogOut size={17} /><span>{data.settings.urdu ? "لاگ آؤٹ" : "Logout"}</span></button></header>
      <main className="crm-content"><div className="crm-demo-banner">Browser demo · signed in as {identity.username} · {identity.admin ? "full access" : `${identity.modules.length} modules`} · changes saved on this device</div>{getStorageError() && <p role="alert" className="crm-error">{getStorageError()}</p>}<div className="crm-heading"><div><h1>{activeScreen === "dashboard" ? "Your operation, at a glance" : navigation.find(n => n[0] === activeScreen)?.[1]}</h1><p>{data.settings.company} · CRM & ERP</p></div><span>{today()}</span></div><div className="crm-screen" key={`${activeScreen}-${detail?.id || "list"}`}>{content()}</div></main></div>
    {form && <Editor form={form} close={() => setForm(null)} />}<Toaster richColors position="top-right" />
    <input ref={restoreFile} type="file" accept=".json,application/json" hidden onChange={async event => { const file = event.target.files?.[0]; event.target.value = ""; if (!file) return; try { if (file.size > 10000000) throw new Error("Backup exceeds 10 MB."); const parsed: unknown = JSON.parse(await file.text()); setForm({ title: "Replace browser data?", description: "Restoring replaces all current records in this browser. Download a backup first if you need to keep them.", fields: [], button: "Restore backup", submit: () => { restoreStore(parsed); setDetail(null); toast.success("Backup restored"); } }); } catch (error) { toast.error(errorText(error)); } }} />
  </div>;
}
