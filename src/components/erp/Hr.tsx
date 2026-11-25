import { useEffect, useState } from 'react';
import { Users, Stethoscope, Wallet, CalendarCheck, Plus, Pencil, Save } from 'lucide-react';
import { api } from '../../lib/api';
import { PageHeader, ErpCard, Spinner, Empty, StatusBadge } from './ErpUI';
import { useToast } from '../ui/primitives';
import { PKR } from '../../lib/format';

interface Emp { id: number; name: string; designation: string; department: string; role: string; phone: string; salary: number; commission_pct: number; is_active: boolean }

export default function Hr() {
  const toast = useToast();
  const [emps, setEmps] = useState<Emp[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', designation: '', department: '', role: 'staff', phone: '', salary: '', commission_pct: '0' });
  const [editing, setEditing] = useState<number | null>(null);
  const [editVals, setEditVals] = useState({ salary: 0, commission_pct: 0 });

  const load = async () => {
    setLoading(true);
    try { const e = await api.get('/api/employees'); setEmps(e); }
    catch { toast('Failed to load HR', 'error'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const totalPayroll = emps.filter((e) => e.is_active).reduce((s, e) => s + Number(e.salary || 0), 0);
  const doctors = emps.filter((e) => e.role === 'doctor');

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast('Name required', 'error'); return; }
    try {
      const emp = await api.post('/api/employees', { ...form, salary: Number(form.salary), commission_pct: Number(form.commission_pct) });
      setEmps((prev) => [emp, ...prev]);
      setForm({ name: '', designation: '', department: '', role: 'staff', phone: '', salary: '', commission_pct: '0' });
      toast('Employee added', 'success');
    } catch (e: any) { toast(e.message, 'error'); }
  };

  const startEdit = (e: Emp) => { setEditing(e.id); setEditVals({ salary: e.salary, commission_pct: e.commission_pct }); };
  const saveEdit = async (id: number) => {
    try {
      const emp = await api.put('/api/employees', { id, ...editVals });
      setEmps((prev) => prev.map((x) => x.id === id ? emp : x));
      setEditing(null);
      toast('Updated', 'success');
    } catch (e: any) { toast(e.message, 'error'); }
  };

  if (loading) return <Spinner label="Loading HR…" />;

  return (
    <div>
      <PageHeader title="HR, Commission & Payroll" subtitle="Manage staff, configure doctor commissions and compute payroll." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <ErpCard><p className="text-xs text-slate-400">Employees</p><p className="font-display text-2xl font-extrabold">{emps.length}</p></ErpCard>
        <ErpCard><p className="text-xs text-slate-400">Doctors</p><p className="font-display text-2xl font-extrabold text-medical-teal">{doctors.length}</p></ErpCard>
        <ErpCard><p className="text-xs text-slate-400">Monthly Payroll</p><p className="font-display text-2xl font-extrabold">{PKR(totalPayroll)}</p></ErpCard>
        <ErpCard><p className="text-xs text-slate-400">Avg Commission</p><p className="font-display text-2xl font-extrabold text-royal-blue">{doctors.length ? (doctors.reduce((s, d) => s + d.commission_pct, 0) / doctors.length).toFixed(1) : '0'}%</p></ErpCard>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <ErpCard title="Add Employee">
          <form onSubmit={add} className="space-y-3">
            <input className="input-field" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <input className="input-field" placeholder="Designation" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
              <input className="input-field" placeholder="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <select className="input-field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="staff">Staff</option><option value="doctor">Doctor</option><option value="nurse">Nurse</option>
              </select>
              <input className="input-field" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input className="input-field" type="number" placeholder="Salary PKR" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} />
              <input className="input-field" type="number" placeholder="Commission %" value={form.commission_pct} onChange={(e) => setForm({ ...form, commission_pct: e.target.value })} />
            </div>
            <button className="btn-primary w-full"><Plus size={16} /> Add Employee</button>
          </form>
        </ErpCard>

        <ErpCard title="Employee Directory" className="lg:col-span-2">
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {emps.length === 0 && <Empty msg="No employees yet." />}
            {emps.map((e) => (
              <div key={e.id} className="border border-soft-border rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-medical-teal to-royal-blue text-white grid place-items-center font-bold">{e.name[0]}</div>
                    <div className="text-sm">
                      <p className="font-semibold">{e.name}</p>
                      <p className="text-xs text-slate-500">{e.designation} · {e.department}</p>
                    </div>
                  </div>
                  <StatusBadge status={e.is_active ? 'active' : 'cancelled'} />
                </div>
                {editing === e.id ? (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <input className="input-field !py-1.5" type="number" value={editVals.salary} onChange={(e) => setEditVals({ ...editVals, salary: Number(e.target.value) })} />
                    <input className="input-field !py-1.5" type="number" value={editVals.commission_pct} onChange={(e) => setEditVals({ ...editVals, commission_pct: Number(e.target.value) })} />
                    <button onClick={() => saveEdit(e.id)} className="btn-primary !py-1.5 col-span-2"><Save size={14} /> Save</button>
                  </div>
                ) : (
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                    <span>{PKR(e.salary)}/mo · Commission {e.commission_pct}%</span>
                    <button onClick={() => startEdit(e)} className="text-medical-teal flex items-center gap-1"><Pencil size={13} /> Edit</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ErpCard>
      </div>
    </div>
  );
}
