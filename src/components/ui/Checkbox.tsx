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
      {/* Use native checkbox with custom styling via CSS */}
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        required={required}
        className="
          mt-1 flex-shrink-0
          w-5 h-5 cursor-pointer
          appearance-none rounded-md border-2
          border-white/30 bg-white/5
          checked:bg-gradient-to-r checked:from-blue-500 checked:to-purple-600
          checked:border-transparent
          hover:border-white/50
          transition-all duration-200
          relative
          after:content-['✓']
          after:absolute after:inset-0
          after:flex after:items-center after:justify-center
          after:text-white after:text-xs after:font-bold
          after:opacity-0
          checked:after:opacity-100
        "
      />
      <span className="text-sm text-white/70 leading-relaxed group-hover:text-white/90 transition-colors">
        {label}
        {required && <span className="text-pink-400 ml-1">*</span>}
      </span>
    </label>
  );
}
