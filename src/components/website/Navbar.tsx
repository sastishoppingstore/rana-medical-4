import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, MessageCircle, Menu, X, Activity, Stethoscope } from 'lucide-react';
import { HOSPITAL } from '../../lib/format';

const navItems = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Doctors', href: '#doctors' },
  { label: 'Packages', href: '#packages' },
  { label: 'Lab Reports', href: '#lab' },
  { label: 'Contact', href: '#contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('home');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll);
    const ids = navItems.map((n) => n.href.slice(1));
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); }),
      { rootMargin: '-45% 0px -50% 0px' }
    );
    ids.forEach((id) => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => { window.removeEventListener('scroll', onScroll); obs.disconnect(); };
  }, []);

  return (
    <>
      {/* Top bar */}
      <div className="hidden md:block bg-deep-navy text-white/90 text-sm">
        <div className="container-x flex items-center justify-between py-2 px-4">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-2"><Phone size={14} className="text-medical-teal" /> 24/7 Emergency: {HOSPITAL.phone}</span>
            <span className="flex items-center gap-2"><Activity size={14} className="text-emerald-400" /> Live: Emergency & OPD Operational</span>
          </div>
          <a href={HOSPITAL.whatsapp} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-medical-teal transition">
            <MessageCircle size={14} /> WhatsApp
          </a>
        </div>
      </div>

      {/* Navbar */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'glass shadow-soft' : 'bg-transparent'}`}>
        <nav className="container-x flex items-center justify-between px-4 py-3">
          <a href="#home" className="flex items-center gap-2.5">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-medical-teal to-royal-blue grid place-items-center text-white shadow-premium">
              <Stethoscope size={22} />
            </span>
            <span className="font-display font-extrabold text-lg leading-tight text-deep-navy">Rana Medical<br /><span className="text-xs font-semibold text-medical-teal tracking-wide">HOSPITAL</span></span>
          </a>

          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((n) => (
              <a key={n.href} href={n.href}
                className={`relative px-3.5 py-2 text-sm font-semibold rounded-full transition ${active === n.href.slice(1) ? 'text-medical-teal' : 'text-slate-600 hover:text-deep-navy'}`}>
                {n.label}
                {active === n.href.slice(1) && <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-medical-teal" />}
              </a>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <Link to="/login" className="btn-ghost !py-2 !px-4 text-sm">Staff / ERP Login</Link>
            <a href="#appointment" className="btn-primary !py-2 !px-4 text-sm">Book Appointment</a>
          </div>

          <button className="lg:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>

        {/* Mobile menu */}
        {open && (
          <div className="lg:hidden glass border-t border-soft-border px-4 py-3 space-y-1">
            {navItems.map((n) => (
              <a key={n.href} href={n.href} onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-xl font-semibold text-slate-700 hover:bg-ice-mint">{n.label}</a>
            ))}
            <Link to="/login" onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-xl font-semibold text-slate-700 hover:bg-ice-mint">Staff / ERP Login</Link>
            <a href="#appointment" onClick={() => setOpen(false)} className="block btn-primary mt-2 w-full">Book Appointment</a>
          </div>
        )}
      </header>

      {/* Mobile floating emergency call */}
      <a href={HOSPITAL.tel} className="lg:hidden fixed bottom-5 left-5 z-50 w-14 h-14 rounded-full bg-red-600 text-white grid place-items-center shadow-premium animate-pulse">
        <Phone size={24} />
      </a>
    </>
  );
}
