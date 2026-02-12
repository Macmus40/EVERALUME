
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
  const baseStyles = "px-10 py-5 font-medium transition-all duration-500 active:scale-[0.98] text-center inline-flex items-center justify-center gap-2 uppercase tracking-[0.2em] text-[10px]";
  
  const variants = {
    primary: "bg-[#7D6B5D] text-white hover:bg-[#635449] border border-[#7D6B5D]",
    secondary: "bg-[#EAE4DD] text-[#7D6B5D] hover:bg-[#DDD2C6] border border-[#EAE4DD]",
    outline: "border border-current text-current hover:bg-current hover:text-white",
    minimal: "border border-white/20 text-white hover:border-white transition-colors bg-transparent"
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
