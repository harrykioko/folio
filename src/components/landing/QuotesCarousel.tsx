
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Card } from "@/components/ui/card";

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
    <section className="relative z-10 px-4 py-16 bg-accent/50 backdrop-blur-sm">
      <div className="container mx-auto max-w-screen-lg">
        <Carousel className="w-full max-w-3xl mx-auto" opts={{ loop: true, align: "center" }} autoplay autoplayInterval={3000}>
          <CarouselContent>
            {inspirationalQuotes.map((item, index) => (
              <CarouselItem key={index}>
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
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
}
