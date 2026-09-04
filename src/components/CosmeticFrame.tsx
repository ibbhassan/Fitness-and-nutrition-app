import React from 'react';
import clsx from 'clsx';
import { getCosmeticItem } from '../utils/cosmeticsRegistry';

interface CosmeticFrameProps {
  borderId?: string;
  avatarUrl: string;
  sizeClassName?: string;
  alt?: string;
  className?: string;
}

export const CosmeticFrame: React.FC<CosmeticFrameProps> = ({
  borderId,
  avatarUrl,
  sizeClassName = 'w-20 h-20',
  alt = 'Avatar',
  className
}) => {
  const borderItem = getCosmeticItem(borderId) || getCosmeticItem('border_default');

  return (
    <div className={clsx("relative flex items-center justify-center shrink-0 group", sizeClassName, className)}>
      {/* Base Avatar Circle with High-End CSS Border & Glow */}
      <div className={clsx(
        "w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-tactical-900 relative z-10 transition-all duration-300",
        borderItem?.cssClass || 'border-2 border-neon-blue shadow-[0_0_15px_rgba(0,240,255,0.4)]'
      )}>
        <img src={avatarUrl} alt={alt} className="w-full h-full object-cover scale-105" />
      </div>
    </div>
  );
};

