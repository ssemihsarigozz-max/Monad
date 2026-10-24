"use client";
import { useState } from "react";

const links = ["Home", "Demands", "My Contributions", "Social Impact"];
export function Nav({ view, onChange }: { view: string; onChange: (view: string) => void }) {
  const [open, setOpen] = useState(false);
  return <header className="nav"><button className="brand" onClick={() => onChange("Home")} aria-label="CommonGround home"><span className="cube">◇</span> CommonGround</button><nav className={open ? "links open" : "links"}>{links.map((link) => <button key={link} className={view === link ? "selected" : ""} onClick={() => { onChange(link); setOpen(false); }}>{link}</button>)}</nav><button className="wallet" disabled>Connect Wallet <span>Awaiting integration</span></button><button className="menu" onClick={() => setOpen(!open)} aria-label="Open navigation">☰</button></header>;
}
