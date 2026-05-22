"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const path = usePathname();

  const links = [
    { href: "/", label: "업로드" },
    { href: "/result", label: "결과" },
    { href: "/settings", label: "설정" },
  ];

  return (
    <nav className="bg-[#1a3a6b] text-white shadow-md">
      <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
        <span className="font-bold text-lg tracking-wide">NoteFlow</span>
        <div className="flex gap-6 text-sm">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`hover:text-blue-200 transition-colors ${
                path === href ? "text-blue-200 font-semibold" : "text-white/80"
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
