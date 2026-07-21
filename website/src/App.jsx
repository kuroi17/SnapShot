import { Navbar } from "./components/layout/Navbar"
import { Footer } from "./components/layout/Footer"
import { HeroSection } from "./components/sections/HeroSection"
import { DownloadCard } from "./components/sections/DownloadCard"
import { ComparisonSlider } from "./components/sections/ComparisonSlider"
import { FeaturesGrid } from "./components/sections/FeaturesGrid"
import { ShortcutsSection } from "./components/sections/ShortcutsSection"

function App() {
  return (
    <div className="min-h-dvh flex flex-col bg-dark-canvas">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <FeaturesGrid />
        <ComparisonSlider />
        <DownloadCard />
        <ShortcutsSection />
      </main>
      <Footer />
    </div>
  )
}

export default App
