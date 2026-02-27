import { NewHero } from '@/components/landing/NewHero';
import { DemoSection1 } from '@/components/landing/DemoSection1';
import { DemoSection2 } from '@/components/landing/DemoSection2';
import { DemoSection3 } from '@/components/landing/DemoSection3';
import { DemoSection4 } from '@/components/landing/DemoSection4';
import { FinalCTA } from '@/components/landing/FinalCTA';
import { ScrollProgress } from '@/components/landing/ScrollProgress';

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <ScrollProgress />
      <NewHero />
      <DemoSection1 />
      <DemoSection2 />
      <DemoSection3 />
      <DemoSection4 />
      <FinalCTA />
    </main>
  );
}
