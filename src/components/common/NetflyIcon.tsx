import React from 'react';
import Image from 'next/image';

interface NetflyIconProps {
  className?: string;
  size?: number;
  priority?: boolean;
}

export function NetflyIcon({
  className = 'w-10 h-10',
  size = 64,
  priority = false,
}: NetflyIconProps) {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
    >
      <Image
        src="/logo.png"
        alt="Netfly Cinema Logo"
        width={size}
        height={size}
        priority={priority}
        className="w-full h-full object-contain filter drop-shadow-[0_4px_16px_rgba(229,9,20,0.45)] select-none"
      />
    </div>
  );
}

export default NetflyIcon;
