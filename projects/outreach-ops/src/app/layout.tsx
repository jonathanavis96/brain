import type { Metadata } from "next";
import { Providers } from "./providers";
import { SidebarLayout } from "./components/Sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Outreach Ops",
  description: "Client acquisition outreach management system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <Providers>
          <SidebarLayout>{children}</SidebarLayout>
        </Providers>
      </body>
    </html>
  );
}
