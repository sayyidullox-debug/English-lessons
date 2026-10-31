"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/vocabulary", label: "Lug'at" },
  { href: "/grammar", label: "Grammatika" },
  { href: "/reading", label: "O'qish" },
  { href: "/speaking", label: "Gapirish" },
  { href: "/writing", label: "Yozish" },
  { href: "/progress", label: "Natijalar" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b border-border/80">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-2 px-4 py-3 sm:px-6">
        <Link href="/" className="group flex items-baseline gap-2" aria-label="Qizil Qalam, bosh sahifa">
          <span className="text-xl font-bold tracking-tight">Qizil Qalam</span>
          <svg
            aria-hidden="true"
            viewBox="0 0 40 8"
            className="h-2 w-10 text-pen transition-transform group-hover:translate-x-0.5"
          >
            <path
              d="M1 5 C 6 1, 10 7, 15 4 S 25 1, 29 4 S 36 6, 39 3"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </Link>

        <nav aria-label="Asosiy menyu" className="-mx-1 flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <ul className="flex items-center gap-1">
            {NAV.map(({ href, label }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "block whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                      active && "marker-hl text-foreground",
                    )}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
