import { motion } from 'framer-motion';
import { UserCheck, CalendarDays, Ticket, Star } from 'lucide-react';
import { SectionHeading } from '../ui/primitives';

const steps = [
  { Icon: UserCheck, title: 'Choose Specialist', desc: 'Browse departments and pick the right consultant for your needs.' },
  { Icon: CalendarDays, title: 'Select Date & Time', desc: 'Pick a convenient slot — the system checks live availability.' },
  { Icon: Ticket, title: 'Receive Token & Confirmation', desc: 'Get a digital OPD token and WhatsApp confirmation instantly.' },
  { Icon: Star, title: 'Priority Consultation', desc: 'Walk in, get called by your token, and meet your doctor without queues.' },
];

export default function HowItWorks() {
  return (
    <section className="section-pad bg-ice-mint/40">
      <div className="container-x px-4">
        <SectionHeading eyebrow="Simple Process" title="How Online Booking Works" />
        <div className="relative grid md:grid-cols-4 gap-6">
          <div className="hidden md:block absolute top-14 left-0 right-0 h-0.5 bg-gradient-to-r from-medical-teal via-royal-blue to-medical-teal opacity-30" />
          {steps.map((s, i) => (
            <motion.div key={s.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="relative text-center">
              <div className="relative z-10 mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-medical-teal to-royal-blue text-white grid place-items-center shadow-premium">
                <s.Icon size={30} />
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-deep-navy text-white text-sm font-bold grid place-items-center">{i + 1}</span>
              </div>
              <h3 className="font-display font-bold text-deep-navy mt-4">{s.title}</h3>
              <p className="text-sm text-slate-500 mt-1.5 px-2">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
