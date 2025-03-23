
import { motion } from 'framer-motion';

export default function BackgroundElements() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-5"></div>
      
      <motion.div 
        className="absolute -top-[40%] -right-[20%] w-[80%] h-[80%] rounded-full bg-gradient-to-br from-indigo-900/20 to-purple-900/20 blur-3xl"
        animate={{ 
          scale: [1, 1.02, 1],
          opacity: [0.2, 0.25, 0.2]
        }}
        transition={{ 
          duration: 15,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
      
      <motion.div 
        className="absolute -bottom-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-gradient-to-tr from-blue-900/20 to-violet-900/20 blur-3xl"
        animate={{ 
          scale: [1, 1.05, 1],
          opacity: [0.2, 0.27, 0.2]
        }}
        transition={{ 
          duration: 18,
          repeat: Infinity,
          repeatType: "reverse",
          delay: 2
        }}
      />
      
      {/* Subtle data visualization elements in background */}
      <svg className="absolute top-1/4 right-1/4 w-64 h-64 opacity-5" viewBox="0 0 100 100">
        <motion.circle 
          cx="50" 
          cy="50" 
          r="40" 
          stroke="currentColor" 
          strokeWidth="0.5" 
          fill="none"
          animate={{ 
            r: [40, 42, 40],
            opacity: [0.5, 0.7, 0.5]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        <path d="M50,10 L50,90 M10,50 L90,50" stroke="currentColor" strokeWidth="0.2" />
        <path d="M30,30 L70,70 M30,70 L70,30" stroke="currentColor" strokeWidth="0.2" />
      </svg>
      
      <svg className="absolute bottom-1/4 left-1/4 w-48 h-48 opacity-5" viewBox="0 0 100 100">
        <motion.rect 
          x="20" 
          y="20" 
          width="60" 
          height="60" 
          stroke="currentColor" 
          strokeWidth="0.5" 
          fill="none"
          animate={{ 
            width: [60, 65, 60],
            height: [60, 65, 60],
            x: [20, 17.5, 20],
            y: [20, 17.5, 20],
            opacity: [0.5, 0.7, 0.5]
          }}
          transition={{ 
            duration: 12,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        <motion.circle 
          cx="50" 
          cy="50" 
          r="20" 
          stroke="currentColor" 
          strokeWidth="0.3" 
          fill="none"
          animate={{ 
            r: [20, 22, 20],
            opacity: [0.5, 0.7, 0.5]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
      </svg>

      {/* Particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 15 }).map((_, index) => (
          <motion.div
            key={index}
            className="absolute w-1 h-1 rounded-full bg-primary/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 0.5, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>
    </div>
  );
}
