'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { ActivitySettings, SessionStatus, StartMode } from '@/types';

interface ParticipantRow {
  id: string;
  email: string;
  status: SessionStatus;
  startMode: StartMode;
  createdAt: string;
  expiresAt: string;
  completedAt?: string;
  scene?: string;
  generatedImageUrl?: string;
  emailSent?: boolean;
  emailError?: string;
}

export default function AdminPage() {
  const [token, setToken] = useState('');
  const [savedToken, setSavedToken] = useState('');
  const [settings, setSettings] = useState<ActivitySettings | null>(null);
  const [participants, setParticipants] = useState<ParticipantRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${savedToken}`,
    }),
    [savedToken]
  );

  const loadAdminData = useCallback(
    async (activeToken = savedToken) => {
      if (!activeToken) return;

      setLoading(true);
      setError(null);
      try {
        const headers = { Authorization: `Bearer ${activeToken}` };
        const [settingsRes, participantsRes] = await Promise.all([
          fetch('/api/admin/settings', { headers, cache: 'no-store' }),
          fetch('/api/admin/participants', { headers, cache: 'no-store' }),
        ]);

        if (!settingsRes.ok || !participantsRes.ok) {
          setError('後台 token 無效或 API 無法讀取');
          return;
        }

        const settingsData = (await settingsRes.json()) as {
          success?: boolean;
          settings?: ActivitySettings;
        };
        const participantsData = (await participantsRes.json()) as {
          success?: boolean;
          participants?: ParticipantRow[];
        };

        if (settingsData.success && settingsData.settings) {
          setSettings(settingsData.settings);
        }
        if (participantsData.success && participantsData.participants) {
          setParticipants(participantsData.participants);
        }
      } catch {
        setError('後台資料讀取失敗');
      } finally {
        setLoading(false);
      }
    },
    [savedToken]
  );

  useEffect(() => {
    const existingToken = window.sessionStorage.getItem('ip-verse-admin-token');
    if (existingToken) {
      queueMicrotask(() => {
        setToken(existingToken);
        setSavedToken(existingToken);
        loadAdminData(existingToken);
      });
    }
  }, [loadAdminData]);

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedToken = token.trim();
    if (!trimmedToken) return;

    window.sessionStorage.setItem('ip-verse-admin-token', trimmedToken);
    setSavedToken(trimmedToken);
    loadAdminData(trimmedToken);
  };

  const updateStartMode = async (startMode: StartMode) => {
    setError(null);
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ startMode }),
    });

    const data = (await res.json()) as {
      success?: boolean;
      settings?: ActivitySettings;
      error?: string;
    };

    if (!res.ok || !data.success || !data.settings) {
      setError(data.error || '設定更新失敗');
      return;
    }

    setSettings(data.settings);
  };

  return (
    <main className="min-h-screen bg-[#0a0614] px-6 py-8 text-white">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col gap-3 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm text-white/40">IP Verse AI</p>
            <h1 className="text-3xl font-bold">活動後台</h1>
          </div>
          <button
            type="button"
            onClick={() => loadAdminData()}
            disabled={!savedToken || loading}
            className="w-fit rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            重新整理
          </button>
        </header>

        <form
          onSubmit={handleLogin}
          className="grid gap-3 rounded-xl border border-white/10 bg-white/5 p-4 md:grid-cols-[1fr_auto]"
        >
          <input
            type="password"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            placeholder="輸入後台 token"
            className="rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-white placeholder-white/30 outline-none focus:border-blue-400/50"
          />
          <button
            type="submit"
            className="rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white transition hover:bg-blue-600"
          >
            進入後台
          </button>
        </form>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">啟動方式</h2>
            <p className="text-sm text-white/40">
              切換後，展示端重新整理即可使用新的流程。
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <button
              type="button"
              onClick={() => updateStartMode('qr_scan')}
              disabled={!savedToken || settings?.startMode === 'qr_scan'}
              className={`rounded-xl border p-5 text-left transition ${
                settings?.startMode === 'qr_scan'
                  ? 'border-blue-400 bg-blue-500/20'
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
            >
              <p className="text-lg font-semibold">需要掃碼啟動</p>
              <p className="mt-1 text-sm text-white/50">
                使用者手機輸入 Email，展示端掃 QR Code 後拍照。
              </p>
            </button>

            <button
              type="button"
              onClick={() => updateStartMode('email_button')}
              disabled={!savedToken || settings?.startMode === 'email_button'}
              className={`rounded-xl border p-5 text-left transition ${
                settings?.startMode === 'email_button'
                  ? 'border-purple-400 bg-purple-500/20'
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
            >
              <p className="text-lg font-semibold">Email 後直接拍照</p>
              <p className="mt-1 text-sm text-white/50">
                展示端輸入 Email 並按下開始，即可進入倒數拍照。
              </p>
            </button>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl font-semibold">參與名單</h2>
              <p className="text-sm text-white/40">
                最近 {participants.length} 筆 session。成品圖儲存在 R2，15 天後自動清除。
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-white/10">
            <table className="w-full min-w-[860px] border-collapse text-sm">
              <thead className="bg-white/10 text-left text-white/60">
                <tr>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">狀態</th>
                  <th className="px-4 py-3 font-medium">啟動方式</th>
                  <th className="px-4 py-3 font-medium">場景</th>
                  <th className="px-4 py-3 font-medium">Email 寄送</th>
                  <th className="px-4 py-3 font-medium">建立時間</th>
                  <th className="px-4 py-3 font-medium">作品</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {participants.map((participant) => (
                  <tr key={participant.id} className="bg-white/[0.02]">
                    <td className="px-4 py-3 text-white/90">{participant.email}</td>
                    <td className="px-4 py-3 text-white/70">{formatStatus(participant.status)}</td>
                    <td className="px-4 py-3 text-white/70">{formatStartMode(participant.startMode)}</td>
                    <td className="px-4 py-3 text-white/70">{participant.scene || '-'}</td>
                    <td className="px-4 py-3 text-white/70">
                      {participant.emailSent === undefined
                        ? '-'
                        : participant.emailSent
                          ? '成功'
                          : participant.emailError || '失敗'}
                    </td>
                    <td className="px-4 py-3 text-white/70">
                      {formatDate(participant.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      {participant.generatedImageUrl ? (
                        <a
                          href={participant.generatedImageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-300 underline-offset-4 hover:underline"
                        >
                          開啟
                        </a>
                      ) : (
                        <span className="text-white/30">-</span>
                      )}
                    </td>
                  </tr>
                ))}
                {participants.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-white/40">
                      尚無資料
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

function formatStatus(status: SessionStatus): string {
  const labels: Record<SessionStatus, string> = {
    pending: '等待掃碼',
    active: '拍攝中',
    completed: '已完成',
    expired: '已過期',
  };
  return labels[status];
}

function formatStartMode(startMode: StartMode): string {
  return startMode === 'qr_scan' ? '掃碼' : 'Email 按鍵';
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('zh-Hant', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}
