import type { ReactNode } from "react";
import type { Metadata } from "next";
import "./globals.css";
import { AppSidebar } from "@/components/app-sidebar";

export const metadata: Metadata = {
  title: "Explainara | Adaptive AI Learning",
  description: "An adaptive AI classroom that learns how you learn."
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <AppSidebar />
          <main className="main">{children}</main>
        </div>
      </body>
    </html>
  );
}
