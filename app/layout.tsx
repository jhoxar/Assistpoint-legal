import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ScrollProgress from "@/components/ScrollProgress";
import "./globals.css";

/* The artifact self-hosted 20 @font-face rules — five weights across four
   unicode subsets, all pointing at the same four woff2 files (it is the
   variable font, sliced by subset). next/font reproduces that and self-hosts
   at build time, so there is no request to Google at runtime. */
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext", "vietnamese", "cyrillic-ext"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-jakarta",
});

const SITE = "https://www.assistpointclinical.com";

/* The artifact shipped no <title>, no description, no lang, no canonical and
   no social cards. All of it is authored here. */
export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "AssistPoint Clinical | Healthcare Operations, RCM & Care Management",
    template: "%s | AssistPoint Clinical",
  },
  description:
    "AssistPoint Clinical helps healthcare organizations strengthen revenue cycle management, care management, operations, financial performance and sustainable growth.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "AssistPoint Clinical",
    title: "AssistPoint Clinical | Healthcare Operations, RCM & Care Management",
    description:
      "Practical healthcare operations, revenue cycle and care-management support built for sustainable performance.",
    url: SITE,
  },
  twitter: {
    card: "summary_large_image",
    title: "AssistPoint Clinical",
    description:
      "Practical healthcare operations, revenue cycle and care-management support built for sustainable performance.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body>
        <ScrollProgress />
        <a href="#main" className="sr-only">
          Skip to main content
        </a>
        <SiteHeader />
        <main id="main" style={{ minHeight: "80vh" }}>
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
