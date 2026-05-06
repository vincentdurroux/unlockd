import React from 'react';
import { cn } from '../lib/utils';

interface LogoProps {
  className?: string;
  showTagline?: boolean;
}

export function Logo({ className, showTagline = false }: LogoProps) {
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="flex items-center gap-1 md:gap-3">
        {/* Left blue parenthesis */}
        <svg width="24" height="60" viewBox="0 0 24 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8 md:h-12 w-auto">
          <path d="M22 2C10 8 2 20 2 30C2 40 10 52 22 58" stroke="#00AEEF" strokeWidth="4" strokeLinecap="round" />
        </svg>

        <div className="flex items-center -mt-1 md:-mt-2">
          <span className="text-2xl md:text-4xl font-medium tracking-tight text-[#0A1629] font-display">
            unlock
          </span>
          <div className="relative mx-0.5 md:mx-1">
            {/* Sparkle star */}
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 md:w-6 md:h-6">
              <path d="M10 0L12.5 7.5L20 10L12.5 12.5L10 20L7.5 12.5L0 10L7.5 7.5L10 0Z" fill="#FBB03B" />
            </svg>
          </div>
          <span className="text-2xl md:text-4xl font-medium tracking-tight text-[#0A1629] font-display">
            d
          </span>
        </div>

        {/* Right yellow parenthesis */}
        <svg width="24" height="60" viewBox="0 0 24 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8 md:h-12 w-auto">
          <path d="M2 2C14 8 22 20 22 30C22 40 14 52 2 58" stroke="#FBB03B" strokeWidth="4" strokeLinecap="round" />
        </svg>
      </div>

      {showTagline && (
        <p className="text-[9px] md:text-xs font-medium text-slate-500 mt-1 md:mt-2">
          Your circle. Your people. <span className="text-[#00AEEF]">Your recommendations.</span>
        </p>
      )}
    </div>
  );
}
