import { useEffect, useState, useMemo } from 'react';
import { FlaskConical, Plus, CheckCircle2, ShieldCheck, Send, Search } from 'lucide-react';
import { api } from '../../lib/api';
import { PageHeader, ErpCard, Spinner, Empty, StatusBadge } from './ErpUI';
import { useToast } from '../ui/primitives';
import { PKR, todayISO } from '../../lib/format';

interface Test { id: number; name: string; category: string; price: number; unit: string; reference_range: string }
interface Sample { id: number; patient_id: number; test_id: number; status: string; result_value: string; flag: string; verified: boolean }
interface Patient { id: number; name: string; mobile: string; patient_code: string }

export default function Lab() {
  const toast = useToast();
  const [tests, setTests] = useState<Test[]>([]);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ patient_id: '', test_id: '' });
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Sample | null>(null);
  const [resultValue, setResultValue] = useState('');
  const [flag, setFlag] = useState<'N' | 'H' | 'L'>('N');

  const load = async () => {
    setLoading(true);
    try {
      const [t, s, p] = await Promise.all([api.get('/api/lab-tests'), api.get('/api/lab-samples'), api.get('/api/patients')]);
      setTests(t); setSamples(s); setPatients(p);
    } catch { toast('Failed to load lab', 'error'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const testMap = useMemo(() => Object.fromEntries(tests.map((t) => [t.id, t])), [tests]);
  const patientMap = useMemo(() => Object.fromEntries(patients.map((p) => [p.id, p])), [patients]);
  const filteredPatients = patients.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.mobile.includes(search) || (p.patient_code || '').includes(search));

  const register = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patient_id || !form.test_id) { toast('Select patient and test', 'error'); return; }
    try {
      const s = await api.post('/api/lab-samples', { patient_id: Number(form.patient_id), test_id: Number(form.test_id) });
      setSamples((prev) => [s, ...prev]);
      setForm({ patient_id: '', test_id: '' });
      toast('Sample registered', 'success');
    } catch (e: any) { toast(e.message, 'error'); }
  };

  const saveResult = async () => {
    if (!editing || !resultValue.trim()) { toast('Enter result value', 'error'); return; }
    try {
      await api.post('/api/lab-results', { sample_id: editing.id, result_value: resultValue, flag });
      await api.put('/api/lab-samples', { id: editing.id, status: 'entered', result_value: resultValue, flag });
      setSamples((prev) => prev.map((x) => x.id === editing.id ? { ...x, status: 'entered', result_value: resultValue, flag } : x));
      setEditing(null); setResultValue(''); setFlag('N');
      toast('Result entered', 'success');
    } catch (e: any) { toast(e.message, 'error'); }
  };

  const verify = async (s: Sample) => {
    try {
      await api.put('/api/lab-results', { sample_id: s.id, verified: true });
      await api.put('/api/lab-samples', { id: s.id, verified: true });
      setSamples((prev) => prev.map((x) => x.id === s.id ? { ...x, verified: true } : x));
      toast('Result verified', 'success');
    } catch (e: any) { toast(e.message, 'error'); }
  };

  const publish = async (s: Sample) => {
    const pid = s.patient_id;
    const entered = samples.filter((x) => x.patient_id === pid && x.status === 'entered');
    if (entered.length === 0) { toast('No entered results to publish', 'error'); return; }
    try {
      const report = {
        patient_id: pid, mobile: patientMap[pid]?.mobile, sample_date: todayISO(), authorized: true,
        tests: entered.map((x) => ({ test: testMap[x.test_id]?.name, result: x.result_value, unit: testMap[x.test_id]?.unit, range: testMap[x.test_id]?.reference_range, flag: x.flag })),
      };
      await api.post('/api/lab-reports', report);
      await Promise.all(entered.map((x) => api.put('/api/lab-samples', { id: x.id, status: 'published' })));
      setSamples((prev) => prev.map((x) => (x.patient_id === pid && x.status === 'entered') ? { ...x, status: 'published' } : x));
      toast('Report authorized & published to portal', 'success');
    } catch (e: any) { toast(e.message, 'error'); }
  };

  if (loading) return <Spinner label="Loading laboratory…" />;

  return (
    <div>
      <PageHeader title="Pathology & Diagnostic Lab" subtitle="Register samples, enter & verify results, then publish authorized reports." />

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Catalog + register */}
        <ErpCard title="Test Catalog & Sample Registration">
          <form onSubmit={register} className="space-y-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-3 text-slate-400" />
              <input className="input-field pl-9" placeholder="Search patient…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select className="input-field" value={form.patient_id} onChange={(e) => setForm({ ...form, patient_id: e.target.value })}>
              <option value="">Select patient</option>
              {filteredPatients.slice(0, 40).map((p) => <option key={p.id} value={p.id}>{p.name} — {p.mobile}</option>)}
            </select>
            <select className="input-field" value={form.test_id} onChange={(e) => setForm({ ...form, test_id: e.target.value })}>
              <option value="">Select test</option>
              {tests.map((t) => <option key={t.id} value={t.id}>{t.name} — {PKR(t.price)}</option>)}
            </select>
            <button className="btn-primary w-full"><Plus size={16} /> Register Sample</button>
          </form>
          <div className="mt-4 border-t pt-3">
            <p className="text-xs font-bold text-slate-400 mb-2">CATALOG ({tests.length})</p>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {tests.map((t) => (
                <div key={t.id} className="flex justify-between text-sm"><span>{t.name}</span><span className="text-slate-400">{PKR(t.price)}</span></div>
              ))}
            </div>
          </div>
        </ErpCard>

        {/* Queue */}
        <ErpCard title={`Lab Queue (${samples.length})`} className="lg:col-span-2">
          <div className="space-y-2">
            {samples.length === 0 && <Empty msg="No samples in queue." />}
            {samples.map((s) => (
              <div key={s.id} className="flex items-center justify-between border border-soft-border rounded-xl p-3">
                <div className="text-sm">
                  <p className="font-semibold">{patientMap[s.patient_id]?.name || 'Patient'}</p>
                  <p className="text-xs text-slate-500">{testMap[s.test_id]?.name} {s.result_value && `· Result: ${s.result_value} ${testMap[s.test_id]?.unit || ''} ${s.flag !== 'N' ? `(${s.flag})` : ''}`}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={s.status} />
                  {s.status === 'collected' && <button onClick={() => { setEditing(s); setResultValue(''); setFlag('N'); }} className="btn-ghost !py-1.5 !px-3 text-xs"><FlaskConical size={14} /> Result</button>}
                  {s.status === 'entered' && !s.verified && <button onClick={() => verify(s)} className="btn-ghost !py-1.5 !px-3 text-xs text-[#23244a]"><CheckCircle2 size={14} /> Verify</button>}
                  {s.status === 'entered' && s.verified && <button onClick={() => publish(s)} className="btn-primary !py-1.5 !px-3 text-xs"><Send size={14} /> Publish</button>}
                  {s.status === 'published' && <span className="text-xs text-[#a02030] flex items-center gap-1"><ShieldCheck size={14} /> Published</span>}
                </div>
              </div>
            ))}
          </div>
        </ErpCard>
      </div>

      {/* Result entry modal */}
      {editing && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setEditing(null)} />
          <div className="relative card-premium p-6 w-full max-w-sm">
            <h3 className="font-display font-bold mb-1">Enter Result</h3>
            <p className="text-sm text-slate-500 mb-4">{testMap[editing.test_id]?.name} · Ref: {testMap[editing.test_id]?.reference_range}</p>
            <div className="space-y-3">
              <div>
                <label className="label">Result Value</label>
                <input className="input-field" value={resultValue} onChange={(e) => setResultValue(e.target.value)} placeholder={`in ${testMap[editing.test_id]?.unit}`} />
              </div>
              <div>
                <label className="label">Flag</label>
                <select className="input-field" value={flag} onChange={(e) => setFlag(e.target.value as any)}>
                  <option value="N">Normal</option><option value="H">High (H)</option><option value="L">Low (L)</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={saveResult} className="btn-primary flex-1">Save Result</button>
                <button onClick={() => setEditing(null)} className="btn-ghost">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
