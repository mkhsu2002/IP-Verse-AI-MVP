# IP-Verse-AI-MVP

> **IP 互動式 AI 合照體驗 — MVP**

使用者用手機輸入 Email → 取得一次性 QR Code → Mac/Chrome 展示端掃描 QR Code → 倒數拍照 → OpenAI **GPT-Image-2** 生成合照 → 顯示結果 → 寄送 Email。

---

## 🎬 Demo 流程

```
📱 手機 /join                        🖥️ Mac /kiosk
──────────────                      ──────────────
1. 輸入 Email                       4. 攝影機掃描 QR Code
2. 勾選同意                          5. 倒數 3-2-1 拍照 📸
3. 顯示 QR Code ─── 對準 Mac 鏡頭 ──→ 6. AI 生成合照 🎨
                                    7. 全螢幕顯示結果
                                    8. Email 寄送合照 ✉️
                                    9. 自動 Reset
```

---

## 🚀 技術棧

| 層級 | 技術 |
|------|------|
| 框架 | Next.js 15 (App Router) |
| 語言 | TypeScript |
| UI | React 19 + Tailwind CSS 4 |
| QR 產生 | `qrcode` |
| QR 掃描 | `@zxing/browser` + `@zxing/library` |
| 攝影機 | `react-webcam` |
| AI 圖像生成 | OpenAI **GPT-Image-2** (`gpt-image-2`) |
| 寄信 | `resend` |
| Session | 本機 JSON 檔（MVP） |

---

## 📁 專案結構

```
ip-verse-ai-mvp/
├── public/
│   ├── generated/               # AI 生成圖片暫存
│   └── ip-characters/           # 虛擬 IP 角色圖
│       └── default-mascot.png
├── src/
│   ├── app/
│   │   ├── layout.tsx           # 全站 layout（Inter + Outfit 字型）
│   │   ├── page.tsx             # 首頁導引
│   │   ├── join/page.tsx        # 📱 手機端：Email + QR Code
│   │   ├── kiosk/page.tsx       # 🖥️ 展示端：掃描 + 拍照 + 生成
│   │   └── api/
│   │       ├── session/create/  # POST: 建立 session
│   │       ├── session/verify/  # POST: 驗證 session
│   │       └── generate/        # POST: AI 生成合照 + 寄信
│   ├── components/
│   │   ├── ui/                  # Button, Card, Checkbox, Input, LoadingSpinner
│   │   ├── join/                # EmailForm, QrCodeDisplay
│   │   └── kiosk/               # QrScanner, CameraCapture, GeneratingView, ResultDisplay
│   ├── hooks/
│   │   └── useKioskStateMachine.ts  # 10 狀態有限狀態機
│   ├── lib/
│   │   ├── constants.ts         # 全域常數
│   │   ├── scenes.ts            # 5 個場景模板
│   │   ├── session-store.ts     # JSON 檔 session 儲存
│   │   ├── openai-generate.ts   # GPT-Image-2 封裝
│   │   └── email-sender.ts     # Resend 寄信封裝
│   └── types/index.ts           # TypeScript 型別定義
├── data/sessions.json           # MVP session 資料
├── .env.example                 # 環境變數範例
└── README.md
```

---

## 🔧 本機啟動

### 前置需求

- Node.js >= 18
- npm
- Chrome 瀏覽器（攝影機權限）

### 步驟

```bash
# 1. Clone 專案
git clone https://github.com/YOUR_USERNAME/IP-Verse-AI-MVP.git
cd IP-Verse-AI-MVP

# 2. 安裝依賴
npm install

# 3. 設定環境變數
cp .env.example .env.local

# 4. 編輯 .env.local，填入 API keys
#    OPENAI_API_KEY=sk-xxx
#    RESEND_API_KEY=re_xxx
#    RESEND_FROM_EMAIL=IP Verse AI <noreply@yourdomain.com>

# 5. 啟動
npm run dev
```

