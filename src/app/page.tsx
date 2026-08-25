import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { StatsBar } from '@/components/StatsBar';
import { ProblemSolution } from '@/components/ProblemSolution';
import { Stages } from '@/components/Stages';
import { WhoFor } from '@/components/WhoFor';
import { FreeChapterReader } from '@/components/FreeChapterReader';
import { Pricing } from '@/components/Pricing';
import { CouponBox } from '@/components/CouponBox';
import { FAQ } from '@/components/FAQ';
import { Footer } from '@/components/Footer';
import { StickyCTA } from '@/components/StickyCTA';
import { ChatWidget } from '@/components/ChatWidget';

export default function Home() {
  return (
    <main id="top">
      <Navbar />
      <Hero />
      <StatsBar />
      <ProblemSolution />
      <Stages />
      <WhoFor />
      <FreeChapterReader />
      <Pricing />
      <CouponBox />
      <FAQ />
      <Footer />

      {/* عناصر عائمة */}
      <StickyCTA />
      <ChatWidget />
    </main>
  );
}
