
import BackgroundElements from '@/components/landing/BackgroundElements';
import LandingHeader from '@/components/landing/LandingHeader';
import HeroSection from '@/components/landing/HeroSection';
import QuotesCarousel from '@/components/landing/QuotesCarousel';
import Footer from '@/components/landing/Footer';

export default function Index() {
  return (
    <div className="relative min-h-screen bg-background">
      {/* Background elements */}
      <BackgroundElements />
      
      {/* Header */}
      <LandingHeader />
      
      {/* Hero section */}
      <HeroSection />
      
      {/* Inspirational quotes carousel */}
      <QuotesCarousel />
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
