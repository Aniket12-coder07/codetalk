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
      className={`inline-flex items-center justify-center w-10 h-10 border-3 border-black rounded-[14px] select-none neo-pressable focus:outline-none transition-all ${
        active
          ? 'bg-neo-yellow text-black shadow-none translate-x-[2px] translate-y-[2px]'
          : 'bg-cream-50 text-black hover:bg-white shadow-neo-sm'
      } ${className}`}
      {...props}
    >
      {icon}
    </button>
  );
};
