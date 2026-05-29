import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import StatsStrip from '../components/StatsStrip.jsx';
import Hero from '../sections/Hero.jsx';
import Events from '../sections/Events.jsx';
import Tryout from '../sections/Tryout.jsx';
import Materi from '../sections/Materi.jsx';
import Timeline from '../sections/Timeline.jsx';
import WhyBesc from '../sections/WhyBesc.jsx';
import Testimonials from '../sections/Testimonials.jsx';
import Blog from '../sections/Blog.jsx';
import CTA from '../sections/CTA.jsx';
import FAQ from '../sections/FAQ.jsx';

export default function HomePage({ onCompetitionDetail, onRegister, onLogin, onLogout, onOlimpiade, onProfile, onTryout, onTryoutPackage, user }) {
  return (
    <>
      <Header isHome onLogin={onLogin} onLogout={onLogout} onOlimpiade={onOlimpiade} onProfile={onProfile} onRegister={onRegister} onTryout={onTryout} user={user} />
      <main>
        <Hero onRegister={onRegister} />
        <StatsStrip />
        <Events onCompetitionDetail={onCompetitionDetail} />
        <Tryout onTryoutPackage={onTryoutPackage} />
        <Materi />
        <Timeline />
        <WhyBesc />
        <Testimonials />
        <Blog />
        <CTA onRegister={onRegister} />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
