import { useEffect, useState, useMemo } from 'react';
import { BedDouble, LogIn, LogOut, DoorOpen, Plus } from 'lucide-react';
import { api } from '../../lib/api';
import { PageHeader, ErpCard, Spinner, StatusBadge, Empty } from './ErpUI';
import { useToast } from '../ui/primitives';
import { PKR, todayISO } from '../../lib/format';

interface Ward { id: number; name: string; type: string }
interface Bed { id: number; ward_id: number; bed_no: string; status: string }
interface Admission { id: number; admission_id: string; patient_id: number; bed_id: number; ward_id: number; admission_date: string; status: string; daily_charge: number; patient_name?: string }

export default function IpdBeds() {
  const toast = useToast();
  const [wards, setWards] = useState<Ward[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdmit, setShowAdmit] = useState(false);
  const [form, setForm] = useState({ patient_id: '', ward_id: '', bed_id: '', daily_charge: '' });

  const load = async () => {
    setLoading(true);
    try {
      const [w, b, a, p] = await Promise.all([
        api.get('/api/wards'), api.get('/api/beds'), api.get('/api/admissions?status=admitted'), api.get('/api/patients'),
      ]);
      setWards(w); setBeds(b); setAdmissions(a); setPatients(p);
    } catch { toast('Failed to load IPD data', 'error'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const wardMap = useMemo(() => Object.fromEntries(wards.map((w) => [w.id, w])), [wards]);
  const admMap = useMemo(() => Object.fromEntries(admissions.map((a) => [a.bed_id, a])), [admissions]);
  const patientMap = useMemo(() => Object.fromEntries(patients.map((p) => [p.id, p])), [patients]);

  const bedsForWard = (wid: number) => beds.filter((b) => b.ward_id === wid);
  const availableBeds = (wid: number) => beds.filter((b) => b.ward_id === wid && b.status === 'available');

  const admit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patient_id || !form.bed_id) { toast('Select patient and bed', 'error'); return; }
    try {
      const a = await api.post('/api/admissions', {
        patient_id: Number(form.patient_id), bed_id: Number(form.bed_id),
        ward_id: Number(form.ward_id), daily_charge: Number(form.daily_charge) || 0,
      });
      setAdmissions((prev) => [a, ...prev]);
      setBeds((prev) => prev.map((b) => b.id === Number(form.bed_id) ? { ...b, status: 'occupied' } : b));
      setShowAdmit(false); setForm({ patient_id: '', ward_id: '', bed_id: '', daily_charge: '' });
      toast('Patient admitted', 'success');
    } catch (e: any) { toast(e.message, 'error'); }
  };

  const discharge = async (adm: Admission) => {
    try {
      await api.put('/api/admissions', { id: adm.id, status: 'discharged', discharge_date: todayISO() });
      setAdmissions((prev) => prev.filter((x) => x.id !== adm.id));
      setBeds((prev) => prev.map((b) => b.id === adm.bed_id ? { ...b, status: 'available' } : b));
      toast('Discharged — bed released', 'success');
    } catch (e: any) { toast(e.message, 'error'); }
  };

  if (loading) return <Spinner label="Loading wards…" />;

  const occupied = beds.filter((b) => b.status === 'occupied').length;

  return (
    <div>
      <PageHeader title="IPD, Wards & Bed Management" subtitle="Live bed occupancy, admissions and discharges." action={
        <button onClick={() => setShowAdmit(true)} className="btn-primary"><Plus size={16} /> Admit Patient</button>
      } />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <ErpCard><p className="text-xs text-slate-400">Total Beds</p><p className="font-display text-2xl font-extrabold">{beds.length}</p></ErpCard>
        <ErpCard><p className="text-xs text-slate-400">Occupied</p><p className="font-display text-2xl font-extrabold text-red-500">{occupied}</p></ErpCard>
        <ErpCard><p className="text-xs text-slate-400">Available</p><p className="font-display text-2xl font-extrabold text-[#c02736]">{beds.length - occupied}</p></ErpCard>
        <ErpCard><p className="text-xs text-slate-400">Active Admissions</p><p className="font-display text-2xl font-extrabold">{admissions.length}</p></ErpCard>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {wards.map((w) => (
          <ErpCard key={w.id} title={`${w.name} · ${w.type}`}>
            <div className="grid grid-cols-4 gap-2">
              {bedsForWard(w.id).map((b) => {
                const adm = admMap[b.id];
                return (
                  <div key={b.id} title={b.bed_no} className={`aspect-square rounded-xl grid place-items-center text-xs font-bold border ${
                    b.status === 'occupied' ? 'bg-red-50 border-red-200 text-red-600' : b.status === 'maintenance' ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-[#fdeef0] border-[#f7d3d8] text-[#a02030]'
                  }`}>
                    <div className="text-center">
                      <BedDouble size={16} className="mx-auto" />
                      {b.bed_no}
                    </div>
                  </div>
                );
              })}
            </div>
            {bedsForWard(w.id).length === 0 && <Empty msg="No beds in this ward." />}
          </ErpCard>
        ))}
      </div>

      {/* Active admissions */}
      <ErpCard title="Active Admissions" className="mt-5">
        <div className="space-y-2">
          {admissions.length === 0 && <Empty msg="No active admissions." />}
          {admissions.map((a) => (
            <div key={a.id} className="flex items-center justify-between border border-soft-border rounded-xl p-3">
              <div className="text-sm">
                <p className="font-semibold">{patientMap[a.patient_id]?.name || 'Patient'}</p>
                <p className="text-xs text-slate-500">{a.admission_id} · {wardMap[a.ward_id]?.name} · {PKR(a.daily_charge)}/day · {a.admission_date}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={a.status} />
                <button onClick={() => discharge(a)} className="btn-ghost !py-1.5 !px-3 text-xs text-red-500"><LogOut size={14} /> Discharge</button>
              </div>
            </div>
          ))}
        </div>
      </ErpCard>

      {/* Admit modal */}
      {showAdmit && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAdmit(false)} />
          <form onSubmit={admit} className="relative card-premium p-6 w-full max-w-md">
            <h3 className="font-display font-bold text-lg mb-4">Admit Patient</h3>
            <div className="space-y-3">
              <div>
                <label className="label">Patient</label>
                <select className="input-field" value={form.patient_id} onChange={(e) => setForm({ ...form, patient_id: e.target.value })}>
                  <option value="">Select patient</option>
                  {patients.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.mobile}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Ward</label>
                <select className="input-field" value={form.ward_id} onChange={(e) => setForm({ ...form, ward_id: e.target.value, bed_id: '' })}>
                  <option value="">Select ward</option>
                  {wards.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Bed</label>
                <select className="input-field" value={form.bed_id} onChange={(e) => setForm({ ...form, bed_id: e.target.value })} disabled={!form.ward_id}>
                  <option value="">{form.ward_id ? 'Select available bed' : 'Select ward first'}</option>
                  {availableBeds(Number(form.ward_id)).map((b) => <option key={b.id} value={b.id}>{b.bed_no}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Daily Charge (PKR)</label>
                <input type="number" className="input-field" value={form.daily_charge} onChange={(e) => setForm({ ...form, daily_charge: e.target.value })} placeholder="e.g. 3000" />
              </div>
              <div className="flex gap-2 pt-2">
                <button className="btn-primary flex-1">Admit</button>
                <button type="button" onClick={() => setShowAdmit(false)} className="btn-ghost">Cancel</button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
