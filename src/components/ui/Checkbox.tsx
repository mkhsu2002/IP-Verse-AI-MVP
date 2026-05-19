'use client';

import React from 'react';

interface CheckboxProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  required?: boolean;
}

export default function Checkbox({
  id,
  checked,
  onChange,
  label,
  required = false,
}: CheckboxProps) {
  return (
    <label
      htmlFor={id}
      className="flex items-start gap-3 cursor-pointer select-none group"
    >
      <div className="relative flex-shrink-0 mt-0.5">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          required={required}
          className="sr-only"
        />
        <div
          className={`
            w-5 h-5 rounded-md border-2 transition-all duration-200 flex items-center justify-center
            ${
              checked
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 border-transparent'
                : 'border-white/30 bg-white/5 group-hover:border-white/50'
            }
          `}
        >
          {checked && (
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>
      </div>
      <span className="text-sm text-white/70 leading-relaxed group-hover:text-white/90 transition-colors">
        {label}
        {required && <span className="text-pink-400 ml-1">*</span>}
      </span>
    </label>
  );
}
