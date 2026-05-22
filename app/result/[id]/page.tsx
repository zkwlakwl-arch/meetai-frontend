"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Nav from "../../components/Nav";

interface ActionItem {
  assignee: string;
  deadline: string;
  task: string;
  priority?: string;
}

interface SharedResult {
  db_id: number;
  filename: string;
  created_at: string;
  result: {
    summary: string[];
    decisions: string[];
    action_items: ActionItem[];
    next_meeting?: string;
  };
}

export default function SharedResultPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<SharedResult | null>(null);
  const [error, setError] = useState("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

  useEffect(() => {
    const id = params?.id;
    if (!id) { router.replace("/"); return; }

    fetch(`${apiUrl}/meetings/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("회의 기록을 찾을 수 없습니다.");
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message));
  }, [params, apiUrl, router]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Nav />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-slate-500">{error}</p>
            <button onClick={() => router.push("/")} className="mt-4 text-sm text-[#1a3a6b] underline">
              홈으로
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col">
        <Nav />
        <main className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-[#1a3a6b] border-t-transparent animate-spin" />
        </main>
      </div>
    );
  }

  const { result, filename, created_at } = data;
  const date = new Date(created_at).toLocaleDateString("ko-KR", {
    year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-[#1a3a6b]">공유된 회의 결과</h2>
          <p className="text-sm text-slate-400 mt-0.5">{filename} · {date}</p>
        </div>

        <Section title="📋 회의 요약">
          <ul className="space-y-2">
            {result.summary.map((line, i) => (
              <li key={i} className="flex gap-2 text-slate-700 text-sm leading-relaxed">
                <span className="text-[#1a3a6b] mt-0.5">•</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="✅ 결정사항">
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
            <p className="text-sm text-slate-400">없음</p>
          )}
        </Section>

        <Section title="📌 액션아이템">
          {result.action_items.length > 0 ? (
            <div className="space-y-3">
              {result.action_items.map((item, i) => (
                <div key={i} className="flex items-start gap-4 bg-slate-50 rounded-xl px-4 py-3">
                  <div className="w-7 h-7 rounded-full bg-[#1a3a6b] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800">{item.task}</p>
                    <div className="flex gap-3 mt-1 flex-wrap">
                      <Badge icon="👤" label={item.assignee} />
                      <Badge icon="📅" label={item.deadline} />
                      {item.priority && <PriorityBadge priority={item.priority} />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">없음</p>
          )}
        </Section>

        {result.next_meeting && (
          <Section title="📅 다음 회의">
            <p className="text-sm text-slate-700">{result.next_meeting}</p>
          </Section>
        )}
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
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

function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    높음: "bg-red-50 text-red-600 border-red-200",
    중간: "bg-amber-50 text-amber-600 border-amber-200",
    낮음: "bg-slate-50 text-slate-500 border-slate-200",
  };
  const cls = styles[priority] ?? styles["중간"];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium border px-2 py-0.5 rounded-full ${cls}`}>
      {priority === "높음" ? "🔴" : priority === "낮음" ? "🟢" : "🟡"} {priority}
    </span>
  );
}
