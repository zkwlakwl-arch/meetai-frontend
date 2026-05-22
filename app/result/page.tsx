"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "../components/Nav";
import { getUserId } from "../lib/userId";

interface ActionItem {
  assignee: string;
  deadline: string;
  task: string;
  priority?: string;
}

interface MeetResult {
  filename: string;
  db_id?: number;
  result: {
    summary: string[];
    decisions: string[];
    action_items: ActionItem[];
    next_meeting?: string;
  };
}

type NotifyState = "countdown" | "sending" | "sent" | "cancelled";

export default function ResultPage() {
  const router = useRouter();
  const [data, setData] = useState<MeetResult | null>(null);
  const [notifyState, setNotifyState] = useState<NotifyState>("countdown");
  const [countdown, setCountdown] = useState(30);
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);
  const cancelledRef = useRef(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

  useEffect(() => {
    const raw = sessionStorage.getItem("meetResult");
    if (!raw) {
      router.replace("/");
      return;
    }
    setData(JSON.parse(raw));
  }, [router]);

  // 30초 카운트다운
  useEffect(() => {
    if (!data || notifyState !== "countdown") return;

    if (countdown <= 0) {
      sendNotifications();
      return;
    }

    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          if (!cancelledRef.current) sendNotifications();
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, notifyState]);

  const sendNotifications = async () => {
    if (cancelledRef.current || !data?.db_id) {
      setNotifyState("sent");
      return;
    }
    setNotifyState("sending");
    try {
      await fetch(`${apiUrl}/meetings/${data.db_id}/notify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-ID": getUserId(),
        },
        body: JSON.stringify({ email: email || null }),
      });
    } catch {
      // 발송 실패해도 결과는 유지
    }
    setNotifyState("sent");
  };

  const cancelSend = () => {
    cancelledRef.current = true;
    setNotifyState("cancelled");
  };

  const copyShareLink = () => {
    if (!data?.db_id) return;
    const url = `${window.location.origin}/result/${data.db_id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!data) return null;

  const { result, filename, db_id } = data;

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10 space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-bold text-[#1a3a6b]">분석 결과</h2>
            <p className="text-sm text-slate-400 mt-0.5">{filename}</p>
          </div>
          <div className="flex items-center gap-3">
            {db_id && (
              <button
                onClick={copyShareLink}
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
              >
                {copied ? "✓ 복사됨" : "🔗 공유 링크"}
              </button>
            )}
          </div>
        </div>

        {/* 30초 발송 배너 */}
        {data?.db_id && (
          <NotifyBanner
            state={notifyState}
            countdown={countdown}
            email={email}
            onEmailChange={setEmail}
            onSendNow={sendNotifications}
            onCancel={cancelSend}
          />
        )}

        {/* 회의 요약 */}
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

        {/* 결정사항 */}
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
            <p className="text-sm text-slate-400">결정사항 없음</p>
          )}
        </Section>

        {/* 액션아이템 */}
        <Section title="📌 액션아이템">
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
                      {item.priority && <PriorityBadge priority={item.priority} />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">액션아이템 없음</p>
          )}
        </Section>

        {/* 다음 회의 */}
        {result.next_meeting && (
          <Section title="📅 다음 회의">
            <p className="text-sm text-slate-700">{result.next_meeting}</p>
          </Section>
        )}

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

function NotifyBanner({
  state,
  countdown,
  email,
  onEmailChange,
  onSendNow,
  onCancel,
}: {
  state: NotifyState;
  countdown: number;
  email: string;
  onEmailChange: (v: string) => void;
  onSendNow: () => void;
  onCancel: () => void;
}) {
  if (state === "sent") {
    return (
      <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700">
        <span>✓</span>
        <span>Slack / KakaoWork 발송 완료</span>
      </div>
    );
  }

  if (state === "cancelled") {
    return (
      <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-500">
        <span>발송 취소됨</span>
        <button onClick={onSendNow} className="text-[#1a3a6b] font-medium hover:underline">
          지금 발송
        </button>
      </div>
    );
  }

  if (state === "sending") {
    return (
      <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700">
        <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        <span>발송 중...</span>
      </div>
    );
  }

  // countdown
  const progress = ((30 - countdown) / 30) * 100;

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* 프로그레스 바 */}
      <div className="h-1 bg-slate-100">
        <div
          className="h-1 bg-[#1a3a6b] transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="px-4 py-3 flex items-center gap-3 flex-wrap">
        <span className="text-sm text-slate-600 flex-1">
          <span className="font-semibold text-[#1a3a6b]">{countdown}초</span> 후 Slack · KakaoWork 발송
        </span>
        <input
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="이메일도 받기 (선택)"
          className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#1a3a6b] w-44"
        />
        <button
          onClick={onSendNow}
          className="text-xs bg-[#1a3a6b] text-white px-3 py-1.5 rounded-lg hover:bg-[#15306a] transition-colors"
        >
          지금 발송
        </button>
        <button
          onClick={onCancel}
          className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
        >
          취소
        </button>
      </div>
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
