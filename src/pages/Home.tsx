import Navbar from '../components/website/Navbar';
import Hero3D from '../components/website/Hero3D';
import AppointmentFinder from '../components/website/AppointmentFinder';
import ImpactCounters from '../components/website/ImpactCounters';
import About from '../components/website/About';
import Services from '../components/website/Services';
import WhyChooseUs from '../components/website/WhyChooseUs';
import DoctorsDirectory from '../components/website/DoctorsDirectory';
import Packages from '../components/website/Packages';
import LabReportPortal from '../components/website/LabReportPortal';
import Facilities from '../components/website/Facilities';
import HowItWorks from '../components/website/HowItWorks';
import Testimonials from '../components/website/Testimonials';
import Blog from '../components/website/Blog';
import EmergencyBanner from '../components/website/EmergencyBanner';
import FAQ from '../components/website/FAQ';
import Contact from '../components/website/Contact';
import Footer from '../components/website/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero3D />
      <AppointmentFinder />
      <ImpactCounters />
      <About />
      <Services />
      <WhyChooseUs />
      <DoctorsDirectory />
      <Packages />
      <LabReportPortal />
      <Facilities />
      <HowItWorks />
      <Testimonials />
      <Blog />
      <EmergencyBanner />
      <FAQ />
      <Contact />
      <Footer />
    </div>
  );
}
