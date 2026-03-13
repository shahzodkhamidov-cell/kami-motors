"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Car, LayoutDashboard, FileText, Plus, LogOut, Menu, X } from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/inventory", label: "Inventory", icon: Car },
  { href: "/admin/inventory/new", label: "Add Car", icon: Plus },
  { href: "/admin/applications", label: "Applications", icon: FileText },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (pathname === "/admin/login") return null;

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] p-2"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-[var(--bg-card)] border-r border-[var(--border)] flex flex-col z-40 transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[var(--gold)] flex items-center justify-center">
              <Car className="w-4 h-4 text-[#080807]" />
            </div>
            <div>
              <p
                className="text-[var(--text-primary)] text-lg leading-none tracking-widest"
                style={{ fontFamily: "var(--font-bebas), sans-serif" }}
              >
                KAMI<span className="text-[var(--gold)]">MOTORS</span>
              </p>
              <p className="text-[var(--text-dim)] text-[10px] tracking-[0.15em] uppercase">Admin Panel</p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="lg:hidden text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/admin/inventory/new"
                ? pathname === href
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors border ${
                  active
                    ? "bg-(--gold)/10 text-[var(--gold)] border-(--gold)/20"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-2)] border-transparent"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[var(--border)]">
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors w-full border border-transparent"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sign Out
          </button>
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-[var(--text-dim)] hover:text-[var(--text-muted)] transition-colors mt-0.5"
          >
            ← View Website
          </Link>
        </div>
      </aside>

      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-30"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
