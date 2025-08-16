import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { ServiceCategories } from "@/components/service-categories"
import { FeaturedServices } from "@/components/featured-services"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-off-white">
      <Header />
      <main>
        <HeroSection />
        <ServiceCategories />
        <FeaturedServices />
      </main>
      <Footer />
    </div>
  )
}
