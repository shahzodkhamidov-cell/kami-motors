import type { Metadata } from "next";
import { Bebas_Neue, DM_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const bebasNeue = Bebas_Neue({
  weight: "400",
  variable: "--font-bebas",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

// Default for pages without a title of their own (the homepage sets its own in homepage/build.mjs)
export const metadata: Metadata = {
  title: "Used Cars Up to 40% Below Market in Metairie | Kami Motors",
  description:
    "See today's cash prices: quality used cars in Metairie, LA, up to 40% below market. $0 dealer fees, $0 doc fee, financing available. Kami Motors (KMG AUTO LLC).",
  openGraph: {
    title: "Drive More, Pay Less | Kami Motors, Metairie LA",
    description: "Quality used cars in Metairie, LA, up to 40% below market. $0 dealer fees, $0 doc fee.",
    type: "website",
    siteName: "Kami Motors",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme')||'light';document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${bebasNeue.variable} ${dmSans.variable} font-sans antialiased`}>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
