import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, Ambulance, Scissors, Scan, Baby, HeartPulse, Bone, Smile, Dumbbell, ArrowRight, Activity, Pill, Eye, Brain } from 'lucide-react';
import { api } from '../../lib/api';
import { SectionHeading, Spinner, EmptyState } from '../ui/primitives';

const ICONS: Record<string, any> = {
  Stethoscope, Ambulance, Scissors, Scan, Baby, HeartPulse, Bone, Tooth: Smile, Dumbbell,
  Activity, Pill, Eye, Brain,
};

interface Service { id: number; title: string; description: string; icon: string; image_url: string }

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/services').then(setServices).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <section id="services" className="section-pad bg-ice-mint/40">
      <div className="container-x px-4">
        <SectionHeading eyebrow="What We Offer" title="Comprehensive Medical Services" subtitle="From routine OPD clinics to complex surgery — every service is delivered by specialists using modern technology." />
        {loading ? <Spinner /> : services.length === 0 ? <EmptyState message="No services listed yet." /> : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((s, i) => {
              const Icon = ICONS[s.icon] || Stethoscope;
              return (
                <motion.div key={s.id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 3) * 0.08 }}
                  whileHover={{ y: -8 }} className="card-premium overflow-hidden group">
                  <div className="relative h-40 overflow-hidden">
                    <img src={s.image_url || '/images/facility-lab.jpg'} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-deep-navy/70 to-transparent" />
                    <span className="absolute top-3 left-3 w-11 h-11 rounded-xl bg-white/90 text-medical-teal grid place-items-center shadow"><Icon size={22} /></span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-display font-bold text-lg text-deep-navy">{s.title}</h3>
                    <p className="text-sm text-slate-500 mt-1.5 leading-relaxed line-clamp-3">{s.description}</p>
                    <div className="mt-4 flex gap-2">
                      <a href={`#appointment`} className="text-sm font-semibold text-medical-teal flex items-center gap-1 hover:gap-2 transition-all">Book Service <ArrowRight size={15} /></a>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
