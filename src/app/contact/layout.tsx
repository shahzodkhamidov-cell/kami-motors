import type { Metadata } from "next";

// The contact page is a client page, so its title lives here
export const metadata: Metadata = {
  title: "Contact Kami Motors | Used Car Dealer in Metairie, LA",
  description:
    "Ask about any car, schedule a visit or apply for financing. Kami Motors (KMG AUTO LLC), Metairie, LA. Open Monday to Saturday.",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
