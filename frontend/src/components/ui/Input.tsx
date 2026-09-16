import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ icon, className = '', ...props }) => {
  return (
    <div className="relative flex items-center w-full">
      {icon && (
        <div className="absolute left-3.5 text-black pointer-events-none">
          {icon}
        </div>
      )}
      <input
        className={`w-full bg-cream-50 border-3 border-black rounded-[16px] shadow-neo-sm py-2.5 text-sm font-bold text-black placeholder-gray-500 focus:outline-none focus:bg-white focus:shadow-neo transition-all ${
          icon ? 'pl-10 pr-4' : 'px-4'
        } ${className}`}
        {...props}
      />
    </div>
  );
};
