"use client";

import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  BadgeCheck,
  Banknote,
  Bell,
  Building2,
  Cable,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Download,
  FileBarChart,
  FileText,
  Filter,
  Fuel,
  Gauge,
  Globe2,
  Headphones,
  Languages,
  LayoutDashboard,
  LocateFixed,
  MapPin,
  MapPinned,
  MessageCircle,
  Moon,
  MoreHorizontal,
  Network,
  Package,
  Phone,
  Plus,
  Printer,
  Radio,
  ReceiptText,
  RefreshCw,
  Router,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Signal,
  Smartphone,
  Sun,
  TicketCheck,
  UserRound,
  Users,
  WalletCards,
  Wifi,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/sonner";

type Screen =
  | "dashboard"
  | "customers"
  | "billing"
  | "payments"
  | "recovery"
  | "tickets"
  | "network"
  | "devices"
  | "reports"
  | "staff"
  | "settings"
  | "technician";
type Lang = "en" | "ur";

type NavItem = {
  id: Screen;
  label: string;
  ur: string;
  icon: LucideIcon;
  badge?: string;
};

const navigation: NavItem[] = [
  { id: "dashboard", label: "Dashboard", ur: "ڈیش بورڈ", icon: LayoutDashboard },
  { id: "customers", label: "Customers", ur: "صارفین", icon: Users },
  { id: "billing", label: "Billing", ur: "بلنگ", icon: CreditCard },
  { id: "payments", label: "Payments", ur: "ادائیگیاں", icon: WalletCards },
  { id: "recovery", label: "Recovery", ur: "وصولی", icon: CircleDollarSign },
  { id: "tickets", label: "Tickets", ur: "شکایات", icon: Headphones, badge: "37" },
  { id: "network", label: "Network", ur: "نیٹ ورک", icon: Network, badge: "3" },
  { id: "devices", label: "Devices", ur: "آلات", icon: Router },
  { id: "reports", label: "Reports", ur: "رپورٹس", icon: FileBarChart },
  { id: "staff", label: "Staff", ur: "عملہ", icon: UserRound },
  { id: "settings", label: "Settings", ur: "ترتیبات", icon: Settings },
];

const customers = [
  { id: "KHI-10482", name: "Sana Ahmed", initials: "SA", phone: "0301-8423176", area: "Gulshan-e-Iqbal", package: "50 Mbps", balance: "Rs. 0", status: "Active", ip: "103.164.22.18" },
  { id: "KHI-10931", name: "Bilal Khan", initials: "BK", phone: "0333-5912048", area: "DHA Phase 6", package: "20 Mbps", balance: "Rs. 2,800", status: "Suspended", ip: "103.164.31.90" },
  { id: "KHI-09714", name: "Hira Shah", initials: "HS", phone: "0321-7754692", area: "North Nazimabad", package: "30 Mbps", balance: "Rs. 1,250", status: "Active", ip: "103.164.19.33" },
  { id: "KHI-11826", name: "Farhan Siddiqui", initials: "FS", phone: "0300-2187934", area: "Clifton Block 2", package: "100 Mbps", balance: "Rs. 0", status: "Active", ip: "103.164.42.81" },
  { id: "KHI-12008", name: "Areeba Qureshi", initials: "AQ", phone: "0345-6621093", area: "Gulistan-e-Johar", package: "10 Mbps", balance: "Rs. 1,800", status: "Trial", ip: "103.164.17.52" },
  { id: "KHI-08831", name: "Usman Ali", initials: "UA", phone: "0312-9081475", area: "Korangi", package: "20 Mbps", balance: "Rs. 4,200", status: "Disconnected", ip: "103.164.27.11" },
];

const tickets = [
  { id: "TK-2841", customer: "Sana Ahmed", area: "Gulshan-e-Iqbal", issue: "No internet", priority: "Critical", status: "Open", age: "18 min", tech: "Hamza" },
  { id: "TK-2838", customer: "Bilal Khan", area: "DHA Phase 6", issue: "Slow speed", priority: "High", status: "In Progress", age: "42 min", tech: "Zain" },
  { id: "TK-2833", customer: "Hira Shah", area: "North Nazimabad", issue: "Billing dispute", priority: "Medium", status: "Open", age: "1 hr 12 min", tech: "Areej" },
  { id: "TK-2829", customer: "Muhammad Rehan", area: "Malir", issue: "Relocation", priority: "Low", status: "In Progress", age: "2 hr 04 min", tech: "Ali" },
];

const devices = [
  { name: "OLT-GUL-01", kind: "Huawei MA5800", area: "Gulshan Block 13-D", signal: "—", uptime: "118d 06h", load: "72%", state: "Online" },
  { name: "ONU-KHI-10482", kind: "Huawei HG8245H", area: "Gulshan-e-Iqbal", signal: "-18.2 dBm", uptime: "6d 12h", load: "18 Mbps", state: "Online" },
  { name: "CCR-DHA-CORE", kind: "MikroTik CCR1036", area: "DHA Phase 6", signal: "—", uptime: "43d 09h", load: "81%", state: "Degraded" },
  { name: "SW-KOR-14", kind: "Cisco CBS350", area: "Korangi Sector 31", signal: "—", uptime: "—", load: "0%", state: "Offline" },
];

const defaulters = [
  { customer: "Usman Ali", area: "Korangi", phone: "0312-9081475", amount: "Rs. 4,200", overdue: 47, promise: "—" },
  { customer: "Noman Yousuf", area: "Orangi Town", phone: "0307-4468210", amount: "Rs. 6,750", overdue: 39, promise: "02/10/2026" },
  { customer: "Rabia Khalid", area: "Saddar", phone: "0334-8801265", amount: "Rs. 3,500", overdue: 32, promise: "29/09/2026" },
  { customer: "Bilal Khan", area: "DHA Phase 6", phone: "0333-5912048", amount: "Rs. 2,800", overdue: 18, promise: "01/10/2026" },
];

const invoices = [
  { no: "INV-2609-1842", customer: "Sana Ahmed", period: "Sep 2026", total: "Rs. 5,200", due: "05/09/2026", status: "Paid" },
  { no: "INV-2609-1931", customer: "Bilal Khan", period: "Sep 2026", total: "Rs. 2,800", due: "05/09/2026", status: "Overdue" },
  { no: "INV-2609-1714", customer: "Hira Shah", period: "Sep 2026", total: "Rs. 3,450", due: "05/09/2026", status: "Partial" },
  { no: "INV-2609-1826", customer: "Farhan Siddiqui", period: "Sep 2026", total: "Rs. 9,500", due: "05/09/2026", status: "Paid" },
];

const monthly = [44, 53, 48, 61, 58, 68, 72, 66, 78, 82, 76, 88];
const months = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];

function t(lang: Lang, en: string, ur: string) {
  return lang === "ur" ? ur : en;
}

function Logo() {
  return (
    <div className="flex items-center gap-3 px-2 py-2">
      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-teal-400 text-slate-950 shadow-[0_8px_20px_rgba(45,212,191,.24)]">
        <Activity className="size-5" strokeWidth={2.5} />
      </div>
      <div className="group-data-[collapsible=icon]:hidden">
        <p className="text-[15px] font-extrabold tracking-[-.02em] text-white">NexLink Ops</p>
        <p className="text-xs text-slate-400">Karachi Network</p>
      </div>
    </div>
  );
}

function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`surface rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,.025)] ${className}`}>{children}</div>;
}

