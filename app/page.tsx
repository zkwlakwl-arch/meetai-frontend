"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "./components/Nav";

type UploadState = "idle" | "uploading" | "done" | "error";

export default function HomePage() {
  const router = useRouter();
  const [state, setState] = useState<UploadState>("idle");
  const [dragging, setDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const upload = useCallback(
    async (file: File) => {
      setState("uploading");
      setErrorMsg("");

      const form = new FormData();
      form.append("file", file);

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
        const res = await fetch(`${apiUrl}/upload`,
          { method: "POST", body: form }
        );

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.detail ?? `서버 오류 (${res.status})`);
        }

        const data = await res.json();
        sessionStorage.setItem("meetResult", JSON.stringify(data));
        setState("done");
        setTimeout(() => router.push("/result"), 800);
      } catch (e: unknown) {
        setState("error");
        setErrorMsg(e instanceof Error ? e.message : "알 수 없는 오류");
      }
    },
    [router]
  );

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        {/* 로고 */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#1a3a6b] mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-[#1a3a6b]">NoteFlow</h1>
          <p className="mt-2 text-slate-500 text-sm">
            회의 음성을 업로드하면 AI가 자동으로 분석합니다
          </p>
        </div>

        {/* 업로드 영역 */}
        {state === "idle" || state === "error" ? (
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`w-full max-w-lg flex flex-col items-center gap-4 border-2 border-dashed rounded-2xl py-16 px-8 cursor-pointer transition-all
              ${
                dragging
                  ? "border-[#1a3a6b] bg-blue-50"
                  : "border-slate-300 bg-white hover:border-[#1a3a6b] hover:bg-blue-50/30"
              }`}
          >
            <svg
              className="w-12 h-12 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>

            <div className="text-center">
              <p className="font-medium text-slate-700">
                파일을 여기에 드래그하거나
              </p>
              <p className="text-sm text-slate-500 mt-1">
                클릭해서 파일을 선택하세요
              </p>
              <p className="text-xs text-slate-400 mt-2">MP4 · M4A · MP3 지원</p>
            </div>

            <input
              type="file"
              accept=".mp4,.m4a,.mp3"
              className="hidden"
              onChange={onFileChange}
            />
          </label>
        ) : null}

        {/* 로딩 */}
        {state === "uploading" && (
          <div className="w-full max-w-lg flex flex-col items-center gap-6 bg-white rounded-2xl py-16 px-8 shadow-sm border border-slate-100">
            <div className="w-12 h-12 rounded-full border-4 border-[#1a3a6b] border-t-transparent animate-spin" />
            <div className="text-center">
              <p className="font-semibold text-slate-700">분석 중입니다...</p>
              <p className="text-sm text-slate-400 mt-1">
                음성 변환 → AI 분석 → Slack 발송
              </p>
            </div>
          </div>
        )}

        {/* 완료 */}
        {state === "done" && (
          <div className="w-full max-w-lg flex flex-col items-center gap-4 bg-white rounded-2xl py-16 px-8 shadow-sm border border-slate-100">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-600"
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
            </div>
            <p className="font-semibold text-slate-700">완료! 결과 페이지로 이동 중...</p>
          </div>
        )}

        {/* 에러 */}
        {state === "error" && (
          <p className="mt-4 text-sm text-red-500 bg-red-50 px-4 py-2 rounded-lg">
            {errorMsg}
          </p>
        )}
      </main>
    </div>
  );
}
