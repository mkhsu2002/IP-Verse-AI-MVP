# IP-Verse-AI-MVP

> **IP 互動式 AI 合照體驗 — v0.1**

使用者輸入 Email 取得一次性 QR Code，展示端掃描後倒數拍照，系統透過 OpenAI 圖像生成合照，將成品顯示在 kiosk 並寄送到使用者信箱。

## Demo 流程

```text
手機 /join                         展示端 /kiosk
──────────────                      ──────────────
1. 輸入 Email                       4. 攝影機掃描 QR Code
2. 勾選同意                         5. 倒數 3-2-1 拍照
3. 顯示 QR Code ─── 對準鏡頭 ────→ 6. 生成 AI 合照
                                     7. 全螢幕顯示結果
                                     8. Email 寄送合照
```

後台 `/admin` 可用 `ADMIN_TOKEN` 切換啟動模式：

- `qr_scan`：使用者手機取得 QR Code，展示端掃碼後拍照。
- `email_button`：展示端直接輸入 Email 後拍照。

## 技術棧

| 層級 | 技術 |
| --- | --- |
| 框架 | Next.js 16 App Router |
| 語言 | TypeScript |
| UI | React 19 + Tailwind CSS 4 |
| 部署 | OpenNext Cloudflare / Workers |
| QR 產生 | `qrcode` |
| QR 掃描 | `@zxing/browser` + `@zxing/library` |
| 攝影機 | `react-webcam` |
| AI 圖像生成 | OpenAI Images API (`gpt-image-2`) |
| 寄信 | Resend |
| Session / 設定 | Cloudflare KV，開發時 fallback 到 in-memory |
| 作品儲存 | Cloudflare R2，開發時 fallback 到 in-memory |

## 專案結構

```text
ip-verse-ai-mvp/
├── public/
│   ├── ip-characters/default-mascot.png  # 合成流程使用的虛擬偶像素材
│   ├── ipverse-hero.jpg                  # 首頁背景參考圖
│   └── og-image.jpg                      # 1200x630 Open Graph 圖
├── src/
│   ├── app/
│   │   ├── page.tsx                      # 首頁
│   │   ├── join/page.tsx                 # 手機端：Email + QR Code
│   │   ├── kiosk/page.tsx                # 展示端：掃描 + 拍照 + 生成
│   │   ├── admin/page.tsx                # 活動後台
│   │   └── api/
│   │       ├── session/create/route.ts
│   │       ├── session/verify/route.ts
│   │       ├── generate/route.ts
│   │       ├── artifacts/[...key]/route.ts
│   │       ├── settings/route.ts
│   │       └── admin/
│   ├── components/
│   ├── hooks/useKioskStateMachine.ts
│   ├── lib/
│   │   ├── session-store.ts              # KV/R2 + in-memory fallback
│   │   ├── openai-generate.ts
│   │   ├── email-sender.ts
│   │   └── scenes.ts
│   └── types/
├── wrangler.jsonc
├── open-next.config.ts
└── package.json
```

## 本機啟動

前置需求：

- Node.js 20 或更新版本
- npm
- Chrome 瀏覽器，並允許攝影機權限

```bash
npm ci
cp .env.example .env.local
npm run dev
```

主要頁面：

| 頁面 | 網址 | 用途 |
| --- | --- | --- |
| 首頁 | `http://localhost:3000` | 角色預覽與入口 |
| 手機端 | `http://localhost:3000/join` | Email + QR Code |
| 展示端 | `http://localhost:3000/kiosk` | 掃描 + 拍照 + 生成 |
| 後台 | `http://localhost:3000/admin` | 活動設定與參與名單 |

無 API Key 時：

- 未設定 `OPENAI_API_KEY`：回傳 mock 圖片。
- 未設定 `RESEND_API_KEY`：略過寄信並在 session 中記錄失敗原因。

## 環境變數

| 變數 | 必要 | 說明 |
| --- | --- | --- |
| `OPENAI_API_KEY` | 生成用 | OpenAI API Key |
| `RESEND_API_KEY` | 寄信用 | Resend API Key |
| `RESEND_FROM_EMAIL` | 寄信用 | 寄件人 Email，正式寄送需驗證網域 |
| `NEXT_PUBLIC_BASE_URL` | 建議 | 應用程式正式網址，用於 metadata / OG URL |
| `SESSION_TTL_MINUTES` | 選用 | Session 有效期，預設 30 分鐘 |
| `ADMIN_TOKEN` | 後台必填 | `/admin` API 驗證 token |

