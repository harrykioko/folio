
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Inspirational quotes for carousel
const inspirationalQuotes = [
  {
    quote: "Build ventures that matter, or don't build at all.",
    author: "Founder's Mantra"
  },
  {
    quote: "Vision without execution is hallucination.",
    author: "Thomas Edison"
  },
  {
    quote: "The best way to predict the future is to create it.",
    author: "Peter Drucker"
  },
  {
    quote: "Move fast and build things that last.",
    author: "Builder's Code"
  },
  {
    quote: "What we do in life echoes in eternity.",
    author: "Marcus Aurelius"
  }
];

export default function QuotesCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  
  useEffect(() => {
    // Simple interval to rotate through quotes
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % inspirationalQuotes.length);
    }, 8000); // Longer interval for a more subtle experience
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <section className="relative z-10 px-4 py-12">
      <div className="container mx-auto max-w-screen-lg">
        <div className="h-24 relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <blockquote className="text-center">
                <p className="text-lg md:text-xl font-serif italic mb-3 text-foreground/90 tracking-wide">
                  "{inspirationalQuotes[activeIndex].quote}"
                </p>
                <footer className="text-sm text-muted-foreground flex items-center justify-center space-x-2">
                  <span className="h-px w-4 bg-muted-foreground/30"></span>
                  <span>— {inspirationalQuotes[activeIndex].author}</span>
                  <span className="h-px w-4 bg-muted-foreground/30"></span>
                </footer>
              </blockquote>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
