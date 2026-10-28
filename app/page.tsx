import CountdownTimer from "@/components/CountdownTimer";
import Hero from "@/components/Hero";
import ImageCarousel from "@/components/ImageCarousel";
import BookTicket from "@/components/Bookticket";
import Footer from "@/components/Footer";
import PageBackground from "@/components/PageBackground";
import Loader from "@/components/Loader";
import { LoadingProvider } from "@/components/LoadingContext";

export default function Home() {
  return (
    <LoadingProvider>
      <main className="min-h-screen">
        <Loader />
        <PageBackground />
        {/* <CountdownTimer /> */}
        <Hero/>
        <BookTicket />
        <ImageCarousel />
        <Footer />
      </main>
    </LoadingProvider>
  );
}
