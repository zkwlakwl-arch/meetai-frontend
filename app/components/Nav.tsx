"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const path = usePathname();

  const links = [
    { href: "/", label: "업로드" },
    { href: "/history", label: "내역" },
    { href: "/settings", label: "설정" },
  ];

  return (
    <nav className="bg-[#1a3a6b] text-white shadow-md">
      <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg tracking-wide hover:text-blue-200 transition-colors">
          NoteFlow
        </Link>
        <div className="flex gap-6 text-sm">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`hover:text-blue-200 transition-colors ${
                path === href || (href !== "/" && path.startsWith(href))
                  ? "text-blue-200 font-semibold"
                  : "text-white/80"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
