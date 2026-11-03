import type { Metadata } from "next";

// The inventory list is a client page, so its title lives here (each car page sets its own)
export const metadata: Metadata = {
  title: "Used Cars for Sale in Metairie, LA | Kami Motors",
  description:
    "Browse every car on the lot with today's cash prices, up to 40% below market. $0 dealer fees, $0 doc fee, financing available. Kami Motors (KMG AUTO LLC).",
};

export default function InventoryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
