'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import CopyrightNotice from '@/components/CopyrightNotice';
import type { ActivitySettings, StartMode } from '@/types';

const DEFAULT_SETTINGS: ActivitySettings = {
  startMode: 'qr_scan',
  updatedAt: new Date(0).toISOString(),
};

export default function HomePage() {
  const [settings, setSettings] = useState<ActivitySettings | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const startMode = settings?.startMode;
  const simpleMode = startMode === 'email_button';

  useEffect(() => {
    let mounted = true;

    async function loadSettings() {
      try {
        const res = await fetch('/api/settings', { cache: 'no-store' });
        const data = (await res.json()) as {
          success?: boolean;
          settings?: ActivitySettings;
        };
        if (mounted) {
          setSettings(data.success && data.settings ? data.settings : DEFAULT_SETTINGS);
        }
      } catch {
        if (mounted) {
          setSettings(DEFAULT_SETTINGS);
        }
      }
    }

    loadSettings();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0a0614] text-white">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/ipverse-hero.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0614]/95 via-[#0a0614]/70 to-[#0a0614]/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0614] via-transparent to-[#0a0614]/20" />

      {/* Floating particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${10 + (i * 6) % 90}%`,
              top: `${5 + (i * 13) % 90}%`,
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${4 + (i % 4)}s`,
              width: `${2 + (i % 3) * 2}px`,
              height: `${2 + (i % 3) * 2}px`,
              opacity: 0.15 + (i % 5) * 0.05,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex min-h-screen items-center px-6 py-12 md:px-12">
        <div className="w-full max-w-xl space-y-8">
          {/* Logo / Title */}
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <ModeBadge mode={startMode} />
              <button
                type="button"
                onClick={() => setGuideOpen(true)}
                className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/80 backdrop-blur-md transition hover:border-white/30 hover:bg-white/15"
              >
                操作指南
              </button>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold font-[family-name:var(--font-outfit)] bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              IP Verse AI
            </h1>
            <p className="text-xl text-white/75">互動式 AI 合照體驗</p>
          </div>

          {/* Description */}
          <p className="max-w-md text-lg leading-relaxed text-white/65">
            與畫面中的虛擬偶像角色一起拍攝 AI 合照
            <br />
            {simpleMode
              ? '目前為簡易模式，請直接從展示端輸入 Email 並開始拍照'
              : '掃描 QR Code、拍下照片，系統會生成活動專屬合影並寄送到信箱'}
          </p>

          {/* Navigation cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Join - Mobile */}
            {simpleMode ? (
              <div className="block rounded-2xl border border-white/10 bg-white/[0.03] p-8 opacity-55 shadow-xl backdrop-blur-xl">
                <div className="mb-4 text-4xl grayscale">📱</div>
                <h2 className="mb-2 text-2xl font-semibold text-white font-[family-name:var(--font-outfit)]">
                  參加者入口 <span className="text-xs font-normal text-white/40">(已封印)</span>
                </h2>
                <p className="text-sm text-white/50">
                  簡易模式會省略手機掃碼流程，請從展示端直接開始。
                </p>
                <div className="mt-4 text-sm text-white/40">
                  簡易模式不可點擊
                </div>
              </div>
            ) : (
              <Link
                href="/join"
                target="_blank"
                rel="noopener noreferrer"
                className="group block bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl transition-all duration-300 hover:translate-y-[-4px] hover:shadow-2xl hover:border-purple-500/30 hover:bg-white/10"
              >
                <div className="text-4xl mb-4">📱</div>
                <h2 className="text-2xl font-semibold text-white mb-2 font-[family-name:var(--font-outfit)]">
                  參加者入口 <span className="text-xs text-white/40 font-normal">(另開新分頁)</span>
                </h2>
                <p className="text-white/50 text-sm">
                  使用手機輸入 Email，取得專屬 QR Code
                </p>
                <div className="mt-4 text-purple-400 text-sm group-hover:text-purple-300 transition-colors">
                  前往 /join (新分頁) →
                </div>
              </Link>
            )}

            {/* Kiosk - Desktop */}
            <Link
              href="/kiosk"
              className="group block bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl transition-all duration-300 hover:translate-y-[-4px] hover:shadow-2xl hover:border-blue-500/30 hover:bg-white/10"
            >
              <div className="text-4xl mb-4">🖥️</div>
              <h2 className="text-2xl font-semibold text-white mb-2 font-[family-name:var(--font-outfit)]">
                展示端
              </h2>
              <p className="text-white/50 text-sm">
                {simpleMode
                  ? 'Mac / Chrome 大螢幕展示端，輸入 Email 後直接拍照'
                  : 'Mac / Chrome 大螢幕展示端，掃描 QR Code 開始拍照'}
              </p>
              <div className="mt-4 text-blue-400 text-sm group-hover:text-blue-300 transition-colors">
                前往 /kiosk →
              </div>
            </Link>
          </div>

          {/* Footer */}
          <div className="space-y-1 pt-2">
            <p>IP Verse AI MVP — Demo Version</p>
            <CopyrightNotice />
          </div>
        </div>
      </div>

      {guideOpen && <GuideDialog onClose={() => setGuideOpen(false)} />}
    </main>
  );
}

function ModeBadge({ mode }: { mode?: StartMode }) {
  const label =
    mode === 'email_button'
      ? '目前模式：簡易模式'
      : mode === 'qr_scan'
        ? '目前模式：掃碼模式'
        : '目前模式：讀取中';

  return (
    <div className="rounded-full border border-blue-300/30 bg-blue-500/15 px-4 py-2 text-sm font-semibold text-blue-100 shadow-lg shadow-blue-950/20 backdrop-blur-md">
      {label}
    </div>
  );
}

function GuideDialog({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-5 py-8 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-title"
    >
      <div className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/15 bg-[#100a1f]/95 p-6 shadow-2xl shadow-black/40 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-blue-200/80">IP Verse AI</p>
            <h2 id="guide-title" className="mt-1 text-2xl font-bold text-white">
              操作指南
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-sm text-white/70 transition hover:bg-white/20"
            aria-label="關閉操作指南"
          >
            關閉
          </button>
        </div>

        <div className="mt-6 space-y-5 text-sm leading-7 text-white/72">
          <p>
            此為 MVP 示範站。真實應用場景下，可改為直接開啟通路官方 APP，
            由 APP 觸發自動攝影與生成流程。
          </p>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h3 className="font-semibold text-white">模式差異</h3>
            <p className="mt-2">
              掃碼模式：參加者先在手機端輸入 Email，取得 QR Code，再由展示端掃碼啟動拍照。
            </p>
            <p className="mt-2">
              簡易模式：完全省略掃碼與 APP 觸發機制，直接在展示端輸入 Email，
              方便快速感受圖像合成效果。
            </p>
          </div>

          <p>
            本 MVP 使用 IP 為{' '}
            <a
              href="https://neobabylon.icareu.tw/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-blue-200 underline underline-offset-4 hover:text-blue-100"
            >
              新巴比倫
            </a>
            ，實際應用可建立多重 IP 及場景，依活動、通路或品牌需求切換。
          </p>
        </div>
      </div>
    </div>
  );
}
