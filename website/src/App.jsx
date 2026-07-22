import { Navbar } from "./components/layout/Navbar"
import { Footer } from "./components/layout/Footer"
import { HeroSection } from "./components/sections/HeroSection"
import { ComparisonSlider } from "./components/sections/ComparisonSlider"
import { FeaturesAndShortcuts } from "./components/sections/FeaturesAndShortcuts"
import { InstallationSection } from "./components/sections/InstallationSection"
import { ContributingSection } from "./components/sections/ContributingSection"

function App() {
  return (
    <div className="min-h-dvh flex flex-col bg-dark-canvas">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <ComparisonSlider />
        <FeaturesAndShortcuts />
        <InstallationSection />
        <ContributingSection />
      </main>
      <Footer />
    </div>
  )
}

export default App
