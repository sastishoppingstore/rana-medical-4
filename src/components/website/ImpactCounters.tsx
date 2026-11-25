import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Stethoscope, Ambulance, FlaskConical } from 'lucide-react';

const STATS = [
  { Icon: Users, value: 25000, suffix: '+', label: 'Happy Patients', color: 'from-medical-teal to-emerald-500' },
  { Icon: Stethoscope, value: 35, suffix: '+', label: 'Specialist Doctors', color: 'from-royal-blue to-sky-500' },
  { Icon: Ambulance, value: 24, suffix: '/7', label: 'Emergency & Trauma', color: 'from-red-500 to-rose-500' },
  { Icon: FlaskConical, value: 100, suffix: '%', label: 'Digital Lab & Records', color: 'from-violet-500 to-purple-500' },
];

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0; const dur = 1600; const t0 = performance.now();
        const step = (t: number) => {
          const p = Math.min(1, (t - t0) / dur);
          setN(Math.floor((1 - Math.pow(1 - p, 3)) * value));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step); obs.disconnect();
      }
    }, { threshold: 0.4 });
    obs.observe(el); return () => obs.disconnect();
  }, [value]);
  return <div ref={ref}>{n.toLocaleString()}{suffix}</div>;
}

function TiltCard({ stat }: { stat: typeof STATS[number] }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const rx = ((e.clientY - r.top) / r.height - 0.5) * -12;
    const ry = ((e.clientX - r.left) / r.width - 0.5) * 12;
    el.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  };
  const reset = () => { if (ref.current) ref.current.style.transform = 'perspective(800px) rotateX(0) rotateY(0)'; };
  return (
    <motion.div ref={ref} onMouseMove={onMove} onMouseLeave={reset}
      whileHover={{ y: -6 }}
      className="card-premium p-7 text-center transition-transform duration-200"
      style={{ transformStyle: 'preserve-3d' }}>
      <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${stat.color} text-white grid place-items-center mb-4 shadow-premium`}>
        <stat.Icon size={26} />
      </div>
      <div className="font-display text-4xl font-extrabold text-deep-navy"><Counter value={stat.value} suffix={stat.suffix} /></div>
      <p className="mt-2 text-sm font-semibold text-slate-500">{stat.label}</p>
    </motion.div>
  );
}

export default function ImpactCounters() {
  return (
    <section className="section-pad">
      <div className="container-x px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {STATS.map((s) => <TiltCard key={s.label} stat={s} />)}
        </div>
        <p className="text-center text-xs text-slate-400 mt-6">Figures shown are illustrative demo claims — replace with verified hospital statistics before publication.</p>
      </div>
    </section>
  );
}
