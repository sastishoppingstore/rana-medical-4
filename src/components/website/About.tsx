import { motion } from 'framer-motion';
import { Target, Eye, HeartHandshake, Award, Building2, Microscope, Bed, Users } from 'lucide-react';
import { SectionHeading, Reveal } from '../ui/primitives';

const pillars = [
  { Icon: Target, title: 'Our Mission', text: 'To deliver safe, affordable and compassionate healthcare through modern diagnostics, expert consultants and a fully digital patient experience.' },
  { Icon: Eye, title: 'Our Vision', text: 'To be the most trusted healthcare institution in the region — setting the standard for clinical excellence and patient dignity.' },
  { Icon: HeartHandshake, title: 'Our Values', text: 'Integrity, empathy and innovation guide every decision — from the emergency bay to the pharmacy counter.' },
];

const infra = [
  { Icon: Building2, label: 'Modern Campus', value: '5 Floors' },
  { Icon: Microscope, label: 'Automated Lab', value: '24/7' },
  { Icon: Bed, label: 'Beds & ICU', value: '120+' },
  { Icon: Users, label: 'Medical Staff', value: '200+' },
];

export default function About() {
  return (
    <section id="about" className="section-pad">
      <div className="container-x px-4">
        <SectionHeading eyebrow="About Us" title="A New Standard of Healthcare" subtitle="Rana Medical Hospital blends human compassion with advanced medical technology to serve every patient with dignity." />

        <div className="grid lg:grid-cols-2 gap-10 items-center mb-14">
          <Reveal>
            <div className="relative">
              <img src="/images/about-hospital.jpg" alt="Hospital" className="rounded-3xl shadow-premium w-full object-cover h-[360px]" />
              <div className="absolute -bottom-6 -right-4 glass rounded-2xl shadow-premium p-4 max-w-[200px]">
                <p className="font-display font-bold text-medical-teal text-2xl">Since 2009</p>
                <p className="text-xs text-slate-500">Serving the community with care</p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h3 className="font-display text-2xl font-bold text-deep-navy mb-3">Our Story</h3>
            <p className="text-slate-500 leading-relaxed mb-4">
              Founded with a single promise — that quality healthcare should be accessible to all — Rana Medical Hospital has grown into a comprehensive tertiary care facility. From a modest clinic to a fully digital hospital, our journey has always been defined by the people we serve.
            </p>
            <p className="text-slate-500 leading-relaxed">
              Today we operate specialist OPDs, a 24/7 emergency & trauma centre, an automated pathology laboratory, modular operation theatres and a digital pharmacy — all connected through one unified hospital system.
            </p>
            <div className="mt-6 p-5 rounded-2xl bg-ice-mint border border-soft-border">
              <p className="text-sm font-semibold text-deep-navy">Message from the Medical Director</p>
              <p className="text-sm text-slate-500 mt-1 italic">"We measure success not in beds filled, but in lives improved. Every system we build exists to give our clinicians more time with patients."</p>
            </div>
          </Reveal>
        </div>

        <div className="grid md:grid-cols-3 gap-5 mb-14">
          {pillars.map((p) => (
            <Reveal key={p.title}>
              <div className="card-premium p-6 h-full">
                <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-medical-teal to-royal-blue text-white grid place-items-center mb-4"><p.Icon size={22} /></span>
                <h4 className="font-display font-bold text-lg text-deep-navy">{p.title}</h4>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">{p.text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
          {infra.map((i) => (
            <div key={i.label} className="glass rounded-2xl p-5 text-center">
              <i.Icon size={24} className="mx-auto text-medical-teal mb-2" />
              <p className="font-display font-extrabold text-xl text-deep-navy">{i.value}</p>
              <p className="text-xs text-slate-500">{i.label}</p>
            </div>
          ))}
        </div>

        {/* Gallery */}
        <h3 className="font-display text-2xl font-bold text-deep-navy mb-5">Hospital Gallery</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
          {['/images/facility-room.jpg', '/images/facility-ot.jpg', '/images/facility-icu.jpg', '/images/facility-lab.jpg'].map((src, i) => (
            <motion.div key={src} whileHover={{ scale: 1.03 }} className="rounded-2xl overflow-hidden shadow-soft h-40">
              <img src={src} alt="" className="w-full h-full object-cover" />
            </motion.div>
          ))}
        </div>

        {/* Quality + accreditation placeholder */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card-premium p-6">
            <Award className="text-medical-teal mb-3" size={28} />
            <h4 className="font-display font-bold text-lg">Quality & Safety Standards</h4>
            <p className="text-sm text-slate-500 mt-2">We follow standardized clinical protocols, infection-control guidelines and continuous staff training to maintain the highest standards of patient safety.</p>
          </div>
          <div className="card-premium p-6 border-dashed">
            <Award className="text-slate-300 mb-3" size={28} />
            <h4 className="font-display font-bold text-lg text-slate-500">Accreditation</h4>
            <p className="text-sm text-slate-400 mt-2">Editable placeholder — add verified accreditation / certification details here before publication. Do not display unverified claims.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
