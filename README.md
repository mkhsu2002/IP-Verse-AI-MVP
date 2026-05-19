# IP-Verse-AI-MVP

> **IP 互動式 AI 合照體驗 — MVP**

使用者用手機輸入 Email → 取得一次性 QR Code → Mac/Chrome 展示端掃描 QR Code → 拍照 → OpenAI GPT-Image 2 生成合照 → 顯示結果 → 寄送 Email。

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
| AI 圖像生成 | `openai` (GPT-Image 2 / gpt-image-1) |
| 寄信 | `resend` |
| Session | 本機 JSON 檔（MVP） |

---

## 📁 專案結構

```
IP-Verse-AI-MVP/
├── public/
│   ├── generated/               # AI 生成圖片暫存
│   └── ip-characters/           # 虛擬 IP 角色圖
│       └── default-mascot.png
├── src/
│   ├── app/
│   │   ├── layout.tsx           # 全站 layout
│   │   ├── page.tsx             # 首頁導引
│   │   ├── join/page.tsx        # 📱 手機端頁面
│   │   ├── kiosk/page.tsx       # 🖥️ 展示端頁面
│   │   └── api/
│   │       ├── session/create/  # POST: 建立 session
│   │       ├── session/verify/  # POST: 驗證 session
│   │       └── generate/        # POST: 生成合照
│   ├── components/              # React 元件
│   ├── hooks/                   # 狀態機 Hook
│   ├── lib/                     # 工具函式
│   └── types/                   # TypeScript 型別
├── data/
│   └── sessions.json            # MVP session 儲存
├── .env.example
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
# 1. 進入專案目錄
cd ip-verse-ai-mvp

# 2. 安裝依賴
npm install

# 3. 複製環境變數範例
cp .env.example .env.local

# 4. 編輯 .env.local，填入你的 API keys
#    - OPENAI_API_KEY：OpenAI API Key（用於 GPT-Image 2）
#    - RESEND_API_KEY：Resend API Key（用於寄信）
#    - RESEND_FROM_EMAIL：寄件人 email（需在 Resend 驗證網域）

# 5. 啟動開發伺服器
npm run dev
```

> **💡 無 API Key 也能測試**：未設定 `OPENAI_API_KEY` 時，系統會回傳 mock 圖片；未設定 `RESEND_API_KEY` 時，會跳過寄信。

### 頁面

| 頁面 | 網址 | 用途 |
|------|------|------|
| 首頁 | `http://localhost:3000` | 導引頁 |
| 手機端 | `http://localhost:3000/join` | 輸入 Email + 取得 QR Code |
| 展示端 | `http://localhost:3000/kiosk` | 掃描 + 拍照 + 生成 |

---

## 📱 手機 + Mac 同 Wi-Fi 測試

在同一個 Wi-Fi 網路下，手機可以直接存取 Mac 上的開發伺服器：

```bash
# 1. 查看 Mac 區網 IP
ifconfig | grep "inet " | grep -v 127.0.0.1
# 例如：192.168.1.100

# 2. Mac 上用 Chrome 開啟展示端
open http://localhost:3000/kiosk

# 3. 手機瀏覽器開啟（替換為你的 Mac IP）
# http://192.168.1.100:3000/join

# 4. 手機輸入 Email → 取得 QR Code → 對準 Mac 攝影機
```

> **⚠️ 注意**：Next.js dev server 預設監聽所有介面，手機應可直接連線。若無法連線，請檢查防火牆設定。

---

## ☁️ GitHub + Cloudflare Pages 部署

### 1. 建立 GitHub Repository

```bash
# 在專案目錄中
git remote add origin https://github.com/YOUR_USERNAME/IP-Verse-AI-MVP.git
git branch -M main
git push -u origin main
```

### 2. Cloudflare Pages 設定

1. 登入 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 進入 **Workers & Pages** → **Create application** → **Pages**
3. 連接 GitHub，選擇 `IP-Verse-AI-MVP` repository
4. 設定建置：
   - **Framework preset**: `Next.js`
   - **Build command**: `npx @cloudflare/next-on-pages`
   - **Build output directory**: `.vercel/output/static`
5. 設定環境變數：
   - `OPENAI_API_KEY`
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL`
   - `NEXT_PUBLIC_BASE_URL`（正式網域）
   - `NODE_VERSION`: `18`

### 3. 安裝 Cloudflare Pages adapter

```bash
npm install -D @cloudflare/next-on-pages
```

> **⚠️ 重要提醒**：Cloudflare Pages 正式部署時，需做以下調整：
>
> | MVP（本機） | 正式部署 |
> |-------------|----------|
> | `data/sessions.json` | Cloudflare D1 / KV / Supabase |
> | `public/generated/` | Cloudflare R2 / Supabase Storage |
> | 本機 fs 讀寫 | Edge-compatible API |
>
> **不可依賴本機長期檔案寫入**，Cloudflare Pages Functions 為無狀態執行環境。

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

## 🎬 場景模板

| # | 場景 | 風格 |
|---|------|------|
| 1 | 月光便利店 | 日式溫馨夜晚 |
| 2 | 櫻花學校季 | 明亮粉色校園 |
| 3 | 夏日煙火祭 | 熱鬧祭典夜色 |
| 4 | 未來科技店 | 賽博龐克霓虹 |
| 5 | 冬日暖心咖啡店 | 溫暖金色調 |

---

## 🔄 Kiosk 狀態機

```
IDLE → SCANNING → VERIFYING → COUNTDOWN → CAPTURING → GENERATING → RESULT → COMPLETE → IDLE
                      ↓                                    ↓
                    ERROR ────────────────────────────→ IDLE (自動 reset)
```

- 每個狀態都有清楚的 UI 呈現
- 錯誤狀態 5 秒後自動 reset
- 完成狀態 10 秒後自動 reset
- 開發模式右下角顯示當前狀態

---

## ⚠️ 重要法律提醒

> **正式商用前必須補上：**
>
> 1. **隱私權政策**（Privacy Policy）
> 2. **肖像授權條款**（照片使用授權）
> 3. **IP 授權合約**（虛擬角色使用權）
> 4. **資料保存與刪除政策**（GDPR / 個資法合規）
> 5. **使用者同意書**（正式版需法律審核）
> 6. **未成年人保護條款**

---

## 📋 後續建議

1. 加入 WebSocket 即時狀態同步（手機可看到 kiosk 進度）
2. 支援多 IP 角色選擇
3. 加入社群分享功能（IG Story / LINE）
4. 支援多語系（i18n）
5. 加入 Admin Dashboard 管理場景與 IP 角色
6. 加入使用數據統計與分析
7. 支援短影片/動畫生成
8. 加入 Rate Limiting 保護
9. 加入 CDN 圖片快取
10. 正式部署改用 Cloudflare R2 + D1

---

## 📜 License

MIT — 僅供技術 Demo 使用。商用前請確保所有素材與角色皆已取得合法授權。
