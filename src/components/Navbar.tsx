"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Phone } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (pathname.startsWith("/admin")) return null;

  const links = [
    { href: "/", label: "Home" },
    { href: "/inventory", label: "Inventory" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${
        scrolled
          ? "bg-(--bg-primary)/97 backdrop-blur-md border-b border-(--border) shadow-2xl shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-18 py-4">

          {/* Logo */}
          <Link href="/" className="flex flex-col group">
            <span
              className="font-display text-3xl leading-none tracking-widest text-[var(--text-primary)] group-hover:text-[var(--gold)] transition-colors"
              style={{ fontFamily: "var(--font-bebas), sans-serif" }}
            >
              KAMI<span className="text-[var(--gold)]">MOTORS</span>
            </span>
            <span className="text-[10px] text-[var(--text-dim)] tracking-[0.18em] uppercase leading-none mt-0.5 group-hover:text-[var(--text-muted)] transition-colors">
              Powered by Fox Cars LLC
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 text-sm tracking-wide transition-colors font-medium ${
                  pathname === link.href
                    ? "text-[var(--gold)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="tel:+13058158880"
              className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors text-sm"
            >
              <Phone className="w-3.5 h-3.5" />
              (305) 815-8880
            </a>
            <ThemeToggle />
            <Link
              href="/inventory"
              className="bg-[var(--gold)] hover:bg-[var(--gold-light)] text-[#080807] font-bold px-5 py-2.5 text-sm tracking-wide transition-colors"
              style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
            >
              BROWSE INVENTORY
            </Link>
          </div>

          {/* Mobile toggle */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors p-1"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-[var(--bg-card-2)] border-t border-[var(--border)] px-6 py-4 space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-3 text-sm font-medium tracking-wide border-b border-[var(--border)] transition-colors ${
                pathname === link.href
                  ? "text-[var(--gold)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 flex flex-col gap-3">
            <a
              href="tel:+13058158880"
              className="flex items-center gap-2 text-[var(--text-muted)] text-sm"
            >
              <Phone className="w-4 h-4 text-[var(--gold)]" />
              (305) 815-8880
            </a>
            <Link
              href="/inventory"
              onClick={() => setIsOpen(false)}
              className="bg-[var(--gold)] text-[#080807] font-bold px-4 py-3 text-sm tracking-wide text-center"
            >
              BROWSE INVENTORY
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
