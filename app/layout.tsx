import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NoteFlow",
  description: "AI 회의록 자동 분석 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full bg-slate-50 antialiased">{children}</body>
    </html>
  );
}
