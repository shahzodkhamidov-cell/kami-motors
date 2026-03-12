import Link from "next/link";
import { Shield, TrendingDown, Award, Phone, MapPin, Clock, CheckCircle, ArrowRight } from "lucide-react";

export const metadata = {
  title: "About Kami Motors | Rebuilt Title Specialists in Metairie, LA",
};

export default function AboutPage() {
  return (
    <div className="pt-20 min-h-screen bg-[#080807]">
      {/* Hero */}
      <section className="py-20 border-b border-[#2A2A26]">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-px bg-[#C9A84C]" />
            <span className="text-[#C9A84C] text-xs tracking-[0.3em] uppercase">Metairie, LA · Est. 2020</span>
          </div>
          <h1
            className="text-[#F8EAD9] leading-none mb-6"
            style={{ fontFamily: "var(--font-bebas), sans-serif", fontSize: "clamp(3.5rem, 9vw, 7rem)", letterSpacing: "0.03em" }}
          >
            ABOUT{" "}
            <span style={{ background: "linear-gradient(135deg, #C9A84C, #E2CB7E)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              KAMI MOTORS
            </span>
          </h1>
          <p className="text-[#B0B0B8] text-lg max-w-2xl leading-relaxed">
            We&apos;re not your typical car dealership. We specialize in one thing: giving you the
            most car for your money through quality rebuilt title vehicles — fully inspected, fully transparent.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 border-b border-[#2A2A26]">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[#C9A84C] text-xs tracking-[0.25em] uppercase mb-4">Our Story</p>
              <h2
                className="text-[#F8EAD9] leading-none mb-6"
                style={{ fontFamily: "var(--font-bebas), sans-serif", fontSize: "clamp(2.5rem, 5vw, 4rem)", letterSpacing: "0.03em" }}
              >
                GREAT CARS SHOULDN&apos;T COST A FORTUNE
              </h2>
              <div className="space-y-4 text-[#B0B0B8] text-sm leading-relaxed">
                <p>
                  Kami Motors was founded on a simple idea: great cars shouldn&apos;t cost a fortune. We
                  noticed that thousands of perfectly fine vehicles get sidelined just because of a title
                  designation — even after full, professional repairs.
                </p>
                <p>
                  We built our dealership around sourcing, inspecting, and selling rebuilt title vehicles
                  with full transparency. Every car we carry has been repaired to meet or exceed Louisiana
                  state inspection standards.
                </p>
                <p>
                  Based in Metairie, we serve customers across the entire New Orleans metro area and
                  beyond. Our customers come to us when they want more car for less money — without
                  compromising on quality or reliability.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-px bg-[#2A2A26]">
              {[
                { label: "Happy Customers", value: "200+" },
                { label: "Max Savings", value: "40%" },
                { label: "State Inspected", value: "100%" },
                { label: "Years Serving LA", value: "5+" },
              ].map((s) => (
                <div key={s.label} className="bg-[#080807] p-8 text-center">
                  <p
                    className="text-[#C9A84C] leading-none mb-2"
                    style={{ fontFamily: "var(--font-bebas), sans-serif", fontSize: "3rem" }}
                  >
                    {s.value}
                  </p>
                  <p className="text-[#6B6B6B] text-xs tracking-widest uppercase">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What is rebuilt title */}
      <section className="py-16 border-b border-[#2A2A26] bg-[#0A0A09]">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="text-center mb-12">
            <p className="text-[#C9A84C] text-xs tracking-[0.25em] uppercase mb-4">The Truth</p>
            <h2
              className="text-[#F8EAD9] leading-none"
              style={{ fontFamily: "var(--font-bebas), sans-serif", fontSize: "clamp(2.5rem, 5vw, 4rem)", letterSpacing: "0.03em" }}
            >
              WHAT IS A{" "}
              <span style={{ background: "linear-gradient(135deg, #C9A84C, #E2CB7E)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                REBUILT TITLE?
              </span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#2A2A26]">
            {[
              {
                title: "Previously Damaged & Repaired",
                desc: "A rebuilt title means the car was damaged (often in an accident or flood) and has since been professionally repaired.",
              },
              {
                title: "Passed Louisiana State Inspection",
                desc: "Before being titled as \"rebuilt,\" the vehicle must pass a rigorous state safety inspection — it is road legal and safe to drive.",
              },
              {
                title: "Same Quality, Lower Price",
                desc: "The title designation sticks, which lowers the resale value. That means you get a fully functional car at 20–40% below market rate.",
              },
              {
                title: "Insurable Vehicle",
                desc: "Most major insurers cover rebuilt title vehicles. Comprehensive and collision coverage may vary — we can help guide you.",
              },
            ].map((item, i) => (
              <div key={i} className="bg-[#0A0A09] p-8 flex gap-4 group hover:bg-[#111110] transition-colors">
                <div className="w-8 h-8 border border-[#C9A84C]/30 group-hover:border-[#C9A84C]/60 flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                  <CheckCircle className="w-4 h-4 text-[#C9A84C]" />
                </div>
                <div>
                  <p
                    className="text-[#F8EAD9] text-lg leading-none mb-2"
                    style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.03em" }}
                  >
                    {item.title}
                  </p>
                  <p className="text-[#B0B0B8] text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 border-b border-[#2A2A26]">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#2A2A26]">
            {[
              {
                icon: TrendingDown,
                title: "Transparent Pricing",
                desc: "We show you the clean title market value on every listing so you always know exactly how much you&apos;re saving.",
              },
              {
                icon: Shield,
                title: "Fully Inspected",
                desc: "Every car passes our internal check plus Louisiana state inspection before it hits our lot.",
              },
              {
                icon: Award,
                title: "No Surprises",
                desc: "We disclose rebuild history upfront. No hidden issues, no surprises at the DMV.",
              },
            ].map((item) => (
              <div key={item.title} className="bg-[#080807] p-10 group hover:bg-[#111110] transition-colors">
                <div className="w-12 h-12 border border-[#C9A84C]/30 group-hover:border-[#C9A84C]/60 flex items-center justify-center mb-6 transition-colors">
                  <item.icon className="w-5 h-5 text-[#C9A84C]" />
                </div>
                <h3
                  className="text-[#F8EAD9] text-2xl mb-3"
                  style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.05em" }}
                >
                  {item.title}
                </h3>
                <p className="text-[#B0B0B8] text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: item.desc }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visit Us */}
      <section className="py-16 border-b border-[#2A2A26] bg-[#0A0A09]">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <p className="text-[#C9A84C] text-xs tracking-[0.25em] uppercase mb-4">Find Us</p>
          <h2
            className="text-[#F8EAD9] leading-none mb-10"
            style={{ fontFamily: "var(--font-bebas), sans-serif", fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "0.03em" }}
          >
            VISIT US
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#2A2A26]">
            {[
              { icon: MapPin, label: "Location", lines: ["Metairie, LA 70001"] },
              { icon: Phone, label: "Phone", lines: ["(305) 815-8880"], href: "tel:+13058158880" },
              { icon: Clock, label: "Hours", lines: ["Mon–Fri: 9am–7pm", "Sat: 9am–6pm", "Sun: By Appointment"] },
            ].map(({ icon: Icon, label, lines, href }) => (
              <div key={label} className="bg-[#0A0A09] p-8 flex gap-4">
                <div className="w-10 h-10 border border-[#C9A84C]/30 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-[#C9A84C]" />
                </div>
                <div>
                  <p className="text-[#6B6B6B] text-[10px] tracking-widest uppercase mb-2">{label}</p>
                  {lines.map((line, i) =>
                    href && i === 0 ? (
                      <a key={i} href={href} className="block text-[#F8EAD9] text-sm hover:text-[#C9A84C] transition-colors">
                        {line}
                      </a>
                    ) : (
                      <p key={i} className="text-[#B0B0B8] text-sm">{line}</p>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#C9A84C]">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 text-center">
          <h2
            className="text-[#080807] leading-none mb-4"
            style={{ fontFamily: "var(--font-bebas), sans-serif", fontSize: "clamp(3rem, 7vw, 5.5rem)", letterSpacing: "0.03em" }}
          >
            READY TO FIND YOUR CAR?
          </h2>
          <p className="text-[#080807]/70 mb-10 text-lg max-w-xl mx-auto">
            Browse our full inventory and apply for financing right from any listing.
          </p>
          <Link
            href="/inventory"
            className="inline-flex items-center gap-2 bg-[#080807] text-[#C9A84C] font-bold px-8 py-4 text-sm tracking-widest uppercase hover:bg-[#111110] transition-colors"
          >
            Browse Inventory
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
