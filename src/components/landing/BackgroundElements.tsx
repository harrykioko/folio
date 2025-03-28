
export default function BackgroundElements() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-5"></div>
      
      {/* Enhanced gradients - darker and more visible in dark mode */}
      <div className="absolute -top-[40%] -right-[20%] w-[80%] h-[80%] rounded-full bg-gradient-to-br from-indigo-900/30 to-purple-900/30 dark:from-indigo-600/40 dark:to-purple-800/40 blur-3xl"></div>
      <div className="absolute -bottom-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-gradient-to-tr from-blue-900/30 to-violet-900/30 dark:from-blue-700/40 dark:to-violet-800/40 blur-3xl"></div>
      <div className="absolute top-1/3 left-1/3 w-[50%] h-[50%] rounded-full bg-gradient-to-r from-pink-900/20 to-indigo-900/20 dark:from-pink-700/30 dark:to-indigo-700/30 blur-3xl"></div>
      
      {/* More visible data visualization elements in background for dark mode */}
      <svg className="absolute top-1/4 right-1/4 w-64 h-64 opacity-5 dark:opacity-10" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="0.5" fill="none" />
        <path d="M50,10 L50,90 M10,50 L90,50" stroke="currentColor" strokeWidth="0.2" />
        <path d="M30,30 L70,70 M30,70 L70,30" stroke="currentColor" strokeWidth="0.2" />
      </svg>
      
      <svg className="absolute bottom-1/4 left-1/4 w-48 h-48 opacity-5 dark:opacity-10" viewBox="0 0 100 100">
        <rect x="20" y="20" width="60" height="60" stroke="currentColor" strokeWidth="0.5" fill="none" />
        <circle cx="50" cy="50" r="20" stroke="currentColor" strokeWidth="0.3" fill="none" />
      </svg>
      
      {/* Additional subtle decorative elements */}
      <div className="absolute top-1/2 left-10 w-12 h-12 rounded-full border border-white/10 dark:border-white/20 backdrop-blur-md"></div>
      <div className="absolute bottom-1/3 right-20 w-8 h-8 rounded-full border border-white/10 dark:border-white/20 backdrop-blur-md"></div>
      
      {/* Additional decorative elements for dark mode */}
      <div className="hidden dark:block absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-red-600/10 blur-3xl"></div>
      <div className="hidden dark:block absolute bottom-1/3 right-1/3 w-64 h-64 rounded-full bg-blue-600/10 blur-3xl"></div>
    </div>
  );
}
