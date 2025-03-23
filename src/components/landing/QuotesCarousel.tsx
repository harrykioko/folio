
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Card } from "@/components/ui/card";
import { AnimatePresence, motion } from "framer-motion";

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
  return (
    <section className="relative z-10 px-4 py-16">
      <div className="container mx-auto max-w-screen-lg">
        <Carousel 
          className="w-full max-w-3xl mx-auto" 
          opts={{ 
            loop: true, 
            align: "center",
            duration: 1000 // Slower transition duration
          }} 
          autoplay 
          autoplayInterval={5000} // Increased from 3000 to 5000ms for slower transitions
        >
          <CarouselContent>
            {inspirationalQuotes.map((item, index) => (
              <CarouselItem key={index}>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                >
                  <Card className="border-none shadow-none bg-transparent">
                    <div className="p-1">
                      <blockquote className="text-center">
                        <p className="text-xl md:text-2xl font-serif italic mb-4 text-foreground">
                          "{item.quote}"
                        </p>
                        <footer className="text-muted-foreground">
                          — {item.author}
                        </footer>
                      </blockquote>
                    </div>
                  </Card>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
}
