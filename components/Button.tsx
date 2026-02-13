
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'minimal';
  className?: string;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  loading,
  ...props 
}) => {
  const baseStyles = "px-10 py-5 font-medium transition-all duration-300 active:translate-y-[1px] text-center inline-flex items-center justify-center gap-2 uppercase tracking-[0.2em] text-[10px] motion-reduce:transition-none motion-reduce:active:translate-y-0";
  
  const variants = {
    primary: "bg-[#7D6B5D] text-white hover:bg-[#8d7c6f] border border-[#7D6B5D] hover:border-[#8d7c6f]",
    secondary: "bg-[#EAE4DD] text-[#7D6B5D] hover:bg-[#f2eee9] border border-[#EAE4DD]",
    // Enhanced: Outline uses slate-400 border and slate-700 text for better readability on light backgrounds
    outline: "border border-slate-400 text-slate-700 hover:bg-[#7D6B5D] hover:border-[#7D6B5D] hover:text-white bg-transparent",
    minimal: "border border-white/60 text-white hover:border-white transition-colors bg-transparent"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className} ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
      disabled={loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-3 w-3 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
};