## Cloudflare 部署

此專案使用 `@opennextjs/cloudflare`，不是舊版 `next-on-pages`。

```bash
npm run preview
npm run deploy
```

部署前確認：

- `wrangler.jsonc` 的 KV binding `IP_VERSE_DATA` 已存在。
- `wrangler.jsonc` 的 R2 bucket `IP_VERSE_ARTIFACTS` 已存在。
- OpenNext incremental cache bucket 已建立。
- Cloudflare secret 已設定 `OPENAI_API_KEY`、`RESEND_API_KEY`、`RESEND_FROM_EMAIL`、`ADMIN_TOKEN`。
- 前端使用流程與正式環境 API / KV / R2 binding 一致。

## v0.1 更新

- 首頁改用目前虛擬偶像 IP 參考圖作為 UI 背景，讓使用者先看到合照對象。
- 首頁顯示目前啟動模式，簡易模式會封印參加者入口，並提供操作指南彈窗。
- 生成結果頁新增圖片下載、系統分享與 LINE 分享按鈕。
- 新增 `public/og-image.jpg`，尺寸為 1200x630，並設定 Open Graph / Twitter metadata。
- 所有 UI 頁面統一顯示版權宣告：
  `© 2026 FlyPig AI - 艾可開發股份有限公司. All rights reserved.`
- README 更新為目前 Next.js 16 + OpenNext Cloudflare + KV/R2 架構。

## 後續建議

- 高優先：將圖像生成改為背景 job，讓瀏覽器可在拍照上傳完成後關閉。

  目前 `/api/generate` 的 OpenAI 生成、R2 儲存與 Email 寄送都綁在前端 `fetch` request 上；如果 kiosk / 手機瀏覽器在生成期間關閉、休眠、網路切換或 request 被中斷，生成流程可能失敗。下一個 IDE 接手時，請優先把流程改成「拍照資料上傳完成並建立 job 後，前端即可顯示已開始生成，使用者可關閉畫面；後端自行完成生成、存圖與寄信」。

  建議目標流程：

  ```text
  Kiosk 完成拍照
    → 上傳合成圖 / 遮罩 / 原始自拍到 R2
    → 建立 generation job，session 標記為 processing
    → API 立即回傳：已開始生成，可關閉畫面
    → 背景 Worker / Queue / Workflow 呼叫 OpenAI
    → 成品存 R2
    → Email 自動寄給拍照者
    → session 更新為 completed 或 failed
  ```

  MVP 快速版可先用 Cloudflare `waitUntil` 或等效背景任務：`/api/generate` 收到照片後先存 R2、寫入 `processing`，立即回前端，再背景呼叫 OpenAI、存成品、寄信。此版本改動較小，但長任務可靠性與重試能力有限。

  正式版建議改用 Cloudflare Queues 或 Workflows：API 只建立 job；Queue/Workflow 負責生成、重試、失敗紀錄、補寄 Email 與狀態同步。session 狀態建議擴充為 `pending → active → processing → completed / failed`，並在 admin 顯示 job 狀態、錯誤原因與補寄操作。

  驗收條件：

  - 拍照資料完成上傳並建立 job 後，關閉瀏覽器不影響後續生成。
  - 作品完成後自動 Email 到參加者信箱。
  - OpenAI / R2 / Resend 任一步失敗時，session 必須記錄 `failed` 與可讀錯誤原因。
  - 同一 session 重複送出不得重複扣成本或重複寄信，需具備冪等保護。
  - admin 可看到 `processing`、`completed`、`failed` 狀態。

- 加入公開 API rate limiting 與圖片 payload size guard。
- 將 session 狀態改成 `pending → active → processing → completed/failed`，避免重複生成。
- 將 R2 作品保留天數改成實際 lifecycle rule 或排程清理。
- 加入 Playwright 現場流程測試。
- 將 kiosk Canvas 合成座標抽成版本化設定。

## 法律提醒

正式商用前必須補上：

1. 隱私權政策
2. 肖像授權條款
3. IP 授權合約
4. 資料保存與刪除政策
5. 使用者同意書
6. 未成年人保護條款

## License

MIT — 僅供技術 Demo 使用。商用前請確保所有素材與角色皆已取得合法授權。
