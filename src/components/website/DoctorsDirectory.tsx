import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CalendarClock, IndianRupee, BadgeCheck, ChevronRight } from 'lucide-react';
import { api } from '../../lib/api';
import { SectionHeading, Spinner, EmptyState } from '../ui/primitives';
import Avatar from '../ui/Avatar';
import { PKR } from '../../lib/format';

const FILTERS = ['All', 'Medicine', 'Surgery', 'Gynecology', 'Child Specialist', 'Cardiology', 'Orthopedics'];

interface Doctor {
  id: number; name: string; specialty: string; category: string; qualifications: string;
  pmdc: string; experience: number; fee: number; opd_days: string; opd_timings: string; available_slots: number;
}

export default function DoctorsDirectory() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    api.get('/api/doctors').then(setDoctors).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () => filter === 'All' ? doctors : doctors.filter((d) => d.category === filter),
    [doctors, filter]
  );

  return (
    <section id="doctors" className="section-pad bg-ice-mint/40">
      <div className="container-x px-4">
        <SectionHeading eyebrow="Specialist Doctors" title="Meet Our Consultants" subtitle="Search and filter our panel of expert specialists. Booking a doctor updates the live appointment finder." />
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition ${filter === f ? 'bg-medical-teal text-white shadow-premium' : 'bg-white text-slate-600 border border-soft-border hover:border-medical-teal'}`}>
              {f}
            </button>
          ))}
        </div>

        {loading ? <Spinner /> : filtered.length === 0 ? <EmptyState message="No doctors found for this specialty." /> : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((d, i) => (
              <motion.div key={d.id} initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 3) * 0.06 }}
                className="card-premium p-6 hover:shadow-premium transition">
                <div className="flex items-center gap-4">
                  <Avatar name={d.name} size={60} />
                  <div>
                    <h3 className="font-display font-bold text-deep-navy">{d.name}</h3>
                    <p className="text-sm text-medical-teal font-semibold">{d.specialty}</p>
                    <p className="text-xs text-slate-400">{d.qualifications}</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-400">Experience</span><b>{d.experience} yrs</b></div>
                  <div className="flex justify-between"><span className="text-slate-400">Consultation</span><b className="text-medical-teal flex items-center gap-1"><IndianRupee size={14} />{PKR(d.fee).replace('Rs. ', '')}</b></div>
                  <div className="flex justify-between"><span className="text-slate-400">OPD Days</span><b className="text-right max-w-[60%]">{d.opd_days}</b></div>
                  <div className="flex justify-between"><span className="text-slate-400">Timings</span><b>{d.opd_timings}</b></div>
                  <div className="flex justify-between items-center"><span className="text-slate-400">PMDC</span><span className="text-xs text-slate-400 flex items-center gap-1"><BadgeCheck size={13} /> {d.pmdc || '—'}</span></div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#a02030]">{d.available_slots} slots available</span>
                  <a href="#appointment" className="btn-primary !py-2 !px-4 text-sm">Book <ChevronRight size={15} /></a>
                </div>
                <p className="text-[10px] text-slate-300 mt-3">Demo profile — fictional PMDC references are placeholders.</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
