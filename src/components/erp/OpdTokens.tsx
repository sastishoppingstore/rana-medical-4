import { useEffect, useState, useMemo } from 'react';
import { UserPlus, Ticket, Search, Printer, CheckCircle2, Clock, XCircle, Smartphone, RefreshCw } from 'lucide-react';
import { api } from '../../lib/api';
import { PageHeader, ErpCard, Spinner, StatusBadge, Empty } from './ErpUI';
import { useToast } from '../ui/primitives';
import { HOSPITAL, validateMobile, todayISO } from '../../lib/format';

interface Patient { id: number; name: string; mobile: string; gender: string; age: number }
interface Doctor { id: number; name: string; specialty: string }
interface Token { id: number; token_no: number; patient_id: number; doctor_id: number; department_id: number; status: string; visit_date: string }
interface Appt { id: number; reference: string; patient_name: string; mobile: string; doctor_id: number; department_id: number; appointment_date: string; time_slot: string; token: number; status: string }

export default function OpdTokens() {
  const toast = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [appts, setAppts] = useState<Appt[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', mobile: '', gender: 'Male', age: '', doctor_id: '', department_id: '' });
  const [printTok, setPrintTok] = useState<any>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [p, d, t, a] = await Promise.all([
        api.get('/api/patients'), api.get('/api/doctors'), api.get('/api/opd-tokens'), api.get('/api/appointments?status=confirmed'),
      ]);
      setPatients(p); setDoctors(d); setTokens(t); setAppts(a);
    } catch { toast('Failed to load OPD data', 'error'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const patientMap = useMemo(() => Object.fromEntries(patients.map((p) => [p.id, p])), [patients]);
  const doctorMap = useMemo(() => Object.fromEntries(doctors.map((d) => [d.id, d])), [doctors]);
  const filteredPatients = patients.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.mobile.includes(search));

  const register = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.mobile.trim()) { toast('Name and mobile required', 'error'); return; }
    if (!validateMobile(form.mobile)) { toast('Invalid mobile number', 'error'); return; }
    try {
      const p = await api.post('/api/patients', { ...form, age: parseInt(form.age) || 0 });
      setPatients((prev) => [p, ...prev]);
      setForm({ name: '', mobile: '', gender: 'Male', age: '', doctor_id: '', department_id: '' });
      toast('Patient registered', 'success');
    } catch (e: any) { toast(e.message, 'error'); }
  };

  const genToken = async (patientId: number, doctorId?: number, deptId?: number) => {
    const did = doctorId ?? Number(form.doctor_id);
    const dep = deptId ?? Number(form.department_id);
    if (!did) { toast('Select a doctor for the token', 'error'); return; }
    try {
      const t = await api.post('/api/opd-tokens', { patient_id: patientId, doctor_id: did, department_id: dep });
      setTokens((prev) => [t, ...prev]);
      setPrintTok({ ...t, patient: patientMap[patientId] || patients.find((p) => p.id === patientId), doctor: doctorMap[did] });
      toast(`Token #${t.token_no} generated`, 'success');
    } catch (e: any) { toast(e.message, 'error'); }
  };

  const setStatus = async (id: number, status: string) => {
    try { const t = await api.put('/api/opd-tokens', { id, status }); setTokens((prev) => prev.map((x) => x.id === id ? t : x)); }
    catch (e: any) { toast(e.message, 'error'); }
  };

  const todayTokens = tokens.filter((t) => t.visit_date === todayISO());

  if (loading) return <Spinner label="Loading OPD…" />;

  return (
    <div>
      <PageHeader title="OPD & Token Management" subtitle="Register walk-ins, sync online appointments and manage the live queue." />

      {/* Online sync banner */}
      <ErpCard className="mb-5 border-l-4 border-l-medical-teal">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Smartphone size={18} className="text-medical-teal" />
            <span className="text-sm font-semibold text-deep-navy">{appts.length} online appointment(s) awaiting token</span>
          </div>
          <button onClick={load} className="btn-ghost !py-1.5 !px-3 text-sm"><RefreshCw size={14} /> Refresh</button>
        </div>
        {appts.length > 0 && (
          <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {appts.map((a) => (
              <div key={a.id} className="bg-ice-mint rounded-xl p-3 flex items-center justify-between">
                <div className="text-sm">
                  <p className="font-semibold">{a.patient_name}</p>
                  <p className="text-xs text-slate-500">Ref {a.reference} · #{a.token} · {a.time_slot}</p>
                </div>
                <button onClick={() => genToken(0, a.doctor_id, a.department_id)} className="btn-primary !py-1.5 !px-3 text-xs">Token</button>
              </div>
            ))}
          </div>
        )}
      </ErpCard>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Registration */}
        <ErpCard title="Patient Registration">
          <form onSubmit={register} className="space-y-3">
            <div>
              <label className="label">Patient Name</label>
              <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Mobile</label>
                <input className="input-field" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} placeholder="03XX-XXXXXXX" />
              </div>
              <div>
                <label className="label">Age</label>
                <input type="number" className="input-field" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} placeholder="Age" />
              </div>
            </div>
            <div>
              <label className="label">Gender</label>
              <select className="input-field" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div>
              <label className="label">Assign Doctor</label>
              <select className="input-field" value={form.doctor_id} onChange={(e) => setForm({ ...form, doctor_id: e.target.value })}>
                <option value="">Select doctor</option>
                {doctors.map((d) => <option key={d.id} value={d.id}>{d.name} — {d.specialty}</option>)}
              </select>
            </div>
            <button className="btn-primary w-full"><UserPlus size={16} /> Register & Generate Token</button>
          </form>
        </ErpCard>

        {/* Patient search */}
        <ErpCard title="Patient Search">
          <div className="relative mb-3">
            <Search size={16} className="absolute left-3 top-3 text-slate-400" />
            <input className="input-field pl-9" placeholder="Search name or mobile…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {filteredPatients.length === 0 && <Empty msg="No patients found." />}
            {filteredPatients.slice(0, 30).map((p) => (
              <div key={p.id} className="flex items-center justify-between bg-ice-mint rounded-xl p-3">
                <div className="text-sm">
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-xs text-slate-500">{p.mobile} · {p.age}y · {p.gender}</p>
                </div>
                <button onClick={() => genToken(p.id)} className="btn-ghost !py-1.5 !px-3 text-xs"><Ticket size={14} /> Token</button>
              </div>
            ))}
          </div>
        </ErpCard>

        {/* Live queue */}
        <ErpCard title={`Today's Queue (${todayTokens.length})`}>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {todayTokens.length === 0 && <Empty msg="No tokens generated today." />}
            {todayTokens.map((t) => {
              const pat = patientMap[t.patient_id];
              const doc = doctorMap[t.doctor_id];
              return (
                <div key={t.id} className="border border-soft-border rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-medical-teal to-royal-blue text-white grid place-items-center font-bold text-sm">#{t.token_no}</span>
                      <div className="text-sm">
                        <p className="font-semibold">{pat?.name || 'Online Appt'}</p>
                        <p className="text-xs text-slate-500">{doc?.name || '—'}</p>
                      </div>
                    </div>
                    <StatusBadge status={t.status} />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => setPrintTok({ ...t, patient: pat, doctor: doc })} className="btn-ghost !py-1 !px-2 text-xs"><Printer size={13} /></button>
                    {t.status === 'waiting' && <button onClick={() => setStatus(t.id, 'with_doctor')} className="btn-ghost !py-1 !px-2 text-xs text-blue-600"><Clock size={13} /> Call</button>}
                    {t.status === 'with_doctor' && <button onClick={() => setStatus(t.id, 'completed')} className="btn-ghost !py-1 !px-2 text-xs text-emerald-600"><CheckCircle2 size={13} /> Done</button>}
                    {(t.status === 'waiting' || t.status === 'with_doctor') && <button onClick={() => setStatus(t.id, 'cancelled')} className="btn-ghost !py-1 !px-2 text-xs text-red-500"><XCircle size={13} /></button>}
                  </div>
                </div>
              );
            })}
          </div>
        </ErpCard>
      </div>

      {/* Print token modal */}
      {printTok && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setPrintTok(null)} />
          <div className="relative card-premium p-8 w-full max-w-sm print-area">
            <div className="text-center border-b pb-3 mb-3">
              <h3 className="font-display font-extrabold text-deep-navy">{HOSPITAL.name}</h3>
              <p className="text-xs text-slate-500">{HOSPITAL.phone}</p>
            </div>
            <div className="text-center my-4">
              <p className="text-xs text-slate-400">OPD TOKEN</p>
              <p className="font-display text-5xl font-extrabold text-medical-teal">#{printTok.token_no}</p>
            </div>
            <div className="text-sm space-y-1">
              <p><span className="text-slate-400">Patient:</span> {printTok.patient?.name || '—'}</p>
              <p><span className="text-slate-400">Doctor:</span> {printTok.doctor?.name || '—'}</p>
              <p><span className="text-slate-400">Date:</span> {todayISO()}</p>
            </div>
            <div className="mt-4 flex gap-2 no-print">
              <button onClick={() => window.print()} className="btn-primary flex-1"><Printer size={15} /> Print</button>
              <button onClick={() => setPrintTok(null)} className="btn-ghost">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