### 💡 無 API Key 也能測試

- 未設定 `OPENAI_API_KEY` → 回傳 mock 圖片
- 未設定 `RESEND_API_KEY` → 跳過寄信

### 頁面

| 頁面 | 網址 | 用途 |
|------|------|------|
| 首頁 | `http://localhost:3000` | 導引頁 |
| 手機端 | `http://localhost:3000/join` | Email + QR Code |
| 展示端 | `http://localhost:3000/kiosk` | 掃描 + 拍照 + 生成 |

---

## 📱 手機 + Mac 同 Wi-Fi 測試

```bash
# 查看 Mac 區網 IP
ifconfig | grep "inet " | grep -v 127.0.0.1

# Mac Chrome 開啟展示端
open http://localhost:3000/kiosk

# 手機瀏覽器開啟（替換 MAC_IP）
# http://{MAC_IP}:3000/join
```

---

## 🔄 Kiosk 狀態機

```
IDLE → SCANNING → VERIFYING → COUNTDOWN → CAPTURING → GENERATING → RESULT → COMPLETE → IDLE
                      ↓                                    ↓
                    ERROR ───────────────────────────→ IDLE (自動 reset)
```

- 拍照後攝影機自動關閉
- 錯誤狀態 5 秒後自動 reset
- 完成狀態 10 秒後自動 reset
- 開發模式右下角顯示當前狀態

---

## 🎬 場景模板

| # | 場景 | 風格 |
|---|------|------|
| 1 | 🌙 月光便利店 | 日式溫馨夜晚 |
| 2 | 🌸 櫻花學校季 | 明亮粉色校園 |
| 3 | 🎆 夏日煙火祭 | 熱鬧祭典夜色 |
| 4 | 🤖 未來科技店 | 賽博龐克霓虹 |
| 5 | ☕ 冬日暖心咖啡店 | 溫暖金色調 |

場景隨機選取，可在 `src/lib/scenes.ts` 新增或修改。

---

## 🔑 環境變數

| 變數 | 必要 | 說明 |
|------|------|------|
| `OPENAI_API_KEY` | 生成用 | OpenAI API Key |
| `RESEND_API_KEY` | 寄信用 | Resend API Key |
| `RESEND_FROM_EMAIL` | 寄信用 | 寄件人 Email（需驗證網域） |
| `NEXT_PUBLIC_BASE_URL` | 選用 | 應用程式基礎 URL |
| `SESSION_TTL_MINUTES` | 選用 | Session 有效期，預設 30 分鐘 |

---

## ☁️ Cloudflare Pages 部署

1. GitHub push → Cloudflare Pages 連接 repo
2. Framework preset: `Next.js`
3. Build command: `npx @cloudflare/next-on-pages`
4. Build output: `.vercel/output/static`
5. 設定環境變數

> ⚠️ **正式部署注意**：
>
> | MVP（本機） | 正式部署 |
> |-------------|----------|
> | `data/sessions.json` | Cloudflare D1 / KV |
> | `public/generated/` | Cloudflare R2 |
> | 本機 fs 讀寫 | Edge-compatible API |

---

## ⚠️ 法律提醒

正式商用前必須補上：

1. 隱私權政策（Privacy Policy）
2. 肖像授權條款
3. IP 授權合約
4. 資料保存與刪除政策（GDPR / 個資法）
5. 使用者同意書（法律審核版）
6. 未成年人保護條款

---

## 📋 後續建議

- [ ] WebSocket 即時狀態同步（手機看到 kiosk 進度）
- [ ] 支援多 IP 角色選擇
- [ ] 社群分享（IG Story / LINE）
- [ ] 多語系 i18n
- [ ] Admin Dashboard
- [ ] Rate Limiting
- [ ] CDN 圖片快取
- [ ] 正式部署改用 R2 + D1

---

## 📜 License

MIT — 僅供技術 Demo 使用。商用前請確保所有素材與角色皆已取得合法授權。
