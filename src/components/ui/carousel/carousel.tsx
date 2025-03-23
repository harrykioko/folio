
import * as React from "react"
import useEmblaCarousel from "embla-carousel-react"
import { cn } from "@/lib/utils"
import { CarouselContext, type CarouselApi, type CarouselProps } from "./carousel-context"

const Carousel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & CarouselProps
>(
  (
    {
      orientation = "horizontal",
      opts,
      setApi,
      plugins,
      className,
      children,
      autoplay = false,
      autoplayInterval = 3000,
      ...props
    },
    ref
  ) => {
    const [carouselRef, api] = useEmblaCarousel(
      {
        ...opts,
        axis: orientation === "horizontal" ? "x" : "y",
      },
      plugins
    )
    const [canScrollPrev, setCanScrollPrev] = React.useState(false)
    const [canScrollNext, setCanScrollNext] = React.useState(false)
    
    const autoplayTimerRef = React.useRef<NodeJS.Timeout | null>(null)

    const startAutoplay = React.useCallback(() => {
      if (!autoplay || !api) return
      
      stopAutoplay()
      
      autoplayTimerRef.current = setInterval(() => {
        if (!api.canScrollNext()) {
          api.scrollTo(0)
        } else {
          api.scrollNext()
        }
      }, autoplayInterval)
    }, [api, autoplay, autoplayInterval])
    
    const stopAutoplay = React.useCallback(() => {
      if (autoplayTimerRef.current) {
        clearInterval(autoplayTimerRef.current)
        autoplayTimerRef.current = null
      }
    }, [])

    const onSelect = React.useCallback((api: CarouselApi) => {
      if (!api) {
        return
      }

      setCanScrollPrev(api.canScrollPrev())
      setCanScrollNext(api.canScrollNext())
    }, [])

    const scrollPrev = React.useCallback(() => {
      api?.scrollPrev()
      if (autoplay) {
        startAutoplay()
      }
    }, [api, autoplay, startAutoplay])

    const scrollNext = React.useCallback(() => {
      api?.scrollNext()
      if (autoplay) {
        startAutoplay()
      }
    }, [api, autoplay, startAutoplay])

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault()
          scrollPrev()
        } else if (event.key === "ArrowRight") {
          event.preventDefault()
          scrollNext()
        }
      },
      [scrollPrev, scrollNext]
    )

    React.useEffect(() => {
      if (!api || !setApi) {
        return
      }

      setApi(api)
    }, [api, setApi])

    React.useEffect(() => {
      if (!api) {
        return
      }

      onSelect(api)
      api.on("reInit", onSelect)
      api.on("select", onSelect)

      return () => {
        api?.off("select", onSelect)
      }
    }, [api, onSelect])
    
    React.useEffect(() => {
      if (autoplay && api) {
        startAutoplay()
      }
      
      return () => {
        stopAutoplay()
      }
    }, [api, autoplay, startAutoplay, stopAutoplay])
    
    const handleMouseEnter = React.useCallback(() => {
      if (autoplay) {
        stopAutoplay()
      }
    }, [autoplay, stopAutoplay])
    
    const handleMouseLeave = React.useCallback(() => {
      if (autoplay) {
        startAutoplay()
      }
    }, [autoplay, startAutoplay])

    return (
      <CarouselContext.Provider
        value={{
          carouselRef,
          api: api,
          opts,
          orientation:
            orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
          scrollPrev,
          scrollNext,
          canScrollPrev,
          canScrollNext,
          autoplay,
          autoplayInterval,
        }}
      >
        <div
          ref={ref}
          onKeyDownCapture={handleKeyDown}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={cn("relative", className)}
          role="region"
          aria-roledescription="carousel"
          {...props}
        >
          {children}
        </div>
      </CarouselContext.Provider>
    )
  }
)
Carousel.displayName = "Carousel"

export { Carousel }
