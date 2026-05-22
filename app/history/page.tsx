"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "../components/Nav";
import { getUserId } from "../lib/userId";

interface MeetingItem {
  id: number;
  created_at: string;
  file_name: string;
  summary_first: string;
  summary_count: number;
  action_items_count: number;
  decisions_count: number;
  next_meeting: string;
  notifications_sent: boolean;
}

const PAGE_SIZE = 10;

export default function HistoryPage() {
  const router = useRouter();
  const [items, setItems] = useState<MeetingItem[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

  const fetchMeetings = async (newOffset: number, append = false) => {
    if (newOffset === 0) setLoading(true);
    else setLoadingMore(true);

    try {
      const res = await fetch(
        `${apiUrl}/history?limit=${PAGE_SIZE}&offset=${newOffset}`,
        { headers: { "X-User-ID": getUserId() } }
      );
      const data = await res.json();
      setTotal(data.total ?? 0);
      setItems((prev) => append ? [...prev, ...(data.meetings ?? [])] : (data.meetings ?? []));
      setOffset(newOffset);
    } catch {
      // 조용히 실패
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => { fetchMeetings(0); }, []);

  const hasMore = offset + PAGE_SIZE < total;

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#1a3a6b]">회의 내역</h2>
            <p className="text-sm text-slate-400 mt-1">
              {loading ? "불러오는 중..." : `총 ${total}개 회의`}
            </p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="text-sm bg-[#1a3a6b] text-white px-4 py-2 rounded-xl hover:bg-[#15306a] transition-colors"
          >
            + 새 회의 분석
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState onUpload={() => router.push("/")} />
        ) : (
          <>
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <MeetingCard
                  key={item.id}
                  item={item}
                  onClick={() => router.push(`/result/${item.id}`)}
                />
              ))}
            </div>

            {hasMore && (
              <button
                onClick={() => fetchMeetings(offset + PAGE_SIZE, true)}
                disabled={loadingMore}
                className="mt-6 w-full py-3 rounded-xl border border-slate-200 text-slate-500 text-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                {loadingMore ? "불러오는 중..." : "더 보기"}
              </button>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function MeetingCard({
  item,
  onClick,
}: {
  item: MeetingItem;
  onClick: () => void;
}) {
  const date = new Date(item.created_at).toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white border border-slate-100 rounded-2xl px-5 py-4 shadow-sm hover:border-[#1a3a6b]/30 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 text-sm truncate">
            {item.file_name || "제목 없음"}
          </p>
          {item.summary_first && (
            <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
              {item.summary_first}
            </p>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-slate-400">{date}</p>
          {item.notifications_sent && (
            <span className="mt-1 inline-block text-xs text-green-600">✓ 발송됨</span>
          )}
        </div>
      </div>

      <div className="mt-3 flex gap-2 flex-wrap">
        <StatBadge label="결정사항" count={item.decisions_count} color="indigo" />
        <StatBadge label="액션아이템" count={item.action_items_count} color="amber" />
        {item.next_meeting && (
          <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
            📅 {item.next_meeting}
          </span>
        )}
      </div>
    </button>
  );
}

function StatBadge({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: "indigo" | "amber";
}) {
  const cls =
    color === "indigo"
      ? "bg-indigo-50 text-indigo-600 border-indigo-200"
      : "bg-amber-50 text-amber-600 border-amber-200";
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium border px-2 py-0.5 rounded-full ${cls}`}>
      {count}개 {label}
    </span>
  );
}

function EmptyState({ onUpload }: { onUpload: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      </div>
      <p className="font-semibold text-slate-700">아직 분석한 회의가 없습니다</p>
      <p className="text-sm text-slate-400 mt-1">첫 회의 음성을 업로드해보세요</p>
      <button
        onClick={onUpload}
        className="mt-6 px-6 py-2.5 bg-[#1a3a6b] text-white text-sm rounded-xl hover:bg-[#15306a] transition-colors"
      >
        회의 분석 시작
      </button>
    </div>
  );
}
