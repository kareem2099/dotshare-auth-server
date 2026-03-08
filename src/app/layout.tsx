import type { Metadata } from "next";
import "./globals.css";
import ThemeToggle from "./components/ThemeToggle";

export const metadata: Metadata = {
  title: "DotShare — Connect",
  description: "Authenticate your social platforms with DotShare",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <ThemeToggle />
        {children}
      </body>
    </html>
  );
}