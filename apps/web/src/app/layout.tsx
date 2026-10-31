import type { Metadata } from "next";
import { Bricolage_Grotesque, Newsreader } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Qizil Qalam: IELTS inglizcha tayyorgarlik",
    template: "%s | Qizil Qalam",
  },
  description:
    "IELTS uchun lug'at, grammatika, o'qish va yozish mashqlari. Insho imtihonchi ko'zi bilan tekshiriladi, xatolar qizil qalamda belgilanadi.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="uz" className={`${bricolage.variable} ${newsreader.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <TooltipProvider>
          <a
            href="#asosiy"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
          >
            Asosiy mazmunga o&apos;tish
          </a>
          <SiteHeader />
          <main id="asosiy" className="flex-1">
            {children}
          </main>
          <footer className="border-t border-border/80 py-8 text-sm text-muted-foreground">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              Natijalar brauzeringizda saqlanadi, ro&apos;yxatdan o&apos;tish shart emas. Ball
              baholari taxminiy va rasmiy IELTS natijasini bildirmaydi. So&apos;zlar ro&apos;yxati:{" "}
              <a
                className="underline underline-offset-2 hover:text-foreground"
                href="https://www.newgeneralservicelist.com"
                rel="noreferrer"
                target="_blank"
              >
                New General Service List
              </a>{" "}
              (Browne, Culligan, Phillips), CC BY-SA 4.0.
            </div>
          </footer>
        </TooltipProvider>
      </body>
    </html>
  );
}
