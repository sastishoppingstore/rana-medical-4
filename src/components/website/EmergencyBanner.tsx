import { Phone, MessageCircle, Ambulance, Building2 } from 'lucide-react';
import { HOSPITAL } from '../../lib/format';

export default function EmergencyBanner() {
  return (
    <section className="section-pad">
      <div className="container-x px-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-600 via-rose-600 to-deep-navy text-white p-8 md:p-12">
          <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-64 h-64 rounded-full bg-white/5 blur-2xl" />
          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full text-xs font-bold tracking-wide mb-4">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> 24/7 EMERGENCY
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-extrabold leading-tight">Emergency? We're Ready.</h2>
              <p className="mt-3 text-white/80 max-w-md">Our trauma team and ambulances are on standby around the clock. For life-threatening emergencies, call immediately.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href={HOSPITAL.tel} className="bg-white text-red-600 font-bold px-6 py-3 rounded-full flex items-center gap-2 hover:bg-ice-mint transition"><Phone size={18} /> {HOSPITAL.phone}</a>
                <a href={HOSPITAL.whatsapp} target="_blank" rel="noreferrer" className="bg-white/15 text-white font-semibold px-6 py-3 rounded-full flex items-center gap-2 hover:bg-white/25 transition"><MessageCircle size={18} /> WhatsApp</a>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { Icon: Ambulance, title: 'Ambulance', sub: 'Dispatch on call' },
                { Icon: Phone, title: 'Emergency Line', sub: HOSPITAL.phone },
                { Icon: Building2, title: 'Corporate Panel', sub: 'Insurance inquiry' },
                { Icon: MessageCircle, title: 'Quick Help', sub: 'WhatsApp us' },
              ].map((c) => (
                <div key={c.title} className="bg-white/10 backdrop-blur rounded-2xl p-4">
                  <c.Icon size={24} className="mb-2" />
                  <p className="font-bold">{c.title}</p>
                  <p className="text-xs text-white/70">{c.sub}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="relative text-[11px] text-white/50 mt-6">Ambulance dispatch, insurance panels and emergency response shown for demonstration — confirm operational status with the hospital before relying on them.</p>
        </div>
      </div>
    </section>
  );
}
