import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, MessageCircle, CalendarPlus, Sparkles } from 'lucide-react';
import { api } from '../../lib/api';
import { SectionHeading, Spinner, EmptyState } from '../ui/primitives';
import { PKR, HOSPITAL } from '../../lib/format';

interface Pkg { id: number; title: string; price_pkr: number; description: string; tests: string[]; consultations: string; is_popular?: boolean }

export default function Packages() {
  const [pkgs, setPkgs] = useState<Pkg[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/packages').then(setPkgs).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <section id="packages" className="section-pad">
      <div className="container-x px-4">
        <SectionHeading eyebrow="Health Packages" title="Preventive Care, Made Affordable" subtitle="Comprehensive check-up packages with transparent pricing. All prices editable from the ERP CMS." />
        {loading ? <Spinner /> : pkgs.length === 0 ? <EmptyState message="No packages available." /> : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pkgs.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 3) * 0.08 }}
                className={`card-premium p-7 relative flex flex-col ${p.is_popular ? 'ring-2 ring-medical-teal shadow-premium' : ''}`}>
                {p.is_popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-medical-teal to-royal-blue text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1"><Sparkles size={12} /> Most Popular</span>}
                <h3 className="font-display font-bold text-xl text-deep-navy">{p.title}</h3>
                <p className="text-sm text-slate-500 mt-1">{p.description}</p>
                <div className="my-4">
                  <span className="font-display text-3xl font-extrabold text-medical-teal">{PKR(p.price_pkr)}</span>
                </div>
                <ul className="space-y-2 text-sm flex-1">
                  {(p.tests || []).slice(0, 6).map((t) => (
                    <li key={t} className="flex gap-2 text-slate-600"><Check size={16} className="text-medical-teal mt-0.5 shrink-0" /> {t}</li>
                  ))}
                  {p.consultations && <li className="flex gap-2 text-slate-600"><Check size={16} className="text-medical-teal mt-0.5 shrink-0" /> {p.consultations}</li>}
                </ul>
                <div className="mt-5 flex flex-col gap-2">
                  <a href="#appointment" className="btn-primary w-full"><CalendarPlus size={16} /> Book Now</a>
                  <a href={`${HOSPITAL.whatsapp}?text=${encodeURIComponent('Inquiry about ' + p.title + ' package')}`} target="_blank" rel="noreferrer" className="btn-ghost w-full text-sm"><MessageCircle size={16} className="text-[#c02736]" /> WhatsApp Inquiry</a>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        <p className="text-center text-xs text-slate-400 mt-6">Package prices are editable demo values managed from the ERP CMS.</p>
      </div>
    </section>
  );
}
