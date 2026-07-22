import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { HeroSection } from "./components/sections/HeroSection";
import { ComparisonSlider } from "./components/sections/ComparisonSlider";
import { ShowcaseCarousel } from "./components/sections/ShowcaseCarousel";
import { FeaturesAndShortcuts } from "./components/sections/FeaturesAndShortcuts";
import { InstallationSection } from "./components/sections/InstallationSection";
import { ContributingSection } from "./components/sections/ContributingSection";
import { WavyGridBackground } from "./components/ui/WavyGridBackground";

function App() {
  return (
    <div className="relative min-h-dvh flex flex-col bg-dark-canvas overflow-x-hidden text-text-main">
      <WavyGridBackground />
      <Navbar />
      <main className="relative z-10 flex-1">
        <HeroSection />
        <ComparisonSlider />
        <ShowcaseCarousel />
        <FeaturesAndShortcuts />
        <InstallationSection />
        <ContributingSection />
      </main>
      <Footer />
    </div>
  );
}

export default App;
