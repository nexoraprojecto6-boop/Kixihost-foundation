import type React from "react";
import "./globals.css";

export const metadata = {
  title: "KixiHost",
  description: "Cloud hosting e deployment para Angola, directamente do GitHub.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-AO">
      <body>{children}</body>
    </html>
  );
}
