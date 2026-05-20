'use client';

import React, { useState } from 'react';

interface EmailFormProps {
  onSubmit: (email: string) => void;
  loading: boolean;
}

export default function EmailForm({ onSubmit, loading }: EmailFormProps) {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [emailError, setEmailError] = useState('');

  const validateEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const doSubmit = () => {
    if (!email.trim()) {
      setEmailError('請輸入 Email 地址');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('請輸入有效的 Email 地址');
      return;
    }

    if (!consent) {
      return;
    }

    setEmailError('');
    onSubmit(email.trim());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doSubmit();
  };

  const canSubmit = consent && email.trim().length > 0 && !loading;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email input */}
      <div className="space-y-1.5">
        <label htmlFor="email-input" className="block text-sm font-medium text-white/70">
          Email 地址 <span className="text-pink-400">*</span>
        </label>
        <input
          id="email-input"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (emailError) setEmailError('');
          }}
          placeholder="your@email.com"
          required
          className="
            w-full px-4 py-3 rounded-xl
            bg-white/5 backdrop-blur-sm
            border border-white/10 transition-all duration-200
            text-white placeholder-white/30
            focus:outline-none focus:ring-2 focus:border-blue-400/50 focus:ring-blue-400/20
            hover:border-white/20
          "
        />
        {emailError && (
          <p className="text-sm text-red-400">{emailError}</p>
        )}
      </div>

      {/* Consent checkbox - using native HTML */}
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id="consent-check"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1 w-5 h-5 flex-shrink-0 accent-purple-500 cursor-pointer"
        />
        <label htmlFor="consent-check" className="text-sm text-white/70 leading-relaxed cursor-pointer">
          我同意拍攝照片並授權 AI 生成合照圖片，且了解此為體驗活動。
          <span className="text-pink-400 ml-1">*</span>
        </label>
      </div>

      {/* Submit button */}
      <button
        type="button"
        onClick={doSubmit}
        disabled={!canSubmit}
        className={`
          w-full px-8 py-4 text-lg font-medium rounded-xl
          transition-all duration-200 cursor-pointer
          flex items-center justify-center gap-2
          ${canSubmit
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:from-blue-600 hover:to-purple-700 hover:shadow-xl active:scale-[0.98]'
            : 'bg-white/10 text-white/30 cursor-not-allowed'
          }
        `}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            處理中...
          </>
        ) : (
          '開始體驗 ✨'
        )}
      </button>
    </form>
  );
}
