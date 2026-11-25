import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Stethoscope, Mail, Lock, LogIn, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/primitives';
import { HOSPITAL } from '../lib/format';

const DEMO = { email: 'demo@ranamedical.pk', password: 'demo1234' };

export default function ErpLogin() {
  const { signIn } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const [email, setEmail] = useState(DEMO.email);
  const [password, setPassword] = useState(DEMO.password);
  const [loading, setLoading] = useState(false);

  const doLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      toast('Signed in to ERP', 'success');
      nav('/erp');
    } catch (e: any) {
      toast(e.message || 'Login failed', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-deep-navy">
      {/* Brand panel */}
      <div className="relative hidden lg:flex flex-col justify-center p-14 text-white overflow-hidden">
        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-medical-teal/30 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-royal-blue/30 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-8">
            <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-medical-teal to-royal-blue grid place-items-center"><Stethoscope size={26} /></span>
            <span className="font-display font-extrabold text-2xl">{HOSPITAL.name}</span>
          </div>
          <h1 className="font-display text-4xl font-extrabold leading-tight">Hospital ERP & Control Center</h1>
          <p className="mt-4 text-white/70 max-w-md">One unified system for OPD, IPD, EMR, Laboratory, Pharmacy, Accounts and HR — with live, real-time synchronization.</p>
          <div className="mt-8 grid grid-cols-2 gap-3 max-w-md">
            {['Real-time queues', 'Digital prescriptions', 'Pharmacy POS', 'Financial reports'].map((f) => (
              <div key={f} className="glass-dark rounded-xl px-4 py-3 text-sm">{f}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 bg-white">
        <motion.form onSubmit={doLogin} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-6 text-deep-navy">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-medical-teal to-royal-blue grid place-items-center text-white"><Stethoscope size={20} /></span>
            <span className="font-display font-extrabold">{HOSPITAL.name}</span>
          </div>
          <h2 className="font-display text-2xl font-bold text-deep-navy">Staff Login</h2>
          <p className="text-sm text-slate-500 mb-6">Access the secure ERP console.</p>

          <div className="space-y-4">
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-3 text-slate-400" />
                <input className="input-field pl-9" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@hospital.com" />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-3 text-slate-400" />
                <input type="password" className="input-field pl-9" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
            </div>
            <button className="btn-primary w-full" disabled={loading}><LogIn size={18} /> {loading ? 'Signing in…' : 'Sign In'}</button>
          </div>

          <div className="mt-6 flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
            <ShieldAlert size={16} className="mt-0.5 shrink-0" />
            <span>Demo mode: use the prefilled credentials. Role switching inside the ERP is for demonstration; production requires authenticated accounts with server-enforced permissions.</span>
          </div>

          <p className="mt-5 text-center text-sm text-slate-500">Back to <Link to="/" className="text-medical-teal font-semibold">Website</Link></p>
        </motion.form>
      </div>
    </div>
  );
}
