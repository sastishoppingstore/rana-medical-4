import { motion } from 'framer-motion';
import { BadgeIndianRupee, FlaskConical, Pill, Ticket, ShieldCheck, Sparkles } from 'lucide-react';
import { SectionHeading, Reveal } from '../ui/primitives';

const items = [
  { Icon: BadgeIndianRupee, title: 'Qualified Senior Consultants', text: 'Board-certified specialists with decades of combined clinical experience.', cls: 'md:col-span-2 md:row-span-2', big: true },
  { Icon: Sparkles, title: 'Affordable Healthcare Packages', text: 'Transparent pricing with preventive care packages for every family.', cls: '' },
  { Icon: FlaskConical, title: 'Automated Pathology Lab', text: 'Fully automated diagnostics with online report access.', cls: '' },
  { Icon: Pill, title: '24/7 Pharmacy', text: 'Round-the-clock medicines with prescription import.', cls: 'md:col-span-2' },
  { Icon: Ticket, title: 'Digital OPD Token', text: 'No paper queues — live token on your phone.', cls: '' },
  { Icon: ShieldCheck, title: 'Hygiene & ICU Standards', text: 'Infection-controlled ICUs and sterilized theatres.', cls: '' },
];

export default function WhyChooseUs() {
  return (
    <section className="section-pad">
      <div className="container-x px-4">
        <SectionHeading eyebrow="Why Choose Us" title="Healthcare, Thoughtfully Designed" subtitle="Every detail — from pricing to pharmacy — is built around the patient." />
        <div className="grid md:grid-cols-4 auto-rows-[150px] gap-4">
          {items.map((it, i) => (
            <Reveal key={it.title}>
              <motion.div whileHover={{ y: -5 }} className={`card-premium p-6 h-full flex flex-col justify-between ${it.cls} ${it.big ? 'bg-gradient-to-br from-medical-teal/10 to-royal-blue/10' : ''}`}>
                <span className={`w-12 h-12 rounded-2xl bg-gradient-to-br from-medical-teal to-royal-blue text-white grid place-items-center ${it.big ? 'w-14 h-14' : ''}`}><it.Icon size={it.big ? 26 : 22} /></span>
                <div>
                  <h3 className={`font-display font-bold text-deep-navy ${it.big ? 'text-2xl' : 'text-base'}`}>{it.title}</h3>
                  <p className={`text-slate-500 mt-1 ${it.big ? 'text-base max-w-sm' : 'text-sm'}`}>{it.text}</p>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
