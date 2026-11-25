import { motion } from 'framer-motion';
import { asset } from "../../lib/assets";
import { SectionHeading, Reveal } from '../ui/primitives';
import { Activity, Radio, HeartPulse, Scissors, Baby, BedDouble, Star, Microscope } from 'lucide-react';

const facilities = [
  { title: 'Digital X-Ray', desc: 'Low-radiation digital radiography with instant imaging.', img: asset("images/facility-ot.jpg"), Icon: Activity },
  { title: '4D Ultrasound', desc: 'High-resolution imaging for obstetrics and abdomen.', img: asset("images/facility-ultrasound.jpg"), Icon: Radio },
  { title: 'ECG / Echo', desc: 'Comprehensive cardiac diagnostics and monitoring.', img: asset("images/facility-icu.jpg"), Icon: HeartPulse },
  { title: 'Modular Operation Theatre', desc: 'Sterile, laminar-flow theatres for safe surgery.', img: asset("images/facility-ot.jpg"), Icon: Scissors },
  { title: 'NICU', desc: 'Neonatal intensive care for the tiniest patients.', img: asset("images/facility-icu.jpg"), Icon: Baby },
  { title: 'Private & VIP Rooms', desc: 'Comfortable recovery spaces with hotel-grade amenities.', img: asset("images/facility-room.jpg"), Icon: BedDouble },
  { title: 'Advanced Laboratory', desc: 'Fully automated pathology with online reports.', img: asset("images/facility-lab.jpg"), Icon: Microscope },
  { title: 'ICU', desc: '24/7 critical care with multi-parameter monitoring.', img: asset("images/facility-icu.jpg"), Icon: Star },
];

export default function Facilities() {
  return (
    <section className="section-pad">
      <div className="container-x px-4">
        <SectionHeading eyebrow="Technology" title="Modern Facilities & Equipment" subtitle="Investing in the right technology so our clinicians can focus on what matters — you." />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {facilities.map((f, i) => (
            <Reveal key={f.title} delay={(i % 4) * 0.05}>
              <motion.div whileHover={{ y: -6 }} className="card-premium overflow-hidden h-full">
                <div className="h-36 overflow-hidden relative">
                  <img src={f.img} alt={f.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-deep-navy/60 to-transparent" />
                  <span className="absolute top-3 left-3 w-10 h-10 rounded-xl bg-white/90 text-medical-teal grid place-items-center"><f.Icon size={20} /></span>
                </div>
                <div className="p-5">
                  <h3 className="font-display font-bold text-deep-navy">{f.title}</h3>
                  <p className="text-sm text-slate-500 mt-1.5">{f.desc}</p>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
