import { Navbar } from '@/components/ui/navbar';
import { Hero } from '@/components/sections/hero';
import { Metrics } from '@/components/sections/metrics';
import { Features } from '@/components/sections/features';
import { BeforeAfter } from '@/components/sections/before-after';
import { HowItWorks } from '@/components/sections/how-it-works';
import { Integrations } from '@/components/sections/integrations';
import { Testimonials } from '@/components/sections/testimonials';
import { Pricing } from '@/components/sections/pricing';
import { FAQ } from '@/components/sections/faq';
import { CTA } from '@/components/sections/cta';
import { Footer } from '@/components/sections/footer';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Metrics />
      <Features />
      <BeforeAfter />
      <HowItWorks />
      <Integrations />
      <Testimonials />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
