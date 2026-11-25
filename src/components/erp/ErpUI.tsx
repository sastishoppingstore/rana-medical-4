import { ReactNode } from 'react';
import { motion } from 'framer-motion';

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-deep-navy">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function KpiCard({ label, value, sub, Icon, accent = 'from-medical-teal to-royal-blue', trend }: { label: string; value: string | number; sub?: string; Icon: any; accent?: string; trend?: string }) {
  return (
    <motion.div whileHover={{ y: -4 }} className="card-premium p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
          <p className="font-display text-2xl font-extrabold text-deep-navy mt-1">{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
        <span className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${accent} text-white grid place-items-center shadow-premium`}><Icon size={20} /></span>
      </div>
      {trend && <p className="text-xs text-emerald-600 font-semibold mt-2">{trend}</p>}
    </motion.div>
  );
}

export function ErpCard({ title, children, className = '' }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <div className={`card-premium p-5 ${className}`}>
      {title && <h3 className="font-display font-bold text-deep-navy mb-4">{title}</h3>}
      {children}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    waiting: 'bg-amber-100 text-amber-700',
    with_doctor: 'bg-blue-100 text-blue-700',
    completed: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-700',
    active: 'bg-emerald-100 text-emerald-700',
    occupied: 'bg-red-100 text-red-700',
    available: 'bg-emerald-100 text-emerald-700',
    maintenance: 'bg-amber-100 text-amber-700',
    pending: 'bg-amber-100 text-amber-700',
    verified: 'bg-blue-100 text-blue-700',
    published: 'bg-emerald-100 text-emerald-700',
    collected: 'bg-blue-100 text-blue-700',
    entered: 'bg-purple-100 text-purple-700',
    discharged: 'bg-slate-100 text-slate-600',
    admitted: 'bg-emerald-100 text-emerald-700',
    open: 'bg-amber-100 text-amber-700',
    resolved: 'bg-emerald-100 text-emerald-700',
  };
  return <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${map[status] || 'bg-slate-100 text-slate-600'}`}>{status.replace('_', ' ')}</span>;
}

export function Empty({ msg = 'No records found.' }: { msg?: string }) {
  return <div className="text-center py-10 text-sm text-slate-400">{msg}</div>;
}

export function Spinner({ label }: { label?: string }) {
  return <div className="flex flex-col items-center justify-center py-12 text-slate-400"><div className="spinner" />{label && <p className="mt-3 text-sm">{label}</p>}</div>;
}
