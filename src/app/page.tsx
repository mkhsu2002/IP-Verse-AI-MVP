import Link from 'next/link';
import CopyrightNotice from '@/components/CopyrightNotice';

export default function HomePage() {
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
          <h1 className="text-5xl md:text-6xl font-bold font-[family-name:var(--font-outfit)] bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            IP Verse AI
          </h1>
          <p className="text-xl text-white/75">互動式 AI 合照體驗</p>
        </div>

        {/* Description */}
        <p className="max-w-md text-lg leading-relaxed text-white/65">
          與畫面中的虛擬偶像角色一起拍攝 AI 合照
          <br />
          掃描 QR Code、拍下照片，系統會生成活動專屬合影並寄送到信箱
        </p>

        {/* Navigation cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Join - Mobile */}
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
              Mac / Chrome 大螢幕展示端，掃描 QR Code 開始拍照
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
    </main>
  );
}