function PageHeading({ title, subtitle, actions }: { title: string; subtitle: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="text-2xl font-bold tracking-[-.035em] text-slate-950 md:text-[30px]">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

function Status({ children, tone = "green" }: { children: React.ReactNode; tone?: "green" | "amber" | "red" | "blue" | "slate" }) {
  return <span className={`status status-${tone}`}><span className="status-dot" />{children}</span>;
}

function TableToolbar({ query, onQuery, area, onArea, exportName = "report" }: { query?: string; onQuery?: (value: string) => void; area?: string; onArea?: (value: string) => void; exportName?: string }) {
  const exportCsv = () => {
    const blob = new Blob(["Name,Area,Status\nSana Ahmed,Gulshan-e-Iqbal,Active\nBilal Khan,DHA Phase 6,Suspended"], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${exportName}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Excel-ready CSV exported");
  };
  return (
    <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center">
      <div className="relative min-w-0 flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input value={query} onChange={(e) => onQuery?.(e.target.value)} placeholder="Search records..." className="control h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
      </div>
      {onArea && (
        <Select value={area} onValueChange={onArea}>
          <SelectTrigger className="control h-10 w-full rounded-xl bg-white lg:w-44"><MapPin /><SelectValue placeholder="All areas" /></SelectTrigger>
          <SelectContent>
            {["All areas", "Gulshan-e-Iqbal", "DHA Phase 6", "North Nazimabad", "Korangi"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
          </SelectContent>
        </Select>
      )}
      <Button variant="outline" className="h-10 rounded-xl" onClick={() => toast.info("Filters are ready to configure")}><Filter /> Filters</Button>
      <Button variant="outline" className="h-10 rounded-xl" onClick={exportCsv}><Download /> Excel</Button>
    </div>
  );
}

function Pagination() {
  return (
    <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
      <span>Showing 1–6 of 2,486</span>
      <div className="flex gap-1">
        <Button variant="outline" size="icon-sm" aria-label="Previous page"><ChevronLeft /></Button>
        <Button size="icon-sm">1</Button>
        <Button variant="outline" size="icon-sm">2</Button>
        <Button variant="outline" size="icon-sm" aria-label="Next page"><ChevronRight /></Button>
      </div>
    </div>
  );
}

function MetricCard({ label, value, note, icon: Icon, tone = "blue" }: { label: string; value: string; note: string; icon: LucideIcon; tone?: string }) {
  return (
    <Card className="group overflow-hidden p-5 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/60">
      <div className="flex items-start justify-between gap-3">
        <div><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold tracking-[-.04em] text-slate-950">{value}</p></div>
        <span className={`metric-icon metric-${tone}`}><Icon className="size-4" /></span>
      </div>
      <p className="mt-4 text-xs font-medium text-slate-500">{note}</p>
    </Card>
  );
}

function Dashboard({ lang, go }: { lang: Lang; go: (screen: Screen) => void }) {
  return (
    <>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-slate-500"><span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,.12)]" />{t(lang, "All core systems operational", "تمام بنیادی نظام فعال ہیں")}</div>
          <h1 className="text-2xl font-bold tracking-[-.035em] text-slate-950 md:text-[30px]">{t(lang, "Good morning, Ahsan", "صبح بخیر، احسن")}</h1>
          <p className="mt-1 text-sm text-slate-500">{t(lang, "Here’s what’s happening across your network today.", "آج آپ کے نیٹ ورک کی تازہ صورتحال۔")}</p>
        </div>
        <div className="surface rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600 shadow-sm">Monday, 28 September 2026</div>
      </div>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Key metrics">
        <MetricCard label={t(lang, "Today's collection", "آج کی وصولی")} value="Rs. 286,450" note="+12.4% vs yesterday" icon={Banknote} tone="teal" />
        <MetricCard label={t(lang, "Monthly revenue", "ماہانہ آمدنی")} value="Rs. 8.42M" note="76% of target" icon={ArrowUpRight} tone="blue" />
        <MetricCard label={t(lang, "Pending dues", "واجب الادا رقم")} value="Rs. 1.18M" note="214 accounts" icon={Clock3} tone="amber" />
        <MetricCard label={t(lang, "Open tickets", "کھلی شکایات")} value="37" note="6 nearing SLA" icon={TicketCheck} tone="red" />
      </section>
      <section className="mt-4 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Card className="p-5 md:p-6">
          <div className="flex items-center justify-between">
            <div><h2 className="font-bold text-slate-900">{t(lang, "Revenue overview", "آمدنی کا جائزہ")}</h2><p className="mt-1 text-xs text-slate-500">Collections vs target • Last 12 months</p></div>
            <button className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600">12 months</button>
          </div>
          <div className="relative mt-7">
            <div className="pointer-events-none absolute inset-0 flex flex-col justify-between"><i className="border-t border-dashed border-slate-100" /><i className="border-t border-dashed border-slate-100" /><i className="border-t border-dashed border-slate-100" /></div>
            <div className="relative grid h-52 grid-cols-12 items-end gap-2 border-b border-slate-200 md:gap-4">
              {monthly.map((height, index) => <div key={index} className="group/bar relative flex h-full items-end"><div className="w-full rounded-t-lg bg-gradient-to-t from-blue-600 to-cyan-400 transition group-hover/bar:from-teal-600 group-hover/bar:to-teal-300" style={{ height: `${height}%` }} /></div>)}
            </div>
          </div>
          <div className="mt-3 grid grid-cols-6 gap-2 text-center text-[11px] text-slate-400 md:grid-cols-12">{months.map((m) => <span key={m}>{m}</span>)}</div>
        </Card>
        <Card className="dark-card border-0 bg-slate-950 p-5 text-white shadow-[0_16px_40px_rgba(15,23,42,.18)] md:p-6">
          <div className="flex items-center justify-between"><div><h2 className="font-bold">{t(lang, "Network health", "نیٹ ورک کی حالت")}</h2><p className="mt-1 text-xs text-slate-400">Live • refreshed just now</p></div><MapPinned className="size-5 text-teal-300" /></div>
          <div className="my-6 flex items-center gap-5">
            <div className="grid size-24 shrink-0 place-items-center rounded-full bg-[conic-gradient(#2dd4bf_0_94%,#334155_94%_100%)]"><div className="grid size-[76px] place-items-center rounded-full bg-slate-950"><div className="text-center"><p className="text-2xl font-bold">94%</p><p className="text-[10px] text-slate-400">Healthy</p></div></div></div>
            <div className="flex-1 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-slate-400">Online devices</span><strong>1,482</strong></div>
              <div className="flex justify-between"><span className="text-slate-400">Degraded</span><strong className="text-amber-300">24</strong></div>
              <div className="flex justify-between"><span className="text-slate-400">Offline</span><strong className="text-rose-300">11</strong></div>
            </div>
          </div>
          <button onClick={() => go("network")} className="flex w-full items-center justify-between rounded-xl bg-white/[.07] px-4 py-3 text-sm font-semibold transition hover:bg-white/10">Open network map <ChevronRight className="size-4 rtl:rotate-180" /></button>
        </Card>
      </section>
      <section className="mt-4 grid gap-4 xl:grid-cols-[1.3fr_.7fr]">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 md:px-6"><div><h2 className="font-bold text-slate-900">Priority tickets</h2><p className="mt-0.5 text-xs text-slate-500">Issues needing attention now</p></div><button onClick={() => go("tickets")} className="text-sm font-semibold text-blue-600">View all</button></div>
          <Table>
            <TableHeader className="bg-slate-50/80"><TableRow><TableHead className="px-6">Ticket</TableHead><TableHead>Customer</TableHead><TableHead>Issue</TableHead><TableHead>Priority</TableHead><TableHead>Age</TableHead></TableRow></TableHeader>
            <TableBody>{tickets.slice(0, 3).map((item) => <TableRow key={item.id} onClick={() => go("tickets")} className="cursor-pointer"><TableCell className="px-6 font-semibold">{item.id}</TableCell><TableCell><p className="font-medium">{item.customer}</p><p className="text-xs text-slate-400">{item.area}</p></TableCell><TableCell>{item.issue}</TableCell><TableCell><Status tone={item.priority === "Critical" ? "red" : item.priority === "High" ? "amber" : "blue"}>{item.priority}</Status></TableCell><TableCell>{item.age}</TableCell></TableRow>)}</TableBody>
          </Table>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between"><div><h2 className="font-bold">Collection mix</h2><p className="mt-1 text-xs text-slate-500">Today • Rs. 286,450</p></div><MoreHorizontal className="size-5 text-slate-400" /></div>
          <div className="mx-auto my-5 grid size-36 place-items-center rounded-full bg-[conic-gradient(#2563eb_0_42%,#14b8a6_42%_68%,#f59e0b_68%_84%,#8b5cf6_84%_100%)]"><div className="surface grid size-[98px] place-items-center rounded-full bg-white text-center"><div><p className="text-xs text-slate-400">Payments</p><p className="text-xl font-bold">184</p></div></div></div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm"><span><i className="mr-2 inline-block size-2 rounded-full bg-blue-600" />Cash 42%</span><span><i className="mr-2 inline-block size-2 rounded-full bg-teal-500" />Bank 26%</span><span><i className="mr-2 inline-block size-2 rounded-full bg-amber-500" />JazzCash 16%</span><span><i className="mr-2 inline-block size-2 rounded-full bg-violet-500" />Other 16%</span></div>
        </Card>
      </section>
    </>
  );
}

function CustomerProfile({ onBack }: { onBack: () => void }) {
  return (
    <>
      <button onClick={onBack} className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600"><ChevronLeft className="size-4" /> Back to customers</button>
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-slate-950 p-6 text-white md:p-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              <div className="grid size-16 place-items-center rounded-2xl bg-teal-400 text-xl font-black text-slate-950">SA</div>
              <div><div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-bold">Sana Ahmed</h1><Status>Active</Status></div><p className="mt-1 text-sm text-slate-300">KHI-10482 • Customer since 18/02/2022</p></div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10" onClick={() => toast.success("WhatsApp opened for Sana")}><MessageCircle /> WhatsApp</Button>
              <Button className="bg-teal-400 text-slate-950 hover:bg-teal-300" onClick={() => toast.success("ONU reboot command queued")}><RefreshCw /> Reboot ONU</Button>
            </div>
          </div>
        </div>
        <div className="grid divide-y divide-slate-100 md:grid-cols-4 md:divide-x md:divide-y-0">
          {[["Package", "50 Mbps Fiber"], ["Monthly bill", "Rs. 5,200"], ["Connection", "Online • -18.2 dBm"], ["Current balance", "Rs. 0"]].map(([label, value]) => <div key={label} className="p-5"><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 font-bold text-slate-900">{value}</p></div>)}
        </div>
      </Card>
      <Tabs defaultValue="overview" className="mt-4">
        <TabsList variant="line" className="w-full justify-start overflow-x-auto border-b border-slate-200">
          <TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="billing">Billing history</TabsTrigger><TabsTrigger value="tickets">Tickets</TabsTrigger><TabsTrigger value="devices">Devices</TabsTrigger><TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="grid gap-4 lg:grid-cols-[1fr_.75fr]">
            <Card className="p-5">
              <h2 className="font-bold">Customer details</h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                {[["CNIC", "42101-7832149-6"], ["Phone", "0301-8423176"], ["WhatsApp", "0301-8423176"], ["Email", "sana.ahmed@example.pk"], ["Address", "House 44, Block 13-D/2, Gulshan-e-Iqbal"], ["Installation", "18/02/2022"]].map(([label, value]) => <div key={label}><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 text-sm font-medium text-slate-800">{value}</p></div>)}
              </div>
            </Card>
            <Card className="p-5">
              <div className="flex items-center justify-between"><h2 className="font-bold">Live device</h2><Status>Online</Status></div>
              <div className="mt-4 rounded-xl bg-slate-950 p-4 text-white"><div className="flex items-center gap-3"><Router className="size-8 text-teal-300" /><div><p className="font-semibold">Huawei HG8245H</p><p className="text-xs text-slate-400">Serial: 48575443A91B02EF</p></div></div><div className="mt-4 grid grid-cols-3 gap-2 text-center"><div className="rounded-lg bg-white/[.06] p-2"><p className="text-xs text-slate-400">Signal</p><p className="mt-1 text-sm font-bold">-18.2 dBm</p></div><div className="rounded-lg bg-white/[.06] p-2"><p className="text-xs text-slate-400">Uptime</p><p className="mt-1 text-sm font-bold">6d 12h</p></div><div className="rounded-lg bg-white/[.06] p-2"><p className="text-xs text-slate-400">Speed</p><p className="mt-1 text-sm font-bold">48.7 Mbps</p></div></div></div>
              <div className="mt-3 flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => toast.success("Speed profile updated")}>Change speed</Button><Button size="sm" variant="outline" onClick={() => toast.warning("PPPoE user disabled")}>Disable PPPoE</Button></div>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="billing"><Card className="p-6"><h2 className="font-bold">Recent payments</h2><p className="mt-2 text-sm text-slate-500">12 paid invoices • No current balance • Rs. 62,400 collected in the last 12 months.</p></Card></TabsContent>
        <TabsContent value="tickets"><Card className="p-6"><h2 className="font-bold">Support history</h2><p className="mt-2 text-sm text-slate-500">3 resolved tickets in the last 6 months. Average resolution time: 1h 18m.</p></Card></TabsContent>
        <TabsContent value="devices"><Card className="p-6"><h2 className="font-bold">Assigned equipment</h2><p className="mt-2 text-sm text-slate-500">1 ONU and 1 TP-Link router are assigned to this connection.</p></Card></TabsContent>
        <TabsContent value="notes"><Card className="p-6"><textarea className="control min-h-32 w-full rounded-xl border border-slate-200 p-3 text-sm" placeholder="Add an internal note..." /><Button className="mt-3" onClick={() => toast.success("Note saved")}>Save note</Button></Card></TabsContent>
      </Tabs>
    </>
  );
}

function CustomersView({ selected, setSelected, initialQuery }: { selected: boolean; setSelected: (value: boolean) => void; initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery ?? "");
  const [area, setArea] = useState("All areas");
  useEffect(() => {
    if (initialQuery !== undefined) setQuery(initialQuery);
  }, [initialQuery]);
  const filtered = useMemo(() => customers.filter((item) => {
    const haystack = `${item.name} ${item.phone} ${item.id} ${item.ip}`.toLowerCase();
    return haystack.includes(query.toLowerCase()) && (area === "All areas" || item.area === area);
  }), [query, area]);
  if (selected) return <CustomerProfile onBack={() => setSelected(false)} />;
  return (
    <>
      <PageHeading title="Customers" subtitle="2,486 total accounts across 14 Karachi service areas." actions={<><Button variant="outline" className="rounded-xl"><Download /> Import</Button><Button className="rounded-xl" onClick={() => toast.success("New customer form ready")}><Plus /> Add customer</Button></>} />
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Active" value="2,248" note="90.4% of customers" icon={BadgeCheck} tone="teal" />
        <MetricCard label="Suspended" value="146" note="Payment overdue" icon={Clock3} tone="amber" />
        <MetricCard label="Trial" value="38" note="7 days remaining avg." icon={Gauge} tone="blue" />
        <MetricCard label="Disconnected" value="54" note="-8 this month" icon={Cable} tone="red" />
      </div>
      <Card className="overflow-hidden">
        <TableToolbar query={query} onQuery={setQuery} area={area} onArea={setArea} exportName="customers-september-2026" />
        <Table>
          <TableHeader className="bg-slate-50/80"><TableRow><TableHead className="px-5">Customer</TableHead><TableHead>Contact</TableHead><TableHead>Area</TableHead><TableHead>Package</TableHead><TableHead>Balance</TableHead><TableHead>Status</TableHead><TableHead /></TableRow></TableHeader>
          <TableBody>
            {filtered.map((item) => <TableRow key={item.id} className="cursor-pointer" onClick={() => setSelected(true)}><TableCell className="px-5"><div className="flex items-center gap-3"><span className="avatar">{item.initials}</span><div><p className="font-semibold text-slate-900">{item.name}</p><p className="text-xs text-slate-400">{item.id} • {item.ip}</p></div></div></TableCell><TableCell>{item.phone}</TableCell><TableCell>{item.area}</TableCell><TableCell>{item.package}</TableCell><TableCell className="font-semibold">{item.balance}</TableCell><TableCell><Status tone={item.status === "Active" ? "green" : item.status === "Trial" ? "blue" : item.status === "Suspended" ? "amber" : "red"}>{item.status}</Status></TableCell><TableCell><ChevronRight className="size-4 text-slate-400" /></TableCell></TableRow>)}
          </TableBody>
        </Table>
        {filtered.length === 0 && <div className="grid place-items-center py-16 text-center"><Search className="mb-3 size-8 text-slate-300" /><p className="font-semibold">No customers found</p><p className="mt-1 text-sm text-slate-500">Try a different name, phone, CNIC, username or IP.</p></div>}
        <Pagination />
      </Card>
    </>
  );
}

function BillingView({ openPayment }: { openPayment: () => void }) {
  const [query, setQuery] = useState("");
  return (
    <>
      <PageHeading title="Billing & invoices" subtitle="Automated monthly billing with pro-rata, discounts and advance balance." actions={<><Button variant="outline" className="rounded-xl" onClick={() => toast.success("Invoice run scheduled for 01/10/2026")}><RefreshCw /> Run billing</Button><Button className="rounded-xl" onClick={openPayment}><Plus /> Record payment</Button></>} />
      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><MetricCard label="September billed" value="Rs. 9.74M" note="2,462 invoices" icon={ReceiptText} tone="blue" /><MetricCard label="Collected" value="Rs. 8.42M" note="86.4% recovery" icon={Banknote} tone="teal" /><MetricCard label="Overdue" value="Rs. 1.18M" note="214 accounts" icon={Clock3} tone="amber" /><MetricCard label="Advance balance" value="Rs. 312K" note="96 accounts" icon={ArrowDownLeft} tone="blue" /></div>
      <Card className="mb-4 overflow-hidden border-blue-200 bg-gradient-to-r from-blue-600 to-cyan-600 p-5 text-white">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div className="flex gap-3"><div className="grid size-11 place-items-center rounded-xl bg-white/15"><Zap /></div><div><h2 className="font-bold">October invoice run is ready</h2><p className="mt-1 text-sm text-blue-100">2,471 recurring invoices • 38 pro-rata adjustments • 12 discounts</p></div></div><Button className="bg-white text-blue-700 hover:bg-blue-50" onClick={() => toast.success("Preview generated")}>Preview run</Button></div>
      </Card>
      <Card className="overflow-hidden">
        <TableToolbar query={query} onQuery={setQuery} exportName="invoices-september-2026" />
        <Table><TableHeader className="bg-slate-50/80"><TableRow><TableHead className="px-5">Invoice</TableHead><TableHead>Customer</TableHead><TableHead>Period</TableHead><TableHead>Total</TableHead><TableHead>Due date</TableHead><TableHead>Status</TableHead><TableHead>Receipt</TableHead></TableRow></TableHeader><TableBody>{invoices.filter((i) => i.customer.toLowerCase().includes(query.toLowerCase()) || i.no.toLowerCase().includes(query.toLowerCase())).map((item) => <TableRow key={item.no}><TableCell className="px-5 font-semibold">{item.no}</TableCell><TableCell>{item.customer}</TableCell><TableCell>{item.period}</TableCell><TableCell className="font-semibold">{item.total}</TableCell><TableCell>{item.due}</TableCell><TableCell><Status tone={item.status === "Paid" ? "green" : item.status === "Overdue" ? "red" : "amber"}>{item.status}</Status></TableCell><TableCell><Button variant="ghost" size="icon-sm" onClick={() => toast.success("Invoice PDF prepared")}><FileText /></Button></TableCell></TableRow>)}</TableBody></Table>
        <Pagination />
      </Card>
    </>
  );
}

function PaymentsView({ openPayment }: { openPayment: () => void }) {
  return (
    <>
      <PageHeading title="Payment counter" subtitle="Fast entry for cash, transfer, wallets, Raast and cheque." actions={<Button className="rounded-xl" onClick={openPayment}><Plus /> New payment</Button>} />
      <div className="grid gap-4 xl:grid-cols-[.85fr_1.15fr]">
        <Card className="p-5 md:p-6">
          <div className="mb-5 flex items-center justify-between"><div><h2 className="font-bold">Quick payment</h2><p className="mt-1 text-sm text-slate-500">Enter customer and amount</p></div><span className="metric-icon metric-teal"><Banknote /></span></div>
          <label className="field-label">Customer</label><div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input className="control h-12 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm" defaultValue="Sana Ahmed — KHI-10482" /></div>
          <div className="mt-4 grid grid-cols-2 gap-3"><div><label className="field-label">Amount</label><input className="control h-12 w-full rounded-xl border border-slate-200 px-3 text-xl font-bold" defaultValue="5,200" /></div><div><label className="field-label">Method</label><Select defaultValue="cash"><SelectTrigger className="control h-12 w-full rounded-xl"><SelectValue /></SelectTrigger><SelectContent>{["cash", "bank", "jazzcash", "easypaisa", "raast", "cheque"].map((item) => <SelectItem key={item} value={item}>{item[0].toUpperCase() + item.slice(1)}</SelectItem>)}</SelectContent></Select></div></div>
          <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm"><div className="flex justify-between"><span className="text-slate-500">September invoice</span><span>Rs. 5,200</span></div><div className="mt-2 flex justify-between"><span className="text-slate-500">Previous balance</span><span>Rs. 0</span></div><div className="mt-3 flex justify-between border-t border-slate-200 pt-3 font-bold"><span>Balance after payment</span><span className="text-emerald-600">Rs. 0</span></div></div>
          <Button className="mt-5 h-12 w-full rounded-xl bg-blue-600 text-base" onClick={() => toast.success("Payment saved — receipt #RCP-0928-184")}>Save & print receipt</Button>
        </Card>
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 p-5"><div><h2 className="font-bold">Today’s payments</h2><p className="mt-1 text-sm text-slate-500">184 transactions • Rs. 286,450</p></div><Button variant="outline" size="sm"><Download /> Export</Button></div>
          <Table><TableHeader className="bg-slate-50/80"><TableRow><TableHead className="px-5">Receipt</TableHead><TableHead>Customer</TableHead><TableHead>Method</TableHead><TableHead>Time</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader><TableBody>{[["RCP-0928-184","Sana Ahmed","Cash","15:42","Rs. 5,200"],["RCP-0928-183","Farhan Siddiqui","Raast","15:36","Rs. 9,500"],["RCP-0928-182","Areeba Qureshi","JazzCash","15:22","Rs. 1,800"],["RCP-0928-181","Ali Raza","Bank Transfer","15:09","Rs. 3,200"],["RCP-0928-180","Mehak Noor","Cash","14:56","Rs. 2,800"]].map((row) => <TableRow key={row[0]}>{row.map((cell, i) => <TableCell key={cell} className={i === 0 ? "px-5 font-semibold" : i === 4 ? "text-right font-bold" : ""}>{cell}</TableCell>)}</TableRow>)}</TableBody></Table>
        </Card>
      </div>
    </>
  );
}

function RecoveryView() {
  return (
    <>
      <PageHeading title="Recovery & defaulters" subtitle="Prioritised follow-up by overdue days, area and promise-to-pay date." actions={<Button variant="outline" className="rounded-xl" onClick={() => toast.success("42 reminders queued for WhatsApp")}><MessageCircle /> Bulk reminder</Button>} />
      <div className="mb-4 grid gap-3 sm:grid-cols-3"><MetricCard label="Total overdue" value="Rs. 1.18M" note="214 accounts" icon={CircleDollarSign} tone="red" /><MetricCard label="Promises this week" value="Rs. 284K" note="61 commitments" icon={Clock3} tone="amber" /><MetricCard label="Recovered today" value="Rs. 91,700" note="38 collections" icon={Banknote} tone="teal" /></div>
      <Card className="overflow-hidden">
        <TableToolbar exportName="defaulters-september-2026" />
        <Table><TableHeader className="bg-slate-50/80"><TableRow><TableHead className="px-5">Customer</TableHead><TableHead>Area</TableHead><TableHead>Phone</TableHead><TableHead>Outstanding</TableHead><TableHead>Overdue</TableHead><TableHead>Promise date</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader><TableBody>{defaulters.map((item) => <TableRow key={item.phone}><TableCell className="px-5 font-semibold">{item.customer}</TableCell><TableCell>{item.area}</TableCell><TableCell>{item.phone}</TableCell><TableCell className="font-bold text-rose-600">{item.amount}</TableCell><TableCell><Status tone={item.overdue > 40 ? "red" : "amber"}>{item.overdue} days</Status></TableCell><TableCell>{item.promise}</TableCell><TableCell><div className="flex gap-1"><Button variant="ghost" size="icon-sm" onClick={() => toast.success(`WhatsApp reminder sent to ${item.customer}`)}><MessageCircle /></Button><Button variant="ghost" size="icon-sm" onClick={() => toast.success("Cash collection recorded")}><Banknote /></Button></div></TableCell></TableRow>)}</TableBody></Table>
        <Pagination />
      </Card>
    </>
  );
}

function TicketDetail({ onBack }: { onBack: () => void }) {
  return (
    <>
      <button onClick={onBack} className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600"><ChevronLeft className="size-4" /> Back to tickets</button>
      <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div><div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-bold tracking-tight">TK-2841 • No internet</h1><Status tone="red">Critical</Status><Status tone="blue">Open</Status></div><p className="mt-2 text-sm text-slate-500">Sana Ahmed • Gulshan-e-Iqbal • Opened 18 minutes ago via WhatsApp</p></div>
        <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => toast.success("Technician Hamza notified")}><Wrench /> Assign technician</Button><Button onClick={() => toast.success("Ticket marked resolved")}><Check /> Resolve ticket</Button></div>
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.1fr_.9fr]">
        <Card className="flex min-h-[570px] flex-col overflow-hidden">
          <div className="flex items-center gap-3 border-b border-slate-100 p-4"><span className="avatar">SA</span><div><p className="font-semibold">Sana Ahmed</p><p className="text-xs text-emerald-600">WhatsApp connected</p></div><Phone className="ml-auto size-4 text-slate-400" /></div>
          <div className="chat-grid flex-1 space-y-4 bg-slate-50 p-5">
            <div className="max-w-[78%] rounded-2xl rounded-tl-sm bg-white p-3 text-sm shadow-sm"><p>Assalam o Alaikum, internet subah se band hai. Please check.</p><span className="mt-1 block text-right text-[10px] text-slate-400">10:42</span></div>
            <div className="ml-auto max-w-[78%] rounded-2xl rounded-tr-sm bg-emerald-100 p-3 text-sm"><p>Wa Alaikum Assalam. Aap ka masla check kiya ja raha hai.</p><span className="mt-1 flex items-center justify-end gap-1 text-[10px] text-emerald-700">10:43 <Check className="size-3" /></span></div>
            <div className="max-w-[78%] rounded-2xl rounded-tl-sm bg-white p-3 text-sm shadow-sm"><p>Router par red light blink ho rahi hai.</p><span className="mt-1 block text-right text-[10px] text-slate-400">10:46</span></div>
            <div className="mx-auto w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">System detected LOS at 10:39</div>
          </div>
          <div className="border-t border-slate-100 p-3">
            <div className="mb-2 flex gap-2 overflow-x-auto pb-1"><button className="quick-reply">Aap ka masla check ho raha hai</button><button className="quick-reply">Technician assign kar diya hai</button><button className="quick-reply">Please router restart karein</button></div>
            <div className="flex gap-2"><input className="control h-11 min-w-0 flex-1 rounded-xl border border-slate-200 px-3 text-sm" placeholder="Type a reply in Urdu or English..." /><Button size="icon" className="size-11 rounded-xl" onClick={() => toast.success("Message sent")}><Send /></Button></div>
          </div>
        </Card>
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 p-4"><div><h2 className="font-bold">Live device status</h2><p className="mt-1 text-xs text-slate-500">ONU-KHI-10482</p></div><Status tone="red">LOS</Status></div>
            <div className="grid grid-cols-2 gap-px bg-slate-100"><div className="surface bg-white p-4"><p className="text-xs text-slate-400">Optical signal</p><p className="mt-1 text-lg font-bold text-rose-600">No signal</p></div><div className="surface bg-white p-4"><p className="text-xs text-slate-400">Last online</p><p className="mt-1 text-lg font-bold">10:39</p></div><div className="surface bg-white p-4"><p className="text-xs text-slate-400">OLT port</p><p className="mt-1 font-bold">0/2/7:14</p></div><div className="surface bg-white p-4"><p className="text-xs text-slate-400">Nearby faults</p><p className="mt-1 font-bold text-amber-600">6 customers</p></div></div>
            <div className="p-4"><Button variant="outline" className="w-full" onClick={() => toast.success("Remote reboot queued")}><RefreshCw /> Reboot device</Button></div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between"><div><h2 className="font-bold">24-hour connection</h2><p className="text-xs text-slate-500">Availability 97.6%</p></div><Signal className="size-5 text-blue-600" /></div>
            <div className="mt-5 flex h-24 items-end gap-1">{[70,82,78,88,80,76,84,91,87,79,85,92,90,88,82,86,92,94,89,74,65,48,16,4].map((h, i) => <i key={i} className={`flex-1 rounded-t-sm ${i > 21 ? "bg-rose-400" : "bg-blue-500"}`} style={{ height: `${h}%` }} />)}</div>
            <div className="mt-2 flex justify-between text-[10px] text-slate-400"><span>11:00 yesterday</span><span>Now</span></div>
          </Card>
          <Card className="p-4"><div className="flex items-start gap-3"><AlertTriangle className="mt-0.5 size-5 text-amber-500" /><div><p className="font-semibold">Probable area outage</p><p className="mt-1 text-sm text-slate-500">6 customers on cabinet GUL-13D-C04 went offline within 3 minutes. K-Electric power event is not detected.</p><Button size="sm" className="mt-3" onClick={() => toast.success("Area outage ticket created")}>Create area ticket</Button></div></div></Card>
        </div>
      </div>
    </>
  );
}

function TicketsView({ selected, setSelected }: { selected: boolean; setSelected: (value: boolean) => void }) {
  if (selected) return <TicketDetail onBack={() => setSelected(false)} />;
  return (
    <>
      <PageHeading title="Support tickets" subtitle="Phone, WhatsApp and walk-in queries with live SLA tracking." actions={<Button className="rounded-xl" onClick={() => toast.success("New ticket form ready")}><Plus /> Create ticket</Button>} />
      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><MetricCard label="Open" value="37" note="8 new today" icon={Headphones} tone="blue" /><MetricCard label="In progress" value="21" note="12 with technicians" icon={Wrench} tone="amber" /><MetricCard label="Near SLA" value="6" note="Next breach in 14 min" icon={Clock3} tone="red" /><MetricCard label="Resolved today" value="48" note="Avg. 1h 42m" icon={Check} tone="teal" /></div>
      <Card className="overflow-hidden"><TableToolbar exportName="support-tickets" /><Table><TableHeader className="bg-slate-50/80"><TableRow><TableHead className="px-5">Ticket</TableHead><TableHead>Customer</TableHead><TableHead>Issue</TableHead><TableHead>Priority</TableHead><TableHead>Status</TableHead><TableHead>Assigned</TableHead><TableHead>SLA age</TableHead></TableRow></TableHeader><TableBody>{tickets.map((item) => <TableRow key={item.id} onClick={() => setSelected(true)} className="cursor-pointer"><TableCell className="px-5 font-semibold">{item.id}</TableCell><TableCell><p className="font-medium">{item.customer}</p><p className="text-xs text-slate-400">{item.area}</p></TableCell><TableCell>{item.issue}</TableCell><TableCell><Status tone={item.priority === "Critical" ? "red" : item.priority === "High" ? "amber" : item.priority === "Medium" ? "blue" : "slate"}>{item.priority}</Status></TableCell><TableCell>{item.status}</TableCell><TableCell>{item.tech}</TableCell><TableCell>{item.age}</TableCell></TableRow>)}</TableBody></Table><Pagination /></Card>
    </>
  );
}

function KarachiMap() {
  const pins = [
    { area: "North Nazimabad", x: "39%", y: "18%", tone: "green" },
    { area: "Gulshan", x: "58%", y: "35%", tone: "red" },
    { area: "Johar", x: "67%", y: "50%", tone: "amber" },
    { area: "Saddar", x: "43%", y: "62%", tone: "green" },
    { area: "Clifton", x: "27%", y: "76%", tone: "green" },
    { area: "DHA", x: "38%", y: "84%", tone: "green" },
    { area: "Korangi", x: "66%", y: "73%", tone: "red" },
    { area: "Malir", x: "82%", y: "49%", tone: "green" },
  ];
  return (
    <div className="network-map relative h-[490px] overflow-hidden rounded-2xl bg-[#e8f1f3]">
      <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:42px_42px]" />
      <div className="absolute -left-16 bottom-[-20%] h-[70%] w-[48%] rotate-[-18deg] rounded-[50%] border-[34px] border-cyan-300/60 bg-cyan-100" />
      <svg className="absolute inset-0 size-full opacity-60" viewBox="0 0 800 500" fill="none" aria-hidden="true"><path d="M108 28C210 115 172 191 319 238s83 158 301 218M312 0c-4 124 108 132 181 189 84 65 73 160 185 207M116 356c166-17 220-103 360-93 129 10 181 58 324 43M221 112c104 75 213 15 338 13 84-1 144 27 241 75" stroke="#fff" strokeWidth="10"/><path d="M108 28C210 115 172 191 319 238s83 158 301 218M312 0c-4 124 108 132 181 189 84 65 73 160 185 207M116 356c166-17 220-103 360-93 129 10 181 58 324 43M221 112c104 75 213 15 338 13 84-1 144 27 241 75" stroke="#a5b9bf" strokeWidth="2"/></svg>
      {pins.map((pin) => <button key={pin.area} className="map-pin group" style={{ left: pin.x, top: pin.y }} onClick={() => toast.info(`${pin.area}: node details opened`)}><span className={`map-pulse map-${pin.tone}`}><MapPin className="size-4" /></span><span className="map-label">{pin.area}</span></button>)}
      <div className="surface absolute bottom-4 left-4 rounded-xl bg-white/95 p-3 shadow-lg"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Map key</p><div className="mt-2 flex gap-3 text-xs"><span><i className="mr-1 inline-block size-2 rounded-full bg-emerald-500" />Healthy</span><span><i className="mr-1 inline-block size-2 rounded-full bg-amber-500" />Degraded</span><span><i className="mr-1 inline-block size-2 rounded-full bg-rose-500" />Critical</span></div></div>
    </div>
  );
}

function NetworkView() {
  return (
    <>
      <PageHeading title="Network operations" subtitle="Live POPs, OLTs, cabinets and outage intelligence across Karachi." actions={<><Button variant="outline" className="rounded-xl"><RefreshCw /> Refresh</Button><Button className="rounded-xl" onClick={() => toast.success("Network alert created")}><Plus /> Add alert</Button></>} />
      <div className="grid gap-4 xl:grid-cols-[1.5fr_.7fr]">
        <Card className="p-3"><KarachiMap /></Card>
        <div className="space-y-4">
          <Card className="p-5"><div className="flex items-center justify-between"><div><h2 className="font-bold">Network status</h2><p className="mt-1 text-xs text-slate-500">1,517 monitored devices</p></div><Status>94% healthy</Status></div><div className="mt-5 grid grid-cols-3 gap-2 text-center"><div className="stat-well"><p className="text-2xl font-bold text-emerald-600">1,482</p><p>Online</p></div><div className="stat-well"><p className="text-2xl font-bold text-amber-600">24</p><p>Degraded</p></div><div className="stat-well"><p className="text-2xl font-bold text-rose-600">11</p><p>Offline</p></div></div></Card>
          <Card className="overflow-hidden"><div className="border-b border-slate-100 p-4"><h2 className="font-bold">Active alerts</h2><p className="mt-1 text-xs text-slate-500">3 incidents need attention</p></div>{[["Critical","Fiber link down","Gulshan Block 13-D","47 customers","8 min"],["Critical","Power failure","Korangi Cabinet C-14","31 customers","14 min"],["Warning","High latency","DHA Core Router","128 customers","26 min"]].map((a) => <button key={a[1]} className="flex w-full gap-3 border-b border-slate-100 p-4 text-left last:border-0 hover:bg-slate-50" onClick={() => toast.success("Incident ticket created and nearest technician notified")}><span className={`mt-1 size-2 shrink-0 rounded-full ${a[0] === "Critical" ? "bg-rose-500" : "bg-amber-500"}`} /><div className="min-w-0 flex-1"><div className="flex justify-between gap-2"><p className="font-semibold">{a[1]}</p><span className="text-xs text-slate-400">{a[4]}</span></div><p className="mt-1 text-xs text-slate-500">{a[2]} • {a[3]}</p></div></button>)}</Card>
          <Card className="border-amber-200 bg-amber-50 p-4"><div className="flex gap-3"><Zap className="size-5 text-amber-600" /><div><p className="font-semibold text-amber-950">Load-shedding watch</p><p className="mt-1 text-sm text-amber-800">2 degraded nodes coincide with known power cuts. Backup power is active.</p></div></div></Card>
        </div>
      </div>
    </>
  );
}

function DevicesView() {
  return (
    <>
      <PageHeading title="Devices" subtitle="OLT, ONU, routers, switches and access points with live telemetry." actions={<Button className="rounded-xl"><Plus /> Add device</Button>} />
      <Card className="overflow-hidden"><TableToolbar exportName="network-devices" /><Table><TableHeader className="bg-slate-50/80"><TableRow><TableHead className="px-5">Device</TableHead><TableHead>Type</TableHead><TableHead>Location</TableHead><TableHead>Signal</TableHead><TableHead>Uptime</TableHead><TableHead>Usage</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{devices.map((item) => <TableRow key={item.name}><TableCell className="px-5"><div className="flex items-center gap-3"><span className="metric-icon metric-blue"><Router /></span><div><p className="font-semibold">{item.name}</p><p className="text-xs text-slate-400">SNMP • polled 20s ago</p></div></div></TableCell><TableCell>{item.kind}</TableCell><TableCell>{item.area}</TableCell><TableCell>{item.signal}</TableCell><TableCell>{item.uptime}</TableCell><TableCell>{item.load}</TableCell><TableCell><Status tone={item.state === "Online" ? "green" : item.state === "Degraded" ? "amber" : "red"}>{item.state}</Status></TableCell></TableRow>)}</TableBody></Table><Pagination /></Card>
    </>
  );
}

function ReportsView() {
  const reports = [
    ["Daily closing", "Cash, bank and wallet reconciliation", "Today, 28/09/2026", Banknote],
    ["Area-wise revenue", "Collections and dues by Karachi area", "September 2026", MapPin],
    ["Package revenue", "Revenue by speed profile and connection type", "September 2026", Package],
    ["Agent collection", "Cash and digital payments by collector", "September 2026", Users],
    ["Profit & loss", "Revenue, expenses and net profit", "FY 2026", FileBarChart],
    ["Tax summary", "Sales tax and withholding tax ledger", "Q3 2026", ReceiptText],
  ] as const;
  return (
    <>
      <PageHeading title="Reports" subtitle="Finance, collection and operations reporting for owners and accounts." actions={<Button variant="outline" className="rounded-xl"><Filter /> Date range</Button>} />
      <div className="mb-5 grid gap-3 sm:grid-cols-3"><MetricCard label="Gross revenue" value="Rs. 8.42M" note="+9.8% month-on-month" icon={ArrowUpRight} tone="teal" /><MetricCard label="Operating expenses" value="Rs. 5.76M" note="68.4% of revenue" icon={Fuel} tone="amber" /><MetricCard label="Net profit" value="Rs. 2.66M" note="31.6% margin" icon={CircleDollarSign} tone="blue" /></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{reports.map(([name, desc, period, Icon]) => <Card key={name} className="group p-5 transition hover:-translate-y-0.5 hover:shadow-lg"><div className="flex items-start justify-between"><span className="metric-icon metric-blue"><Icon /></span><MoreHorizontal className="size-5 text-slate-300" /></div><h2 className="mt-5 font-bold">{name}</h2><p className="mt-1 text-sm text-slate-500">{desc}</p><div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4"><span className="text-xs text-slate-400">{period}</span><div className="flex gap-1"><Button variant="ghost" size="icon-sm" onClick={() => toast.success(`${name} PDF prepared`)}><FileText /></Button><Button variant="ghost" size="icon-sm" onClick={() => toast.success(`${name} Excel export prepared`)}><Download /></Button></div></div></Card>)}</div>
    </>
  );
}

function StaffView() {
  const team = [["Hamza Iqbal","Field technician","Gulshan / Johar","6 active jobs","Online"],["Areej Fatima","Support agent","Head office","14 open tickets","Online"],["Zain Mahmood","Field technician","DHA / Clifton","4 active jobs","On route"],["Ali Raza","Recovery agent","Korangi / Malir","Rs. 48,200 today","Online"],["Nadia Aslam","Accounts officer","Head office","184 payments","Offline"]];
  return (
    <>
      <PageHeading title="Staff & field teams" subtitle="Assignments, availability and role-based activity." actions={<Button className="rounded-xl"><Plus /> Add staff</Button>} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{team.map((person) => <Card key={person[0]} className="p-5"><div className="flex items-start gap-3"><span className="avatar size-11">{person[0].split(" ").map(n => n[0]).join("")}</span><div className="flex-1"><div className="flex items-center justify-between gap-2"><h2 className="font-bold">{person[0]}</h2><Status tone={person[4] === "Offline" ? "slate" : person[4] === "On route" ? "amber" : "green"}>{person[4]}</Status></div><p className="mt-0.5 text-sm text-slate-500">{person[1]}</p></div></div><div className="mt-4 grid grid-cols-2 gap-2 text-sm"><div className="stat-well text-left"><p className="text-xs text-slate-400">Area</p><p className="mt-1 font-semibold">{person[2]}</p></div><div className="stat-well text-left"><p className="text-xs text-slate-400">Workload</p><p className="mt-1 font-semibold">{person[3]}</p></div></div><Button variant="outline" className="mt-4 w-full" onClick={() => toast.info(`${person[0]}'s assignments opened`)}>View assignments</Button></Card>)}</div>
    </>
  );
}

function SettingsView() {
  const integrations = [
    ["MikroTik / RouterOS", "Live", "8 routers connected", Router, "green"],
    ["RADIUS", "Live", "2,486 PPPoE users synced", ShieldCheck, "green"],
    ["SNMP monitoring", "Live", "1,517 devices monitored", Activity, "green"],
    ["Huawei OLT", "Live", "6 OLTs connected", Radio, "green"],
    ["ZTE / VSOL OLT", "Setup", "Credentials required", Cable, "amber"],
    ["Syslog", "Live", "12,840 events today", FileText, "green"],
  ] as const;
  return (
    <>
      <PageHeading title="Integrations & settings" subtitle="Connect network systems, configure tax and manage automation." />
      <Tabs defaultValue="integrations">
        <TabsList className="mb-4 w-full justify-start overflow-x-auto rounded-xl p-1"><TabsTrigger value="integrations">Integrations</TabsTrigger><TabsTrigger value="billing">Billing</TabsTrigger><TabsTrigger value="tax">Tax</TabsTrigger><TabsTrigger value="notifications">Notifications</TabsTrigger><TabsTrigger value="roles">Roles</TabsTrigger></TabsList>
        <TabsContent value="integrations"><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{integrations.map(([name, state, desc, Icon, tone]) => <Card key={name} className="p-5"><div className="flex items-start justify-between"><span className="metric-icon metric-blue"><Icon /></span><Status tone={tone as "green" | "amber"}>{state}</Status></div><h2 className="mt-5 font-bold">{name}</h2><p className="mt-1 text-sm text-slate-500">{desc}</p><Button variant="outline" className="mt-5 w-full" onClick={() => toast.success(`${name} connection test successful`)}>{state === "Setup" ? "Configure" : "Test connection"}</Button></Card>)}</div></TabsContent>
        <TabsContent value="billing"><Card className="p-6"><h2 className="font-bold">Billing automation</h2><p className="mt-2 text-sm text-slate-500">Invoices generate on the 1st of each month. Grace period is 5 days, with automatic suspension on day 10.</p><Button className="mt-4" onClick={() => toast.success("Billing settings saved")}>Save changes</Button></Card></TabsContent>
        <TabsContent value="tax"><Card className="p-6"><h2 className="font-bold">Sindh tax settings</h2><div className="mt-4 grid max-w-xl grid-cols-2 gap-3"><div><label className="field-label">Sales tax</label><input className="control h-11 w-full rounded-xl border border-slate-200 px-3" defaultValue="13%" /></div><div><label className="field-label">Withholding tax</label><input className="control h-11 w-full rounded-xl border border-slate-200 px-3" defaultValue="4.5%" /></div></div><p className="mt-3 text-xs text-slate-500">Rates are editable by administrators. Confirm current SRB requirements with your tax adviser.</p><Button className="mt-4" onClick={() => toast.success("Tax settings saved")}>Save tax settings</Button></Card></TabsContent>
        <TabsContent value="notifications"><Card className="p-6"><h2 className="font-bold">WhatsApp & SMS</h2><p className="mt-2 text-sm text-slate-500">Templates are enabled for invoices, receipts, payment reminders, outages and ticket updates.</p></Card></TabsContent>
        <TabsContent value="roles"><Card className="p-6"><h2 className="font-bold">Role access</h2><p className="mt-2 text-sm text-slate-500">Admin, Finance, Support, Technician and Recovery roles are configured.</p></Card></TabsContent>
      </Tabs>
    </>
  );
}

function TechnicianView() {
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeading title="Technician mobile view" subtitle="Today’s assigned field work, optimised for low-end Android phones." />
      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <div className="mx-auto w-full max-w-[360px] overflow-hidden rounded-[32px] border-[8px] border-slate-950 bg-slate-100 shadow-2xl">
          <div className="flex items-center justify-between bg-slate-950 px-4 py-3 text-xs text-white"><span>9:41</span><span>LTE • 78%</span></div>
          <div className="bg-gradient-to-br from-blue-700 to-cyan-600 p-5 text-white"><p className="text-xs text-blue-100">Assalam o Alaikum</p><h2 className="mt-1 text-xl font-bold">Hamza Iqbal</h2><div className="mt-4 flex items-center justify-between rounded-xl bg-white/10 p-3"><span className="text-sm">Today’s route</span><strong>6 jobs</strong></div></div>
          <div className="space-y-3 p-3">
            {[["Critical","No internet","Sana Ahmed","Gulshan 13-D","18 min"],["High","Signal low","Fahad Sheikh","Gulistan-e-Johar","42 min"],["Medium","Router setup","Aqsa Malik","Gulshan Block 7","1 hr"]].map((job, i) => <div key={job[2]} className="surface rounded-2xl bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><Status tone={job[0] === "Critical" ? "red" : job[0] === "High" ? "amber" : "blue"}>{job[0]}</Status><span className="text-xs text-slate-400">{job[4]}</span></div><h3 className="mt-3 font-bold">{job[1]}</h3><p className="mt-1 text-sm text-slate-500">{job[2]}</p><p className="mt-2 flex items-center gap-1 text-xs text-slate-500"><MapPin className="size-3" />{job[3]}</p><div className="mt-4 grid grid-cols-2 gap-2"><Button variant="outline" size="sm" onClick={() => toast.info("Calling customer")}><Phone /> Call</Button><Button size="sm" onClick={() => toast.success(i === 0 ? "Navigation opened" : "Job opened")}><LocateFixed /> {i === 0 ? "Navigate" : "Open"}</Button></div></div>)}
          </div>
        </div>
        <div className="space-y-4">
          <Card className="p-5"><h2 className="font-bold">Field workflow</h2><div className="mt-5 space-y-4">{[["1","Open assigned complaint","Customer, address and live device fault are available offline."],["2","Navigate and diagnose","Call customer, view map pin and record optical signal."],["3","Resolve with proof","Add notes, photo reference and customer signature."],["4","Close & sync","Updates sync automatically when connectivity returns."]].map(([n, title, desc]) => <div key={n} className="flex gap-3"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">{n}</span><div><p className="font-semibold">{title}</p><p className="mt-1 text-sm text-slate-500">{desc}</p></div></div>)}</div></Card>
          <Card className="border-teal-200 bg-teal-50 p-5"><div className="flex gap-3"><Wifi className="size-5 text-teal-700" /><div><p className="font-semibold text-teal-950">Low-connectivity ready</p><p className="mt-1 text-sm text-teal-800">Jobs and customer details remain available when mobile data drops. Actions queue until the phone reconnects.</p></div></div></Card>
        </div>
      </div>
    </div>
  );
}

function LoginView({ onLogin }: { onLogin: () => void }) {
  return (
    <main className="login-bg grid min-h-screen place-items-center p-5">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[28px] bg-white shadow-[0_30px_100px_rgba(2,6,23,.35)] lg:grid-cols-[1.05fr_.95fr]">
        <div className="hidden min-h-[640px] flex-col justify-between bg-slate-950 p-10 text-white lg:flex">
          <Logo />
          <div>
            <div className="mb-6 grid size-20 place-items-center rounded-3xl bg-teal-400/10 ring-1 ring-teal-400/20"><Network className="size-10 text-teal-300" /></div>
            <h1 className="max-w-md text-4xl font-bold leading-[1.08] tracking-[-.04em]">Your ISP operation, connected end to end.</h1>
            <p className="mt-4 max-w-md text-base leading-7 text-slate-400">Billing, customers, support and live network health in one secure workspace built for Karachi teams.</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500"><ShieldCheck className="size-4" /> Secure, role-based access</div>
        </div>
        <div className="flex min-h-[600px] flex-col justify-center p-7 sm:p-12">
          <div className="mb-8 lg:hidden"><Logo /></div>
          <p className="text-sm font-bold uppercase tracking-[.12em] text-blue-600">Welcome back</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Sign in to NexLink Ops</h2>
          <p className="mt-2 text-sm text-slate-500">Use your staff account to continue.</p>
          <form className="mt-8 space-y-4" onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
            <div><label className="field-label">Email or username</label><input className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" defaultValue="ahsan.admin" /></div>
            <div><div className="flex justify-between"><label className="field-label">Password</label><button type="button" className="text-xs font-semibold text-blue-600">Forgot password?</button></div><input type="password" className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" defaultValue="demo-password" /></div>
            <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" defaultChecked className="size-4 accent-blue-600" /> Keep me signed in</label>
            <Button type="submit" className="h-12 w-full rounded-xl bg-blue-600 text-base">Sign in securely <ChevronRight /></Button>
          </form>
          <div className="mt-7 rounded-xl bg-slate-50 p-4 text-center text-xs text-slate-500">Demo account • Select “Sign in securely” to enter the dashboard.</div>
        </div>
      </div>
    </main>
  );
}

function PaymentDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (value: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="surface max-h-[92vh] overflow-y-auto rounded-2xl p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-slate-100 p-6"><DialogTitle className="flex items-center gap-2 text-xl"><span className="metric-icon metric-teal"><Banknote /></span>Add payment</DialogTitle><DialogDescription>Record collection and generate a receipt instantly.</DialogDescription></DialogHeader>
        <div className="space-y-4 px-6">
          <div><label className="field-label">Customer</label><div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input className="control h-11 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-sm" defaultValue="Sana Ahmed — 0301-8423176" /></div></div>
          <div className="grid gap-4 sm:grid-cols-2"><div><label className="field-label">Amount (PKR)</label><input className="control h-11 w-full rounded-xl border border-slate-200 px-3 font-bold" defaultValue="5,200" /></div><div><label className="field-label">Payment date</label><input type="text" className="control h-11 w-full rounded-xl border border-slate-200 px-3" defaultValue="28/09/2026" /></div></div>
          <div><label className="field-label">Payment method</label><Select defaultValue="cash"><SelectTrigger className="control h-11 w-full rounded-xl"><SelectValue /></SelectTrigger><SelectContent>{["Cash", "Bank Transfer", "JazzCash", "Easypaisa", "Raast", "Cheque"].map((item) => <SelectItem key={item} value={item.toLowerCase().replace(" ", "-")}>{item}</SelectItem>)}</SelectContent></Select></div>
          <div className="rounded-xl bg-slate-50 p-4"><div className="flex justify-between text-sm"><span className="text-slate-500">Open invoice</span><span>INV-2609-1842</span></div><div className="mt-2 flex justify-between text-sm"><span className="text-slate-500">Due amount</span><span className="font-bold">Rs. 5,200</span></div><div className="mt-3 flex justify-between border-t border-slate-200 pt-3"><span className="font-semibold">Remaining balance</span><span className="font-bold text-emerald-600">Rs. 0</span></div></div>
        </div>
        <DialogFooter className="border-t border-slate-100 p-6">
          <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
          <Button variant="outline" onClick={() => toast.success("Receipt preview opened")}><Printer /> Save & print</Button>
          <Button onClick={() => { toast.success("Payment saved and receipt sent on WhatsApp"); onOpenChange(false); }}><MessageCircle /> Save & WhatsApp</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Home() {
  const [active, setActive] = useState<Screen>("dashboard");
  const [lang, setLang] = useState<Lang>("en");
  const [dark, setDark] = useState(false);
  const [loggedIn, setLoggedIn] = useState(true);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [customerSelected, setCustomerSelected] = useState(false);
  const [ticketSelected, setTicketSelected] = useState(false);
  const [globalQuery, setGlobalQuery] = useState("");

  useEffect(() => {
    type ToolDefinition = {
      name: string;
      title: string;
      description: string;
      inputSchema: Record<string, unknown>;
      annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
      execute: (input: unknown) => unknown;
    };
    const context = (document as Document & {
      modelContext?: {
        registerTool: (tool: ToolDefinition, options?: { signal?: AbortSignal }) => void | Promise<void>;
      };
    }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const register = (tool: ToolDefinition) => {
      try {
        void Promise.resolve(context.registerTool(tool, { signal: lifecycle.signal })).catch(() => undefined);
      } catch {
        // Browsers may expose an experimental implementation with partial support.
      }
    };

    register({
      name: "search_customers",
      title: "Search customers",
      description: "Open the customer workspace and search by name, phone, CNIC, username or IP.",
      inputSchema: {
        type: "object",
        properties: { query: { type: "string", minLength: 1 } },
        required: ["query"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute(input) {
        const value = (input as { query?: unknown })?.query;
        if (typeof value !== "string" || !value.trim()) throw new Error("query must be a non-empty string");
        setGlobalQuery(value.trim());
        setActive("customers");
        setCustomerSelected(false);
        return { screen: "customers", query: value.trim() };
      },
    });

    register({
      name: "navigate_ops_module",
      title: "Open operations module",
      description: "Navigate the visible NexLink Ops workspace to a requested module.",
      inputSchema: {
        type: "object",
        properties: { module: { type: "string", enum: [...navigation.map((item) => item.id), "technician"] } },
        required: ["module"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute(input) {
        const module = (input as { module?: string })?.module as Screen;
        const allowed = [...navigation.map((item) => item.id), "technician"];
        if (!allowed.includes(module)) throw new Error("Unknown module");
        setActive(module);
        setCustomerSelected(false);
        setTicketSelected(false);
        return { screen: module };
      },
    });

    register({
      name: "start_payment_entry",
      title: "Start payment entry",
      description: "Open the visible add-payment form without saving a transaction.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute() {
        setPaymentOpen(true);
        return { form: "payment", status: "opened" };
      },
    });

    return () => lifecycle.abort();
  }, []);

  const navigate = (screen: Screen) => {
    setActive(screen);
    setCustomerSelected(false);
    setTicketSelected(false);
  };

  if (!loggedIn) return <LoginView onLogin={() => setLoggedIn(true)} />;

  const current = navigation.find((item) => item.id === active);
  const renderScreen = () => {
    switch (active) {
      case "dashboard": return <Dashboard lang={lang} go={navigate} />;
      case "customers": return <CustomersView selected={customerSelected} setSelected={setCustomerSelected} initialQuery={globalQuery} />;
      case "billing": return <BillingView openPayment={() => setPaymentOpen(true)} />;
      case "payments": return <PaymentsView openPayment={() => setPaymentOpen(true)} />;
      case "recovery": return <RecoveryView />;
      case "tickets": return <TicketsView selected={ticketSelected} setSelected={setTicketSelected} />;
      case "network": return <NetworkView />;
      case "devices": return <DevicesView />;
      case "reports": return <ReportsView />;
      case "staff": return <StaffView />;
      case "settings": return <SettingsView />;
      case "technician": return <TechnicianView />;
    }
  };

  return (
    <div className={dark ? "theme-dark" : ""} dir={lang === "ur" ? "rtl" : "ltr"}>
      <SidebarProvider style={{ "--sidebar-width": "15.5rem" } as React.CSSProperties}>
        <Sidebar side={lang === "ur" ? "right" : "left"} collapsible="icon" className="border-r-0 bg-slate-950 text-slate-200">
          <SidebarHeader className="px-4 pb-4 pt-5"><Logo /></SidebarHeader>
          <SidebarContent>
            <SidebarGroup className="px-3">
              <SidebarGroupLabel className="px-3 text-[10px] font-bold uppercase tracking-[.13em] text-slate-600">{t(lang, "Workspace", "ورک اسپیس")}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1">
                  {navigation.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton tooltip={lang === "ur" ? item.ur : item.label} isActive={active === item.id} onClick={() => navigate(item.id)} className="h-10 rounded-xl px-3 text-[14px] text-slate-400 hover:bg-white/5 hover:text-white data-[active=true]:bg-teal-400/10 data-[active=true]:font-semibold data-[active=true]:text-teal-300">
                        <item.icon className="size-[18px]" /><span>{lang === "ur" ? item.ur : item.label}</span>{item.badge && <span className={`ml-auto rounded-full px-2 py-0.5 text-[11px] font-bold text-white ${item.id === "tickets" ? "bg-rose-500" : "bg-amber-500"}`}>{item.badge}</span>}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup className="mt-1 px-3">
              <SidebarGroupLabel className="px-3 text-[10px] font-bold uppercase tracking-[.13em] text-slate-600">{t(lang, "Field tools", "فیلڈ ٹولز")}</SidebarGroupLabel>
              <SidebarGroupContent><SidebarMenu><SidebarMenuItem><SidebarMenuButton tooltip="Technician mobile" isActive={active === "technician"} onClick={() => navigate("technician")} className="h-10 rounded-xl px-3 text-[14px] text-slate-400 hover:bg-white/5 hover:text-white data-[active=true]:bg-teal-400/10 data-[active=true]:text-teal-300"><Smartphone /><span>{t(lang, "Technician mobile", "ٹیکنیشن موبائل")}</span></SidebarMenuButton></SidebarMenuItem></SidebarMenu></SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="m-3 rounded-2xl border border-white/10 bg-white/[.04] p-3">
            <button onClick={() => setLoggedIn(false)} className="flex w-full items-center gap-3 text-left">
              <div className="grid size-9 shrink-0 place-items-center rounded-full bg-blue-500 text-sm font-bold text-white">AK</div>
              <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden"><p className="truncate text-sm font-semibold text-white">Ahsan Khan</p><p className="text-xs text-slate-500">Administrator • Sign out</p></div>
              <Settings className="size-4 text-slate-500 group-data-[collapsible=icon]:hidden" />
            </button>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="min-w-0 bg-[#f4f7fb]">
          <header className="surface sticky top-0 z-30 flex h-[72px] items-center gap-2 border-b border-slate-200/80 bg-white/90 px-3 backdrop-blur-xl md:px-6">
            <SidebarTrigger className="mr-1 text-slate-500" />
            <div className="relative hidden w-full max-w-xl md:block">
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input value={globalQuery} onChange={(e) => setGlobalQuery(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && globalQuery.trim()) { navigate("customers"); toast.info(`Searching all customer records for “${globalQuery}”`); } }} className="control h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" placeholder={t(lang, "Search name, phone, CNIC, username or IP...", "نام، فون، شناختی کارڈ یا آئی پی تلاش کریں...")} />
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <Button variant="ghost" size="icon" className="rounded-xl text-slate-500" onClick={() => setDark(!dark)} aria-label="Toggle dark mode">{dark ? <Sun /> : <Moon />}</Button>
              <Button variant="ghost" className="h-10 rounded-xl px-2.5 text-slate-500" onClick={() => setLang(lang === "en" ? "ur" : "en")}><Languages /><span className="hidden sm:inline">{lang === "en" ? "اردو" : "English"}</span></Button>
              <Button variant="ghost" size="icon" className="relative rounded-xl text-slate-500" onClick={() => toast.info("3 network alerts and 6 SLA warnings")}><Bell /><span className="absolute right-2 top-2 size-2 rounded-full bg-rose-500 ring-2 ring-white" /></Button>
              <Button className="h-10 rounded-xl bg-blue-600 px-3.5 shadow-sm hover:bg-blue-700" onClick={() => setPaymentOpen(true)}><Plus /><span className="hidden sm:inline">{t(lang, "Add payment", "ادائیگی شامل کریں")}</span></Button>
            </div>
          </header>
          <main className="mx-auto w-full max-w-[1600px] p-4 md:p-7" aria-label={current?.label ?? active}>{renderScreen()}</main>
        </SidebarInset>
      </SidebarProvider>
      <PaymentDialog open={paymentOpen} onOpenChange={setPaymentOpen} />
      <Toaster position="top-right" richColors />
    </div>
  );
}
