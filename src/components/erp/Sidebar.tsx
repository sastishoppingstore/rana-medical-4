import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Ticket, BedDouble, FileText, FlaskConical, Pill, Calculator, Users, Settings, Stethoscope, X } from 'lucide-react';
import { useAuth, Role } from '../../context/AuthContext';

const NAV: { to: string; label: string; Icon: any; roles: Role[] }[] = [
  { to: '/erp', label: 'Dashboard', Icon: LayoutDashboard, roles: ['super_admin', 'doctor', 'receptionist', 'lab_technician', 'pharmacist', 'accountant'] },
  { to: '/erp/opd', label: 'OPD & Tokens', Icon: Ticket, roles: ['super_admin', 'receptionist', 'doctor'] },
  { to: '/erp/ipd', label: 'IPD & Beds', Icon: BedDouble, roles: ['super_admin', 'receptionist', 'doctor'] },
  { to: '/erp/emr', label: 'Doctor EMR', Icon: FileText, roles: ['super_admin', 'doctor'] },
  { to: '/erp/lab', label: 'Laboratory', Icon: FlaskConical, roles: ['super_admin', 'lab_technician', 'doctor'] },
  { to: '/erp/pharmacy', label: 'Pharmacy POS', Icon: Pill, roles: ['super_admin', 'pharmacist'] },
  { to: '/erp/accounts', label: 'Accounts', Icon: Calculator, roles: ['super_admin', 'accountant'] },
  { to: '/erp/hr', label: 'HR & Payroll', Icon: Users, roles: ['super_admin', 'accountant'] },
  { to: '/erp/cms', label: 'Website CMS', Icon: Settings, roles: ['super_admin'] },
];

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { activeRole } = useAuth();
  const items = NAV.filter((n) => n.roles.includes(activeRole));

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onClose} />}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-deep-navy text-white flex flex-col transition-transform ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center gap-2.5 p-5 border-b border-white/10">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-medical-teal to-royal-blue grid place-items-center"><Stethoscope size={20} /></span>
          <div>
            <p className="font-display font-bold leading-tight">Rana ERP</p>
            <p className="text-[10px] text-white/50">Control Center</p>
          </div>
          <button className="lg:hidden ml-auto" onClick={onClose}><X size={20} /></button>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {items.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.to === '/erp'} onClick={onClose}
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${isActive ? 'bg-gradient-to-r from-medical-teal to-royal-blue text-white' : 'text-white/70 hover:bg-white/10'}`}>
              <n.Icon size={18} /> {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 text-[11px] text-white/40 border-t border-white/10">
          Demo environment · Data is synthetic.
        </div>
      </aside>
    </>
  );
}
