import React from 'react';

interface LogoProps {
  className?: string;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({ className = '', onClick }) => {
  return (
    <div 
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`relative flex items-center select-none ${onClick ? 'cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg' : ''} ${className}`}
      title="Kaamzo"
      aria-label={onClick ? "Return to home" : undefined}
    >
      <div 
        className="flex items-end font-black tracking-tighter"
        style={{ 
          fontSize: '32px', 
          lineHeight: '0.8',
          color: '#FCD34D',
          WebkitTextStroke: '0.75px #000',
          fontFamily: '"Arial Black", Impact, sans-serif'
        }}
      >
        <span>K</span>
        <div className="relative flex flex-col items-center justify-end">
          {/* Custom HardHat positioned over the first 'a' */}
          <div className="absolute -top-[16px] left-[50%] -translate-x-1/2 z-10 w-[24px] h-[24px]">
            <svg viewBox="0 0 24 24" fill="#FCD34D" stroke="#000" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v2z" />
              <path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5" />
              <path d="M4 15v-3a6 6 0 0 1 6-6h0" />
              <path d="M14 6h0a6 6 0 0 1 6 6v3" />
            </svg>
          </div>
          <span className="relative z-0">a</span>
        </div>
        <span>amzo</span>
      </div>
    </div>
  );
};
