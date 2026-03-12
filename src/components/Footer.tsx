import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0A0A09] border-t border-[#2A2A26]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="md:col-span-2">
            <div className="mb-4">
              <span
                className="font-display text-4xl leading-none tracking-widest text-[#F8EAD9]"
                style={{ fontFamily: "var(--font-bebas), sans-serif" }}
              >
                KAMI<span className="text-[#C9A84C]">MOTORS</span>
              </span>
              <p className="text-[10px] text-[#6B6B6B] tracking-[0.18em] uppercase mt-0.5">
                Powered by Fox Cars LLC
              </p>
            </div>
            <p className="text-[#B0B0B8] text-sm leading-relaxed max-w-xs">
              Your trusted source for quality rebuilt title vehicles in the
              New Orleans metro area. Save thousands without sacrificing quality.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 border border-[#C9A84C]/30 rounded px-3 py-2">
              <div className="w-2 h-2 bg-[#C9A84C] rounded-full animate-pulse" />
              <span className="text-[#C9A84C] text-xs tracking-widest uppercase">Rebuilt Title Specialists</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              className="text-[#C9A84C] text-sm tracking-[0.2em] uppercase mb-5"
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
                    className="text-[#B0B0B8] hover:text-[#C9A84C] text-sm transition-colors tracking-wide"
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
              className="text-[#C9A84C] text-sm tracking-[0.2em] uppercase mb-5"
              style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.15em" }}
            >
              Contact
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-2.5 text-[#B0B0B8] text-sm">
                <MapPin className="w-4 h-4 text-[#C9A84C] mt-0.5 shrink-0" />
                Metairie, LA 70001
              </li>
              <li className="flex items-center gap-2.5 text-sm">
                <Phone className="w-4 h-4 text-[#C9A84C] shrink-0" />
                <a href="tel:+13058158880" className="text-[#B0B0B8] hover:text-[#C9A84C] transition-colors">
                  (305) 815-8880
                </a>
              </li>
              <li className="flex items-center gap-2.5 text-sm">
                <Mail className="w-4 h-4 text-[#C9A84C] shrink-0" />
                <a href="mailto:info@kamimotors.com" className="text-[#B0B0B8] hover:text-[#C9A84C] transition-colors">
                  info@kamimotors.com
                </a>
              </li>
            </ul>
            <div className="mt-5 space-y-1">
              <p className="text-[#6B6B6B] text-xs tracking-wide">Mon – Sat: 9am – 7pm</p>
              <p className="text-[#6B6B6B] text-xs tracking-wide">Sunday: By Appointment</p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[#2A2A26] flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-[#6B6B6B] text-xs tracking-wide">
            © {new Date().getFullYear()} Kami Motors · Fox Cars LLC. All rights reserved.
          </p>
          <p className="text-[#6B6B6B] text-xs">
            Rebuilt title vehicles — inspected, repaired, road-ready.
          </p>
        </div>
      </div>
    </footer>
  );
}
