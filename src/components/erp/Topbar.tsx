import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Menu, LogOut, Moon, Sun, ChevronDown, Home } from 'lucide-react';
import { useAuth, ROLE_LABELS, Role } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { HOSPITAL } from '../../lib/format';

const ROLES: Role[] = ['super_admin', 'doctor', 'receptionist', 'lab_technician', 'pharmacist', 'accountant'];

export default function Topbar({ onMenu }: { onMenu: () => void }) {
  const { user, activeRole, setActiveRole, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const nav = useNavigate();
  const [roleOpen, setRoleOpen] = useState(false);

  const logout = async () => { await signOut(); nav('/login'); };

  return (
    <header className="sticky top-0 z-30 glass border-b border-soft-border">
      <div className="flex items-center gap-3 px-4 py-3">
        <button className="lg:hidden p-2" onClick={onMenu}><Menu size={20} /></button>
        <div className="relative hidden sm:block">
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          <input className="input-field !w-64 pl-9 !py-2" placeholder="Search patients, bills…" />
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Role switcher */}
          <div className="relative">
            <button onClick={() => setRoleOpen(!roleOpen)} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-soft-border hover:bg-ice-mint text-sm font-semibold">
              <span className="w-2 h-2 rounded-full bg-medical-teal" />
              {ROLE_LABELS[activeRole]}
              <ChevronDown size={14} />
            </button>
            {roleOpen && (
              <div className="absolute right-0 mt-2 w-48 card-premium p-1.5 z-50">
                <p className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase">Demo Role Switch</p>
                {ROLES.map((r) => (
                  <button key={r} onClick={() => { setActiveRole(r); setRoleOpen(false); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium hover:bg-ice-mint ${activeRole === r ? 'text-medical-teal font-bold' : 'text-slate-600'}`}>
                    {ROLE_LABELS[r]}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={toggle} className="p-2 rounded-xl border border-soft-border hover:bg-ice-mint">{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>
          <button className="p-2 rounded-xl border border-soft-border hover:bg-ice-mint relative"><Bell size={18} /><span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" /></button>
          <a href="/" className="p-2 rounded-xl border border-soft-border hover:bg-ice-mint" title="View website"><Home size={18} /></a>

          <div className="flex items-center gap-2 pl-2 border-l border-soft-border">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-medical-teal to-royal-blue text-white grid place-items-center text-sm font-bold">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="hidden sm:block leading-tight">
              <p className="text-sm font-semibold text-deep-navy">{user?.email?.split('@')[0] || 'User'}</p>
              <p className="text-[11px] text-slate-400">{ROLE_LABELS[activeRole]}</p>
            </div>
            <button onClick={logout} className="p-2 rounded-xl border border-soft-border hover:bg-red-50 hover:text-red-500" title="Logout"><LogOut size={18} /></button>
          </div>
        </div>
      </div>
    </header>
  );
}
