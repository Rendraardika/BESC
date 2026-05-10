import Navbar from './components/Navbar/Navbar';
import Hero from './components/Hero/Hero';
import StatsBar from './components/StatsBar/StatsBar';
import About from './components/About/About';
import Timeline from './components/Timeline/Timeline';
import Materials from './components/Materials/Materials';
import FAQ from './components/FAQ/FAQ';
import CTA from './components/CTA/CTA';
import Footer from './components/Footer/Footer';
import './App.css';

export default function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <StatsBar />
      <About />
      <div className="section-divider" />
      <Timeline />
      <Materials />
      <div className="section-divider" />
      <FAQ />
      <CTA />
      <Footer />
    </>
  );
}
