import Hero from "@/components/Hero";
import ImageCarousel from "@/components/ImageCarousel";
import BookTicket from "@/components/Bookticket";
import Footer from "@/components/Footer";
import PageBackground from "@/components/PageBackground";

export default function Home() {
  return (
    <main className="min-h-screen">
      <PageBackground />
      <Hero
        videos={[
          { src: "/v/1.mp4", poster: "/v/1.jpg" },
          { src: "/v/2.mp4", poster: "/v/2.jpg" },
          { src: "/v/3.mp4" },
          { src: "/v/4.mp4" },
          { src: "/v/5.mp4" },
        ]}
      />
      <BookTicket />
      {/* <ImageCarousel /> */}
      <Footer />
    </main>
  );
}
