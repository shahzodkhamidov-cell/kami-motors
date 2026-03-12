"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, Clock, Send, CheckCircle } from "lucide-react";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  const inputClass =
    "w-full bg-[#0D0D0B] border border-[#2A2A26] text-[#F8EAD9] px-3 py-2.5 text-sm focus:border-[#C9A84C] transition-colors placeholder-[#6B6B6B]";
  const labelClass = "block text-[#6B6B6B] text-[10px] tracking-widest uppercase font-medium mb-1.5";

  return (
    <div className="pt-20 min-h-screen bg-[#080807]">
      {/* Header */}
      <section className="py-20 border-b border-[#2A2A26]">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-px bg-[#C9A84C]" />
            <span className="text-[#C9A84C] text-xs tracking-[0.3em] uppercase">We&apos;d Love to Hear from You</span>
          </div>
          <h1
            className="text-[#F8EAD9] leading-none mb-4"
            style={{ fontFamily: "var(--font-bebas), sans-serif", fontSize: "clamp(3.5rem, 9vw, 7rem)", letterSpacing: "0.03em" }}
          >
            GET IN{" "}
            <span style={{ background: "linear-gradient(135deg, #C9A84C, #E2CB7E)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              TOUCH
            </span>
          </h1>
          <p className="text-[#B0B0B8] text-lg max-w-xl">
            Have a question? Ready to see a car? Reach out and we&apos;ll get back to you promptly.
          </p>
        </div>
      </section>

      {/* Contact grid */}
      <section className="py-16">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Info sidebar */}
            <div className="lg:col-span-2 space-y-px bg-[#2A2A26]">
              {[
                { icon: Phone, label: "Phone", value: "(305) 815-8880", href: "tel:+13058158880" },
                { icon: Mail, label: "Email", value: "info@kamimotors.com", href: "mailto:info@kamimotors.com" },
                { icon: MapPin, label: "Location", value: "Metairie, LA 70001", href: null },
              ].map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="bg-[#080807] p-6 flex gap-4">
                  <div className="w-10 h-10 border border-[#C9A84C]/30 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-[#C9A84C]" />
                  </div>
                  <div>
                    <p className="text-[#6B6B6B] text-[10px] tracking-widest uppercase mb-1">{label}</p>
                    {href ? (
                      <a href={href} className="text-[#F8EAD9] text-sm hover:text-[#C9A84C] transition-colors">
                        {value}
                      </a>
                    ) : (
                      <p className="text-[#F8EAD9] text-sm">{value}</p>
                    )}
                  </div>
                </div>
              ))}

              <div className="bg-[#080807] p-6 flex gap-4">
                <div className="w-10 h-10 border border-[#C9A84C]/30 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-[#C9A84C]" />
                </div>
                <div className="flex-1">
                  <p className="text-[#6B6B6B] text-[10px] tracking-widest uppercase mb-3">Hours</p>
                  <div className="space-y-2">
                    {[
                      { day: "Monday – Friday", hours: "9am – 7pm" },
                      { day: "Saturday", hours: "9am – 6pm" },
                      { day: "Sunday", hours: "By Appointment" },
                    ].map(({ day, hours }) => (
                      <div key={day} className="flex justify-between text-sm">
                        <span className="text-[#B0B0B8]">{day}</span>
                        <span className={hours === "By Appointment" ? "text-[#C9A84C]" : "text-[#F8EAD9]"}>{hours}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-3">
              <div className="bg-[#111110] border border-[#2A2A26] p-8">
                {sent ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 border border-[#C9A84C]/30 bg-[#C9A84C]/5 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-[#C9A84C]" />
                    </div>
                    <h3
                      className="text-[#F8EAD9] text-3xl leading-none mb-2"
                      style={{ fontFamily: "var(--font-bebas), sans-serif" }}
                    >
                      Message Sent!
                    </h3>
                    <p className="text-[#B0B0B8] text-sm">We&apos;ll get back to you within 24 hours.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="mb-6">
                      <h2
                        className="text-[#F8EAD9] text-2xl leading-none"
                        style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.05em" }}
                      >
                        Send a Message
                      </h2>
                      <p className="text-[#6B6B6B] text-xs tracking-wide mt-1">We respond within 24 hours</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Name *</label>
                        <input
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          required
                          placeholder="John Doe"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Phone</label>
                        <input
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          placeholder="(504) 555-0100"
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Email *</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                        placeholder="john@email.com"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Message *</label>
                      <textarea
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        required
                        rows={5}
                        placeholder="I'm interested in a specific car, or have a question..."
                        className={inputClass + " resize-none"}
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 bg-[#C9A84C] hover:bg-[#E2CB7E] text-[#080807] font-bold py-3.5 text-sm tracking-widest uppercase transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      Send Message
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
