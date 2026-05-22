"use client";

import { useState, useEffect } from "react";
import Nav from "../components/Nav";

const STORAGE_KEY = "nf_slack_webhook";

export default function SettingsPage() {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setWebhookUrl(stored);
  }, []);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, webhookUrl);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-10">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-[#1a3a6b]">설정</h2>
          <p className="text-sm text-slate-400 mt-1">서비스 연동을 설정합니다</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* 섹션 헤더 */}
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#1a3a6b]/10 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-[#1a3a6b]"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">Slack 연동</p>
              <p className="text-xs text-slate-400">분석 완료 후 Slack으로 결과를 전송합니다</p>
            </div>
          </div>

          {/* 입력 영역 */}
          <div className="px-6 py-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Incoming Webhook URL
              </label>
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://hooks.slack.com/services/..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/30 focus:border-[#1a3a6b] transition-all"
              />
              <p className="mt-1.5 text-xs text-slate-400">
                Slack 앱 → Incoming Webhooks에서 발급받을 수 있습니다
              </p>
            </div>

            <button
              onClick={handleSave}
              disabled={!webhookUrl.trim()}
              className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all
                ${
                  saved
                    ? "bg-green-500 text-white"
                    : "bg-[#1a3a6b] text-white hover:bg-[#15306a] disabled:opacity-40 disabled:cursor-not-allowed"
                }`}
            >
              {saved ? "✓ 저장됨" : "저장"}
            </button>
          </div>
        </div>

        {/* 안내 카드 */}
        <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl px-6 py-4">
          <p className="text-xs font-semibold text-[#1a3a6b] mb-1">백엔드 설정 안내</p>
          <p className="text-xs text-slate-600 leading-relaxed">
            Webhook URL은 브라우저에만 저장됩니다. 서버 측 발송 설정은{" "}
            <code className="bg-white/70 px-1 py-0.5 rounded font-mono">meetai/.env</code>의{" "}
            <code className="bg-white/70 px-1 py-0.5 rounded font-mono">SLACK_WEBHOOK_URL</code>을
            직접 수정하세요.
          </p>
        </div>
      </main>
    </div>
  );
}
