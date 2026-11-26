import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Ambulance, Stethoscope, Microscope, Baby, Phone, MessageCircle, ArrowRight, ShieldCheck, HeartPulse, Activity } from 'lucide-react';
import { HOSPITAL } from '../../lib/format';

const FACES = [
  {
    key: 'emergency', cls: 'cube-face--teal', Icon: Ambulance,
    title: 'Emergency Care', tag: '24/7 Emergency', desc: 'Rapid trauma & ambulance response around the clock.',
    btn: 'Emergency Contact', href: HOSPITAL.tel,
  },
  {
    key: 'doctors', cls: 'cube-face--blue', Icon: Stethoscope,
    title: 'Specialist Doctors', tag: 'Expert Specialists', desc: '35+ consultants across every major discipline.',
    btn: 'View Doctors', href: '#doctors',
  },
  {
    key: 'lab', cls: 'cube-face--navy', Icon: Microscope,
    title: 'Advanced Lab', tag: 'Digital Lab Reports', desc: 'Fully automated pathology with online reports.',
    btn: 'View Lab Services', href: '#lab',
  },
  {
    key: 'maternity', cls: 'cube-face--mint', Icon: Baby,
    title: 'Maternity & Child', tag: 'Gyne & Pediatrics', desc: 'Specialized, gentle care for mother & child.',
    btn: 'Book Consultation', href: '#appointment',
  },
];

function Cube() {
  const [size, setSize] = useState(typeof window !== 'undefined' && window.innerWidth >= 768 ? 380 : 320);
  const rot = useRef({ x: -12, y: 0 });
  const target = useRef({ x: -12, y: 0 });
  const drag = useRef<{ active: boolean; lx: number; ly: number }>({ active: false, lx: 0, ly: 0 });
  const hover = useRef(false);
  const parallax = useRef({ x: 0, y: 0 });
  const cubeRef = useRef<HTMLDivElement>(null);
  const raf = useRef<number>(0);

  useEffect(() => {
    const onResize = () => setSize(window.innerWidth >= 768 ? 380 : 320);
    window.addEventListener('resize', onResize);
    const loop = () => {
      if (!drag.current.active && !hover.current) target.current.y += 0.28;
      // ease toward target
      rot.current.y += (target.current.y - rot.current.y) * 0.12;
      rot.current.x += (target.current.x - rot.current.x) * 0.12;
      if (cubeRef.current) {
        const px = parallax.current.x;
        const py = parallax.current.y;
        cubeRef.current.style.transform = `rotateX(${rot.current.x + py}deg) rotateY(${rot.current.y + px}deg)`;
      }
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener('resize', onResize); };
  }, []);

  const onDown = (e: React.PointerEvent) => {
    drag.current.active = true;
    drag.current.lx = e.clientX; drag.current.ly = e.clientY;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (drag.current.active) {
      const dx = e.clientX - drag.current.lx;
      const dy = e.clientY - drag.current.ly;
      drag.current.lx = e.clientX; drag.current.ly = e.clientY;
      target.current.y += dx * 0.5;
      target.current.x = Math.max(-60, Math.min(60, target.current.x - dy * 0.4));
    } else {
      const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
      parallax.current.x = ((e.clientX - r.left) / r.width - 0.5) * 14;
      parallax.current.y = ((e.clientY - r.top) / r.height - 0.5) * -10;
    }
  };
  const onUp = () => { drag.current.active = false; };

  const h = size / 2;
  const transforms: Record<string, string> = {
    front: `translateZ(${h}px)`,
    back: `rotateY(180deg) translateZ(${h}px)`,
    right: `rotateY(90deg) translateZ(${h}px)`,
    left: `rotateY(-90deg) translateZ(${h}px)`,
    top: `rotateX(90deg) translateZ(${h}px)`,
    bottom: `rotateX(-90deg) translateZ(${h}px)`,
  };

  return (
    <div className="cube-scene relative mx-auto"
      onMouseEnter={() => (hover.current = true)}
      onMouseLeave={() => { hover.current = false; parallax.current = { x: 0, y: 0 }; }}
      onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}>
      <div ref={cubeRef} className="cube">
        {FACES.map((f) => (
          <div key={f.key} className={`cube-face ${f.cls}`} style={{ transform: transforms[f.key] }}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-widest opacity-80">{f.tag}</span>
              <span className="w-10 h-10 rounded-xl bg-white/20 grid place-items-center"><f.Icon size={20} /></span>
            </div>
            <div>
              <h3 className="font-display text-2xl font-extrabold mb-1">{f.title}</h3>
              <p className="text-sm opacity-90 leading-snug">{f.desc}</p>
            </div>
            <a href={f.href} className={`inline-flex items-center gap-1.5 text-sm font-bold ${f.key === 'maternity' ? 'text-medical-teal' : 'text-white'} bg-white/15 hover:bg-white/25 transition px-3 py-2 rounded-full w-fit`}>
              {f.btn} <ArrowRight size={15} />
            </a>
          </div>
        ))}
        {/* top / bottom subtle glass panels */}
        <div className="cube-face cube-face--glass" style={{ transform: transforms.top }}>
          <div className="m-auto text-center">
            <ShieldCheck className="mx-auto text-medical-teal" size={34} />
            <p className="font-display font-bold text-deep-navy mt-2">Trusted Care</p>
          </div>
        </div>
        <div className="cube-face cube-face--glass" style={{ transform: transforms.bottom }}>
          <div className="m-auto text-center">
            <HeartPulse className="mx-auto text-royal-blue" size={34} />
            <p className="font-display font-bold text-deep-navy mt-2">Digital Health</p>
          </div>
        </div>
      </div>

      {/* floating particles */}
      <FloatingBits size={size} />
    </div>
  );
}

