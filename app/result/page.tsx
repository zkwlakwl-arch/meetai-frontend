"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "../components/Nav";

interface ActionItem {
  assignee: string;
  deadline: string;
  task: string;
}

interface MeetResult {
  filename: string;
  db_id?: number;
  result: {
    summary: string[];
    decisions: string[];
    action_items: ActionItem[];
  };
}

export default function ResultPage() {
  const router = useRouter();
  const [data, setData] = useState<MeetResult | null>(null);
  const [slackSent] = useState(true);

  useEffect(() => {
    const raw = sessionStorage.getItem("meetResult");
    if (!raw) {
      router.replace("/");
      return;
    }
    setData(JSON.parse(raw));
  }, [router]);

  if (!data) return null;

  const { result, filename, db_id } = data;

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10 space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#1a3a6b]">분석 결과</h2>
            <p className="text-sm text-slate-400 mt-0.5">{filename}</p>
          </div>
          <div className="flex items-center gap-6">
            {db_id && (
              <span className="text-xs text-slate-400">DB #{db_id}</span>
            )}
            {slackSent && (
              <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-medium px-3 py-1.5 rounded-full border border-green-200">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
                Slack 발송 완료
              </span>
            )}
          </div>
        </div>

        {/* 회의 요약 */}
        <Section title="📋 회의 요약" color="blue">
          <ul className="space-y-2">
            {result.summary.map((line, i) => (
              <li key={i} className="flex gap-2 text-slate-700 text-sm leading-relaxed">
                <span className="text-[#1a3a6b] mt-0.5">•</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </Section>

        {/* 결정사항 */}
        <Section title="✅ 결정사항" color="indigo">
          {result.decisions.length > 0 ? (
            <ul className="space-y-2">
              {result.decisions.map((d, i) => (
                <li key={i} className="flex gap-2 text-slate-700 text-sm leading-relaxed">
                  <span className="text-indigo-500 mt-0.5">•</span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">결정사항 없음</p>
          )}
        </Section>

        {/* 액션아이템 */}
        <Section title="📌 액션아이템" color="amber">
          {result.action_items.length > 0 ? (
            <div className="space-y-3">
              {result.action_items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 bg-slate-50 rounded-xl px-4 py-3"
                >
                  <div className="w-7 h-7 rounded-full bg-[#1a3a6b] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800">{item.task}</p>
                    <div className="flex gap-3 mt-1 flex-wrap">
                      <Badge icon="👤" label={item.assignee} />
                      <Badge icon="📅" label={item.deadline} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">액션아이템 없음</p>
          )}
        </Section>

        <button
          onClick={() => {
            sessionStorage.removeItem("meetResult");
            router.push("/");
          }}
          className="w-full py-3 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-100 transition-colors"
        >
          새 파일 업로드
        </button>
      </main>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
        <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function Badge({ icon, label }: { icon: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
      {icon} {label}
    </span>
  );
}
