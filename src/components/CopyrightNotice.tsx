interface CopyrightNoticeProps {
  className?: string;
}

export default function CopyrightNotice({
  className = '',
}: CopyrightNoticeProps) {
  return (
    <p className={`text-xs text-white/45 ${className}`}>
      © 2026 FlyPig AI - 艾可開發股份有限公司. All rights reserved.
    </p>
  );
}
