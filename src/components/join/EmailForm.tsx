'use client';

import React, { useState } from 'react';
import Input from '@/components/ui/Input';
import Checkbox from '@/components/ui/Checkbox';
import Button from '@/components/ui/Button';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        id="email"
        type="email"
        value={email}
        onChange={(value) => {
          setEmail(value);
          if (emailError) setEmailError('');
        }}
        placeholder="your@email.com"
        label="Email 地址"
        error={emailError}
        required
      />

      <Checkbox
        id="consent"
        checked={consent}
        onChange={setConsent}
        label="我同意拍攝照片並授權 AI 生成合照圖片，且了解此為體驗活動。"
        required
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={loading}
        disabled={!consent || !email.trim()}
        className="w-full"
      >
        開始體驗 ✨
      </Button>
    </form>
  );
}
