'use client';

import React from 'react';

interface InputProps {
  id: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

export default function Input({
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  label,
  error,
  required = false,
  className = '',
}: InputProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-white/70"
        >
          {label}
          {required && <span className="text-pink-400 ml-1">*</span>}
        </label>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className={`
          w-full px-4 py-3 rounded-xl
          bg-white/5 backdrop-blur-sm
          border transition-all duration-200
          text-white placeholder-white/30
          focus:outline-none focus:ring-2
          ${
            error
              ? 'border-red-400/50 focus:border-red-400 focus:ring-red-400/20'
              : 'border-white/10 focus:border-blue-400/50 focus:ring-blue-400/20 hover:border-white/20'
          }
        `}
      />
      {error && (
        <p className="text-sm text-red-400 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
