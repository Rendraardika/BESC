import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import StatsStrip from '../components/StatsStrip.jsx';
import Hero from '../sections/Hero.jsx';
import Events from '../sections/Events.jsx';
import Materi from '../sections/Materi.jsx';
import Timeline from '../sections/Timeline.jsx';
import WhyBesc from '../sections/WhyBesc.jsx';
import Testimonials from '../sections/Testimonials.jsx';
import CTA from '../sections/CTA.jsx';
import Blog from '../sections/Blog.jsx';
import FAQ from '../sections/FAQ.jsx';

export default function HomePage({ competitions, competitionsLoading, onCompetitionDetail, onCompetitions, onRegister, onLogin, onLogout, onOlimpiade, onProfile, onTryout, onTryoutPackage, onVerifiedCompetition, registrations, user }) {
  return (
    <>
      <Header isHome onLogin={onLogin} onLogout={onLogout} onOlimpiade={onOlimpiade} onProfile={onProfile} onRegister={onRegister} onTryout={onTryout} user={user} />
      <main>
        <Hero onCompetitions={onCompetitions} onTryoutPackage={onTryoutPackage} />
        <StatsStrip />
        <Events competitions={competitions} competitionsLoading={competitionsLoading} onCompetitionDetail={onCompetitionDetail} onVerifiedCompetition={onVerifiedCompetition} registrations={registrations} />
        <Materi />
        <Timeline />
        <WhyBesc />
        <Testimonials />
        <CTA onRegister={onRegister} />
        <Blog />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
