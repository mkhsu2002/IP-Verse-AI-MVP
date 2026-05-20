import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-animated">
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

      <div className="relative z-10 text-center space-y-8 max-w-2xl mx-auto">
        {/* Logo / Title */}
        <div className="space-y-4">
          <div className="text-6xl mb-4">✨</div>
          <h1 className="text-5xl md:text-6xl font-bold font-[family-name:var(--font-outfit)] bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            IP Verse AI
          </h1>
          <p className="text-xl text-white/60">互動式 AI 合照體驗</p>
        </div>

        {/* Description */}
        <p className="text-white/40 text-lg leading-relaxed max-w-md mx-auto">
          與虛擬 IP 角色一起拍攝 AI 合照
          <br />
          選擇你喜歡的場景，AI 為你創作獨一無二的合照
        </p>

        {/* Navigation cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
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
        <div className="text-white/20 text-xs mt-16 space-y-1">
          <p>IP Verse AI MVP — Demo Version</p>
          <p>© 2026 FlyPig AI -艾可開發股份有限公司. All rights reserved.</p>
        </div>
      </div>
    </main>
  );
}
