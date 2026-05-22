"use client";

import { useEffect, useState } from "react";
import Nav from "../components/Nav";
import { getUserId } from "../lib/userId";

interface SubscriptionStatus {
  plan: string;
  subscription_status?: string;
  trial_remaining: number;
  monthly_remaining: number | null;
  upload_allowed: boolean;
  trial_limit: number;
  monthly_limit: number;
}

interface PlanInfo {
  name: string;
  price_krw: number;
  description: string;
  variant_id: string;
}

export default function SettingsPage() {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [plans, setPlans] = useState<Record<string, PlanInfo>>({});
  const [userId, setUserId] = useState("");
  const [copied, setCopied] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

  useEffect(() => {
    const uid = getUserId();
    setUserId(uid);

    fetch(`${apiUrl}/subscription/status`, {
      headers: { "X-User-ID": uid },
    })
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => null);

    fetch(`${apiUrl}/plans`)
      .then((r) => r.json())
      .then((d) => setPlans(d.plans ?? {}))
      .catch(() => null);
  }, [apiUrl]);

  const copyUserId = () => {
    navigator.clipboard.writeText(userId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const buildCheckoutUrl = (variantId: string) => {
    return `https://checkout.lemonsqueezy.com/checkout/buy/${variantId}?checkout[custom][user_id]=${userId}`;
  };

  const planLabel: Record<string, string> = {
    free: "무료 체험",
    starter: "Starter",
    business: "Business",
    team: "Team",
  };

  const planColor: Record<string, string> = {
    free: "bg-slate-100 text-slate-600",
    starter: "bg-blue-100 text-blue-700",
    business: "bg-indigo-100 text-indigo-700",
    team: "bg-green-100 text-green-700",
  };

  const currentPlan = status?.plan ?? "free";

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-10 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-[#1a3a6b]">설정</h2>
          <p className="text-sm text-slate-400 mt-1">계정 및 구독 정보</p>
        </div>

        {/* 구독 현황 */}
        <Card title="구독 현황">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">현재 플랜</span>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${planColor[currentPlan] ?? planColor.free}`}>
                {planLabel[currentPlan] ?? currentPlan}
              </span>
            </div>

            {status && (
              <>
                {currentPlan === "free" && (
                  <QuotaRow
                    label="무료 체험"
                    used={status.trial_limit - status.trial_remaining}
                    total={status.trial_limit}
                  />
                )}
                {(currentPlan === "starter" || currentPlan === "business") && status.monthly_remaining !== null && (
                  <QuotaRow
                    label="이번 달 사용량"
                    used={status.monthly_limit - status.monthly_remaining}
                    total={status.monthly_limit}
                  />
                )}
                {currentPlan === "team" && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">업로드</span>
                    <span className="font-medium text-green-600">무제한</span>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>

        {/* 플랜 업그레이드 (free / starter만 표시) */}
        {(currentPlan === "free" || currentPlan === "starter") && Object.keys(plans).length > 0 && (
          <Card title="플랜 업그레이드">
            <div className="space-y-3">
              {Object.entries(plans)
                .filter(([key]) => key !== currentPlan)
                .map(([key, plan]) => (
                  <div key={key} className="flex items-center justify-between p-3 rounded-xl border border-slate-200">
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{plan.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{plan.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#1a3a6b]">₩{plan.price_krw.toLocaleString()}<span className="text-xs font-normal text-slate-400">/월</span></p>
                      {plan.variant_id ? (
                        <a
                          href={buildCheckoutUrl(plan.variant_id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-block text-xs bg-[#1a3a6b] text-white px-3 py-1 rounded-lg hover:bg-[#15306a] transition-colors"
                        >
                          구독하기
                        </a>
                      ) : (
                        <span className="mt-1 inline-block text-xs bg-slate-100 text-slate-400 px-3 py-1 rounded-lg">준비 중</span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        )}

        {/* 연동 현황 */}
        <Card title="서비스 연동">
          <div className="space-y-3">
            <IntegrationRow
              icon="💬"
              name="Slack"
              description="분석 완료 후 채널로 발송"
              note="서버 환경변수로 설정"
            />
            <IntegrationRow
              icon="🟡"
              name="KakaoWork"
              description="카카오워크 채널로 발송"
              note="서버 환경변수로 설정"
            />
            <IntegrationRow
              icon="✉️"
              name="이메일"
              description="결과 페이지에서 이메일 주소 입력"
              note="SMTP 서버 환경변수로 설정"
            />
          </div>
          <p className="mt-4 text-xs text-slate-400 leading-relaxed">
            연동 설정은 서버 환경변수에서 관리됩니다.
            관리자에게 <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">SLACK_WEBHOOK_URL</code>,{" "}
            <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">KAKAOWORK_BOT_TOKEN</code>,{" "}
            <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">SMTP_USER</code> 설정을 요청하세요.
          </p>
        </Card>

        {/* 계정 정보 */}
        <Card title="계정 정보">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">사용자 ID</p>
              <p className="text-xs text-slate-400 mt-0.5 font-mono truncate max-w-xs">{userId}</p>
            </div>
            <button
              onClick={copyUserId}
              className="text-xs text-[#1a3a6b] border border-[#1a3a6b]/30 px-3 py-1.5 rounded-lg hover:bg-[#1a3a6b]/5 transition-colors"
            >
              {copied ? "✓ 복사됨" : "복사"}
            </button>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            이 ID는 이 브라우저에 고정됩니다. 고객지원 문의 시 사용하세요.
          </p>
        </Card>
      </main>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60">
        <p className="font-semibold text-slate-800 text-sm">{title}</p>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

function QuotaRow({ label, used, total }: { label: string; used: number; total: number }) {
  const pct = Math.min((used / total) * 100, 100);
  const remaining = total - used;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-slate-600">{label}</span>
        <span className={`font-medium ${remaining <= 2 ? "text-red-500" : "text-slate-700"}`}>
          {remaining}회 남음 ({used}/{total})
        </span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-1.5 rounded-full transition-all ${pct > 80 ? "bg-red-400" : "bg-[#1a3a6b]"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function IntegrationRow({
  icon,
  name,
  description,
  note,
}: {
  icon: string;
  name: string;
  description: string;
  note: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xl w-8 text-center">{icon}</span>
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-700">{name}</p>
        <p className="text-xs text-slate-400">{description}</p>
      </div>
      <span className="text-xs text-slate-400 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg whitespace-nowrap">
        {note}
      </span>
    </div>
  );
}
