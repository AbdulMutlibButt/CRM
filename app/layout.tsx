import type { Metadata } from "next";
import "./globals.css";
import "./crm.css";

export const metadata: Metadata = {
  title: "Speed vision — ISP CRM & ERP",
  description: "Speed vision FTTH Broadband — billing, customers, support and network operations in one workspace.",
  icons: { icon: "/speed-vision-logo.jpg", shortcut: "/speed-vision-logo.jpg", apple: "/speed-vision-logo.jpg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className="antialiased">{children}</body></html>;
}
