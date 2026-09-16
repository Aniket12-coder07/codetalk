import React from 'react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  tooltip?: string;
  active?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  tooltip,
  active = false,
  className = '',
  ...props
}) => {
  return (
    <button
      title={tooltip}
      className={`inline-flex items-center justify-center w-10 h-10 border-3 border-black dark:border-white/80 rounded-[14px] select-none neo-pressable focus:outline-none transition-all ${
        active
          ? 'bg-neo-yellow text-black shadow-none translate-x-[2px] translate-y-[2px]'
          : 'bg-cream-50 dark:bg-zinc-800 text-black dark:text-white hover:bg-white dark:hover:bg-zinc-700 shadow-neo-sm'
      } ${className}`}
      {...props}
    >
      {icon}
    </button>
  );
};
