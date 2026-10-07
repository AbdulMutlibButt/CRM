import { test } from "node:test";
import assert from "node:assert/strict";
import { toPaisa, recordPayment, outstanding, previewBilling, invoiceStatus, exportCsv } from "./crm.ts";
import type { Customer, Invoice, Payment } from "./crm.ts";

const invoice: Invoice = { id: "I1", customerId: "C1", period: "2026-10", amount: 520000, dueDate: "2026-10-10" };
const payment: Payment = { id: "P1", invoiceId: "I1", amount: 200000, date: "2026-10-07", method: "Cash", reference: "" };

test("money parsing preserves paisa and rejects invalid inputs", () => {
  assert.equal(toPaisa("5200.25"), 520025);
  for (const input of ["0", "-1", "1.234", "NaN", "1e3", ""]) assert.throws(() => toPaisa(input));
});
test("partial and full payments update balances and invoice status", () => {
  const partial = recordPayment(invoice, [], payment);
  assert.equal(outstanding(invoice, partial), 320000);
  assert.equal(invoiceStatus(invoice, partial, "2026-10-07"), "Partial");
  assert.equal(invoiceStatus(invoice, partial, "2026-10-11"), "Overdue");
  const paid = recordPayment(invoice, partial, { ...payment, id: "P2", amount: 320000 });
  assert.equal(invoiceStatus(invoice, paid, "2026-10-11"), "Paid");
});
test("duplicate payments, overpayments, invalid dates and wrong invoice are rejected", () => {
  assert.throws(() => recordPayment(invoice, [payment], payment));
  assert.throws(() => recordPayment(invoice, [], { ...payment, amount: 520001 }));
  assert.throws(() => recordPayment(invoice, [], { ...payment, date: "2026-02-30" }));
  assert.throws(() => recordPayment(invoice, [], { ...payment, invoiceId: "other" }));
});
test("billing only includes active customers and does not bill the same month twice", () => {
  const customer: Customer = { id: "C1", name: "Test", phone: "03001234567", area: "Karachi", username: "test", monthlyFee: 520000, status: "Active" };
  assert.equal(previewBilling([customer], [invoice], "2026-10", "2026-10-10").length, 0);
  assert.equal(previewBilling([customer, { ...customer, id: "C2", status: "Suspended" }], [], "2026-10", "2026-10-10").length, 1);
  assert.throws(() => previewBilling([customer], [], "2026-13", "2026-10-10"));
});
test("CSV escapes punctuation and prevents spreadsheet formulas", () => {
  const csv = exportCsv([{ name: 'a,"b', note: '=SUM(1,2)' }]);
  assert.ok(csv.includes('"a,""b"'));
  assert.ok(csv.includes("'=SUM(1,2)"));
});
