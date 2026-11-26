import { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

/* ---------- TOAST ---------- */
type ToastType = 'success' | 'error' | 'info';
interface ToastItem { id: number; message: string; type: ToastType; }
const ToastCtx = createContext<(message: string, type?: ToastType) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const push = (message: string, type: ToastType = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  };
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="fixed top-5 right-5 z-[100] flex flex-col gap-3 w-[min(92vw,360px)]">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div key={t.id} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
              className={`glass rounded-2xl shadow-premium px-4 py-3 flex items-start gap-3 ${t.type === 'error' ? 'border-red-300' : t.type === 'info' ? 'border-[#d9d3e8]' : 'border-[#e3b6bc]'}`}>
              {t.type === 'success' ? <CheckCircle2 className="text-medical-teal mt-0.5" size={20} /> :
               t.type === 'error' ? <AlertTriangle className="text-red-500 mt-0.5" size={20} /> :
               <Info className="text-royal-blue mt-0.5" size={20} />}
              <span className="text-sm font-medium text-deep-navy flex-1">{t.message}</span>
              <button onClick={() => setToasts((arr) => arr.filter((x) => x.id !== t.id))}><X size={16} className="text-slate-400" /></button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}

/* ---------- SPINNER ---------- */
export const Spinner = ({ label }: { label?: string }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-400">
    <div className="spinner" />
    {label && <p className="text-sm">{label}</p>}
  </div>
);

/* ---------- MODAL ---------- */
export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title?: string; children: ReactNode; wide?: boolean }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-deep-navy/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className={`relative glass rounded-3xl shadow-premium w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} max-h-[90vh] overflow-y-auto p-6`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl font-bold text-deep-navy">{title}</h3>
          <button onClick={onClose} className="btn-ghost !p-2 !rounded-full"><X size={18} /></button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

/* ---------- SCROLL REVEAL ---------- */
export function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); obs.disconnect(); } }, { threshold: 0.12 });
    obs.observe(el); return () => obs.disconnect();
  }, []);
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 28 }} animate={shown ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay }}>
      {children}
    </motion.div>
  );
}

/* ---------- SECTION HEADING ---------- */
export function SectionHeading({ eyebrow, title, subtitle, align = 'center' }: { eyebrow?: string; title: string; subtitle?: string; align?: 'center' | 'left' }) {
  return (
    <div className={align === 'center' ? 'text-center max-w-2xl mx-auto mb-12' : 'mb-12'}>
      {eyebrow && <span className="inline-block text-xs font-bold tracking-widest uppercase text-medical-teal bg-ice-mint px-3 py-1 rounded-full mb-3">{eyebrow}</span>}
      <h2 className="font-display text-3xl md:text-4xl font-extrabold text-deep-navy leading-tight">{title}</h2>
      {subtitle && <p className="mt-3 text-slate-500 leading-relaxed">{subtitle}</p>}
    </div>
  );
}

/* ---------- EMPTY STATE ---------- */
export const EmptyState = ({ message }: { message: string }) => (
  <div className="text-center py-12 text-slate-400 text-sm">{message}</div>
);
