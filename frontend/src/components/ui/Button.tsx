import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-bold tracking-wide border-4 border-black dark:border-white text-black select-none neo-pressable focus:outline-none';

  const variantStyles = {
    primary: 'bg-neo-yellow text-black hover:bg-yellow-400 shadow-neo dark:shadow-[4px_4px_0px_0px_#000000]',
    secondary: 'bg-cream-50 dark:bg-zinc-800 text-black dark:text-white hover:bg-white dark:hover:bg-zinc-700 shadow-neo dark:shadow-[4px_4px_0px_0px_#000000]',
    success: 'bg-neo-green text-black hover:bg-green-500 shadow-neo dark:shadow-[4px_4px_0px_0px_#000000]',
    warning: 'bg-neo-orange text-black hover:bg-orange-500 shadow-neo dark:shadow-[4px_4px_0px_0px_#000000]',
    danger: 'bg-neo-red text-white hover:bg-red-500 shadow-neo dark:shadow-[4px_4px_0px_0px_#000000]',
    ghost: 'bg-transparent text-black dark:text-white border-3 hover:bg-black/5 dark:hover:bg-white/10 shadow-neo-sm',
    icon: 'bg-cream-50 dark:bg-zinc-800 text-black dark:text-white hover:bg-white dark:hover:bg-zinc-700 shadow-neo p-2.5 aspect-square',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs rounded-xl border-3 shadow-neo-sm',
    md: 'px-5 py-2.5 text-sm rounded-[16px] shadow-neo',
    lg: 'px-7 py-3.5 text-base rounded-[18px] shadow-neo-lg font-black',
    icon: 'w-11 h-11 rounded-[14px] border-3 shadow-neo-sm',
  };

  const disabledStyles = props.disabled
    ? 'opacity-50 cursor-not-allowed transform-none hover:transform-none hover:shadow-neo active:transform-none'
    : 'cursor-pointer';

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
