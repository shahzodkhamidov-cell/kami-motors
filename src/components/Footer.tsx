import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[var(--bg-card-2)] border-t border-[var(--border)]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="md:col-span-2">
            <div className="mb-4">
              <span
                className="font-display text-4xl leading-none tracking-widest text-[var(--text-primary)]"
                style={{ fontFamily: "var(--font-bebas), sans-serif" }}
              >
                KAMI<span className="text-[var(--gold)]">MOTORS</span>
              </span>
              <p className="text-[10px] text-[var(--text-dim)] tracking-[0.18em] uppercase mt-0.5">
                Powered by Fox Cars LLC
              </p>
            </div>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed max-w-xs">
              Your trusted source for quality rebuilt title vehicles in the
              New Orleans metro area. Save thousands without sacrificing quality.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 border border-[var(--border-gold)] rounded px-3 py-2">
              <div className="w-2 h-2 bg-[var(--gold)] rounded-full animate-pulse" />
              <span className="text-[var(--gold)] text-xs tracking-widest uppercase">Rebuilt Title Specialists</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              className="text-[var(--gold)] text-sm tracking-[0.2em] uppercase mb-5"
              style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.15em" }}
            >
              Quick Links
            </h4>
            <ul className="space-y-3">
              {[
                { href: "/", label: "Home" },
                { href: "/inventory", label: "Inventory" },
                { href: "/about", label: "About Us" },
                { href: "/contact", label: "Contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[var(--text-muted)] hover:text-[var(--gold)] text-sm transition-colors tracking-wide"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4
              className="text-[var(--gold)] text-sm tracking-[0.2em] uppercase mb-5"
              style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.15em" }}
            >
              Contact
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-2.5 text-[var(--text-muted)] text-sm">
                <MapPin className="w-4 h-4 text-[var(--gold)] mt-0.5 shrink-0" />
                Metairie, LA 70001
              </li>
              <li className="flex items-center gap-2.5 text-sm">
                <Phone className="w-4 h-4 text-[var(--gold)] shrink-0" />
                <a href="tel:+13058158880" className="text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors">
                  (305) 815-8880
                </a>
              </li>
              <li className="flex items-center gap-2.5 text-sm">
                <Mail className="w-4 h-4 text-[var(--gold)] shrink-0" />
                <a href="mailto:info@kamimotors.com" className="text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors">
                  info@kamimotors.com
                </a>
              </li>
            </ul>
            <div className="mt-5 space-y-1">
              <p className="text-[var(--text-dim)] text-xs tracking-wide">Mon – Sat: 9am – 7pm</p>
              <p className="text-[var(--text-dim)] text-xs tracking-wide">Sunday: By Appointment</p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-[var(--text-dim)] text-xs tracking-wide">
            © {new Date().getFullYear()} Kami Motors · Fox Cars LLC. All rights reserved.
          </p>
          <p className="text-[var(--text-dim)] text-xs">
            Rebuilt title vehicles — inspected, repaired, road-ready.
          </p>
        </div>
      </div>
    </footer>
  );
}