function FloatingBits({ size }: { size: number }) {
  const bits = [
    { Icon: HeartPulse, cls: 'text-rose-500 bg-white', top: '-6%', left: '8%', s: 40 },
    { Icon: Activity, cls: 'text-medical-teal bg-white', top: '12%', right: '-4%', s: 36 },
    { Icon: ShieldCheck, cls: 'text-royal-blue bg-white', bottom: '6%', left: '-2%', s: 38 },
    { Icon: Stethoscope, cls: 'text-[#a02030] bg-white', bottom: '-4%', right: '10%', s: 34 },
  ];
  return (
    <>
      {bits.map((b, i) => (
        <motion.div key={i}
          className={`absolute ${b.cls} rounded-2xl shadow-soft grid place-items-center`}
          style={{ top: b.top, left: b.left, right: b.right, bottom: b.bottom, width: b.s, height: b.s }}
          animate={{ y: [0, -12, 0] }} transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut' }}>
          <b.Icon size={b.s * 0.5} />
        </motion.div>
      ))}
    </>
  );
}

export default function Hero3D() {
  return (
    <section id="home" className="relative overflow-hidden hero-grid">
      <div className="absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full bg-medical-teal/20 blur-3xl" />
      <div className="absolute -bottom-32 -right-24 w-[460px] h-[460px] rounded-full bg-royal-blue/20 blur-3xl" />
      <div className="container-x grid lg:grid-cols-2 gap-10 items-center px-4 py-16 md:py-24 relative">
        {/* LEFT */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-medical-teal bg-ice-mint px-3 py-1.5 rounded-full mb-5">
            <span className="w-2 h-2 rounded-full bg-medical-teal animate-pulse" /> Accredited Digital Hospital
          </span>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold text-deep-navy leading-[1.05]">
            Compassionate Care, <span className="gradient-text">Advanced Medical Excellence</span>
          </h1>
          <p className="mt-5 text-lg text-slate-500 max-w-xl leading-relaxed">
            Your health deserves expert attention, modern diagnostics and compassionate treatment. Experience trusted healthcare at Rana Medical Hospital.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#appointment" className="btn-primary">Book Online Appointment</a>
            <a href={HOSPITAL.whatsapp} target="_blank" rel="noreferrer" className="btn-ghost">
              <MessageCircle size={18} className="text-[#c02736]" /> WhatsApp Emergency
            </a>
            <a href="#services" className="btn-ghost">Explore Our Services</a>
          </div>
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { Icon: Phone, label: '24/7 Emergency' },
              { Icon: Stethoscope, label: 'Expert Team' },
              { Icon: Microscope, label: 'Advanced Diagnostics' },
              { Icon: Activity, label: 'Digital Healthcare' },
            ].map((t) => (
              <div key={t.label} className="glass rounded-2xl p-3 flex items-center gap-2">
                <t.Icon size={18} className="text-medical-teal" />
                <span className="text-xs font-semibold text-deep-navy">{t.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* RIGHT */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.1 }}
          className="relative flex justify-center">
          <Cube />
        </motion.div>
      </div>
    </section>
  );
}
