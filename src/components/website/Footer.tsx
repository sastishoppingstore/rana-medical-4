import { Link } from 'react-router-dom';
import { Phone, MessageCircle, Mail, MapPin, Stethoscope, Facebook, Instagram, Linkedin } from 'lucide-react';
import { HOSPITAL } from '../../lib/format';

export default function Footer() {
  return (
    <footer className="bg-deep-navy text-white/80">
      <div className="container-x px-4 py-14 grid gap-10 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-medical-teal to-royal-blue grid place-items-center text-white">
              <Stethoscope size={22} />
            </span>
            <span className="font-display font-extrabold text-lg text-white">Rana Medical Hospital</span>
          </div>
          <p className="text-sm text-white/60 leading-relaxed mb-4">
            Compassionate care with advanced medical excellence. A fully digital, patient-first healthcare institution.
          </p>
          <div className="flex gap-3">
            {[Facebook, Instagram, Linkedin].map((I, i) => (
              <a key={i} href="#" className="w-9 h-9 rounded-full bg-white/10 grid place-items-center hover:bg-medical-teal transition"><I size={16} /></a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-display font-bold text-white mb-4">Departments</h4>
          <ul className="space-y-2 text-sm text-white/60">
            <li><a href="#services" className="hover:text-medical-teal">OPD Clinics</a></li>
            <li><a href="#services" className="hover:text-medical-teal">Emergency 24/7</a></li>
            <li><a href="#services" className="hover:text-medical-teal">Cardiology</a></li>
            <li><a href="#services" className="hover:text-medical-teal">Gynecology & Maternity</a></li>
            <li><a href="#services" className="hover:text-medical-teal">Pediatrics</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-bold text-white mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm text-white/60">
            <li><a href="#about" className="hover:text-medical-teal">About Us</a></li>
            <li><a href="#doctors" className="hover:text-medical-teal">Our Doctors</a></li>
            <li><a href="#packages" className="hover:text-medical-teal">Health Packages</a></li>
            <li><a href="#lab" className="hover:text-medical-teal">Lab Reports</a></li>
            <li><Link to="/login" className="hover:text-medical-teal">Staff / ERP Login</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-bold text-white mb-4">Contact</h4>
          <ul className="space-y-3 text-sm text-white/60">
            <li className="flex gap-2"><MapPin size={16} className="text-medical-teal mt-0.5" /> {HOSPITAL.address}</li>
            <li className="flex gap-2"><Phone size={16} className="text-medical-teal mt-0.5" /> <a href={HOSPITAL.tel} className="hover:text-medical-teal">{HOSPITAL.phone}</a></li>
            <li className="flex gap-2"><MessageCircle size={16} className="text-medical-teal mt-0.5" /> <a href={HOSPITAL.whatsapp} className="hover:text-medical-teal">WhatsApp</a></li>
            <li className="flex gap-2"><Mail size={16} className="text-medical-teal mt-0.5" /> {HOSPITAL.email}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-x px-4 py-5 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-white/50">
          <p>© {new Date().getFullYear()} {HOSPITAL.name}. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white/80">Privacy Policy</a>
            <a href="#" className="hover:text-white/80">Terms & Conditions</a>
          </div>
          <p className="text-white/40">Powered by Wafa Smart Tech</p>
        </div>
      </div>
    </footer>
  );
}
