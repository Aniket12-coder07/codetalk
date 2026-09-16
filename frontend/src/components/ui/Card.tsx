import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  tabColor?: 'green' | 'orange' | 'red' | 'yellow' | 'gray' | 'purple' | 'blue';
  tabLabel?: string;
  tabIcon?: React.ReactNode;
  borderColor?: string;
  children: React.ReactNode;
}

const tabColorMap = {
  green: 'bg-neo-green text-black',
  orange: 'bg-neo-orange text-black',
  red: 'bg-neo-red text-white',
  yellow: 'bg-neo-yellow text-black',
  gray: 'bg-neo-gray text-black',
  purple: 'bg-neo-purple text-white',
  blue: 'bg-neo-blue text-white',
};

export const Card: React.FC<CardProps> = ({
  tabColor = 'gray',
  tabLabel,
  tabIcon,
  borderColor = 'border-black',
  className = '',
  children,
  ...props
}) => {
  return (
    <div
      className={`relative bg-cream-50 border-4 ${borderColor} rounded-[20px] shadow-neo p-5 pt-7 transition-all ${className}`}
      {...props}
    >
      {/* Category colored tab peeking out from top-left */}
      {tabLabel && (
        <div className="absolute -top-4 left-6 z-10">
          <div
            className={`inline-flex items-center gap-1.5 px-3.5 py-1 border-3 border-black rounded-lg text-xs font-black uppercase tracking-wider shadow-neo-sm ${tabColorMap[tabColor]}`}
          >
            {tabIcon && <span className="text-sm leading-none">{tabIcon}</span>}
            <span>{tabLabel}</span>
          </div>
        </div>
      )}

      {children}
    </div>
  );
};
