
export default function BackgroundElements() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-5"></div>
      <div className="absolute -top-[40%] -right-[20%] w-[80%] h-[80%] rounded-full bg-gradient-to-br from-indigo-900/20 to-purple-900/20 blur-3xl"></div>
      <div className="absolute -bottom-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-gradient-to-tr from-blue-900/20 to-violet-900/20 blur-3xl"></div>
      
      {/* Subtle data visualization elements in background */}
      <svg className="absolute top-1/4 right-1/4 w-64 h-64 opacity-5" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="0.5" fill="none" />
        <path d="M50,10 L50,90 M10,50 L90,50" stroke="currentColor" strokeWidth="0.2" />
        <path d="M30,30 L70,70 M30,70 L70,30" stroke="currentColor" strokeWidth="0.2" />
      </svg>
      
      <svg className="absolute bottom-1/4 left-1/4 w-48 h-48 opacity-5" viewBox="0 0 100 100">
        <rect x="20" y="20" width="60" height="60" stroke="currentColor" strokeWidth="0.5" fill="none" />
        <circle cx="50" cy="50" r="20" stroke="currentColor" strokeWidth="0.3" fill="none" />
      </svg>
    </div>
  );
}
