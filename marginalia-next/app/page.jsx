import ShopProvider from '../components/ShopProvider';
import SvgDefs from '../components/SvgDefs';
import Header from '../components/Header';
import Hero from '../components/Hero';
import MoodBoard from '../components/MoodBoard';
import Games from '../components/Games';
import Featured from '../components/Featured';
import Community from '../components/Community';
import Newsletter from '../components/Newsletter';
import Footer from '../components/Footer';
import Butterfly from '../components/Butterfly';
import PageEffects from '../components/PageEffects';

export default function Page() {
  return (
    <ShopProvider>
      <div className="veil" aria-hidden="true"></div>

      {/* shared illustration: warm flat-lay of the reading table */}
      <SvgDefs />

      <Header />

      <main id="top">
        {/* HERO */}
        <Hero />

        {/* EDITORIAL MOOD BOARD SECTION */}
        <MoodBoard />

        {/* DISCOVER / GAMES SECTION */}
        <Games />

        {/* FEATURED */}
        <Featured />

        {/* COMMUNITY */}
        <Community />

        {/* NEWSLETTER */}
        <Newsletter />
      </main>

      <Footer />

      <Butterfly />

      <PageEffects />
    </ShopProvider>
  );
}
