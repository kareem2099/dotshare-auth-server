import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DotShare — Connect",
  description: "Authenticate your social platforms with DotShare",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}