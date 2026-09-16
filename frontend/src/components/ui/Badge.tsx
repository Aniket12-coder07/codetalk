import React from 'react';

export interface BadgeProps {
  color?: 'green' | 'orange' | 'red' | 'yellow' | 'gray' | 'purple' | 'blue';
  children: React.ReactNode;
  className?: string;
}

const badgeColorMap = {
  green: 'bg-neo-green text-black',
  orange: 'bg-neo-orange text-black',
  red: 'bg-neo-red text-white',
  yellow: 'bg-neo-yellow text-black',
  gray: 'bg-cream-200 text-black dark:bg-zinc-800 dark:text-zinc-200',
  purple: 'bg-neo-purple text-white',
  blue: 'bg-neo-blue text-white',
};

export const Badge: React.FC<BadgeProps> = ({
  color = 'gray',
  children,
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 border-2 border-black dark:border-white/80 rounded-lg text-xs font-black tracking-wide shadow-neo-sm ${badgeColorMap[color]} ${className}`}
    >
      {children}
    </span>
  );
};
