// Shared business rules: storage and authentication adapters call these functions.
// Money is stored in integer paisa to avoid floating-point balance errors.
export type Customer = {
  id: string; name: string; phone: string; area: string; username: string;
  monthlyFee: number; status: "Active" | "Suspended" | "Trial" | "Disconnected";
};
export type Invoice = {
  id: string; customerId: string; period: string; amount: number; dueDate: string;
};
export type Payment = {
  id: string; invoiceId: string; amount: number; date: string;
  method: "Cash" | "Bank Transfer" | "JazzCash" | "Easypaisa" | "Raast" | "Cheque";
  reference: string;
};
export type Ticket = {
  id: string; customerId: string; subject: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  status: "Open" | "In progress" | "Resolved";
  assignedTo: string | null; createdAt: string; resolvedAt: string | null;
  messages: { id: string; author: string; text: string; createdAt: string }[];
};

export function toPaisa(input: string): number {
  const value = input.trim();
  if (!/^\d+(\.\d{1,2})?$/.test(value)) throw new Error("Enter a positive amount with up to two decimal places.");
  const [whole, fraction = ""] = value.split(".");
  const amount = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(amount) || amount <= 0) throw new Error("Amount must be greater than zero and within the supported range.");
  return amount;
}

export function outstanding(invoice: Invoice, payments: Payment[]): number {
  return invoice.amount - payments.filter(p => p.invoiceId === invoice.id).reduce((sum, p) => sum + p.amount, 0);
}

export function recordPayment(invoice: Invoice, payments: Payment[], payment: Payment): Payment[] {
  if (payments.some(p => p.id === payment.id)) throw new Error("This payment has already been recorded.");
  if (payment.invoiceId !== invoice.id) throw new Error("Payment does not match the selected invoice.");
  if (!Number.isSafeInteger(payment.amount) || payment.amount <= 0) throw new Error("Enter a valid payment amount.");
  if (payment.amount > outstanding(invoice, payments)) throw new Error("Payment exceeds the outstanding invoice balance.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(payment.date) || Number.isNaN(Date.parse(payment.date)) || new Date(payment.date).toISOString().slice(0, 10) !== payment.date) throw new Error("Enter a valid payment date.");
  if (!["Cash", "Bank Transfer", "JazzCash", "Easypaisa", "Raast", "Cheque"].includes(payment.method)) throw new Error("Select a valid payment method.");
  return [...payments, payment];
}

export function previewBilling(customers: Customer[], invoices: Invoice[], period: string, dueDate: string): Invoice[] {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(period)) throw new Error("Choose a valid billing month.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate) || Number.isNaN(Date.parse(dueDate)) || new Date(dueDate).toISOString().slice(0, 10) !== dueDate || dueDate.slice(0, 7) < period) throw new Error("Choose a valid due date in or after the billing month.");
  return customers.filter(c => c.status === "Active" && !invoices.some(i => i.customerId === c.id && i.period === period)).map(c => {
    if (!Number.isSafeInteger(c.monthlyFee) || c.monthlyFee <= 0) throw new Error(`Set a valid monthly fee for ${c.name}.`);
    return { id: `INV-${period}-${c.id}`, customerId: c.id, period, amount: c.monthlyFee, dueDate };
  });
}

export function invoiceStatus(invoice: Invoice, payments: Payment[], today: string): "Paid" | "Overdue" | "Partial" | "Unpaid" {
  const balance = outstanding(invoice, payments);
  if (balance <= 0) return "Paid";
  if (invoice.dueDate < today) return "Overdue";
  return balance < invoice.amount ? "Partial" : "Unpaid";
}

export function resolveTicket(ticket: Ticket, timestamp: string): Ticket {
  if (ticket.status === "Resolved") return ticket;
  return { ...ticket, status: "Resolved", resolvedAt: timestamp };
}

export function exportCsv(rows: Record<string, string | number>[]): string {
  if (!rows.length) return "";
  const columns = [...new Set(rows.flatMap(row => Object.keys(row)))];
  const quote = (value: string | number) => {
    let text = String(value);
    if (typeof value === "string" && /^[\s]*[=+@\-]/.test(text)) text = `'${text}`;
    return `"${text.replaceAll('"', '""')}"`;
  };
  return "\uFEFF" + [columns.map(quote).join(","), ...rows.map(row => columns.map(key => quote(row[key] ?? "")).join(","))].join("\r\n");
}
