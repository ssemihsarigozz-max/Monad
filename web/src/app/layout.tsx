import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "CommonGround", description: "Conditional collective demand for campus services" };
export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
