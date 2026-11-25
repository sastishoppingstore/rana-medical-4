import { useEffect, useState, useMemo } from 'react';
import { Stethoscope, Activity, Plus, Trash2, Printer, Save, FileText } from 'lucide-react';
import { api } from '../../lib/api';
import { PageHeader, ErpCard, Spinner, Empty, StatusBadge } from './ErpUI';
import { useToast } from '../ui/primitives';
import { HOSPITAL, todayISO } from '../../lib/format';

interface Token { id: number; token_no: number; patient_id: number; doctor_id: number; status: string }
interface Medicine { id: number; generic_name: string; brand_name: string; sale_price: number; stock_qty: number }
interface PItem { medicine_id: number; medicine_name: string; strength: string; dosage: string; frequency: string; duration: string; instructions: string; quantity: number }

export default function Emr() {
  const toast = useToast();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Token | null>(null);
  const [vitals, setVitals] = useState({ bp: '', temperature: '', pulse: '', blood_sugar: '', weight: '', height: '', spo2: '' });
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [items, setItems] = useState<PItem[]>([]);
  const [med, setMed] = useState<number | ''>('');
  const [printRx, setPrintRx] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [t, p, m] = await Promise.all([
        api.get('/api/opd-tokens?status=with_doctor'), api.get('/api/patients'), api.get('/api/medicines'),
      ]);
      setTokens(t); setPatients(p); setMedicines(m);
    } catch { toast('Failed to load EMR', 'error'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const patientMap = useMemo(() => Object.fromEntries(patients.map((p) => [p.id, p])), [patients]);

  const addItem = () => {
    if (!med) return;
    const m = medicines.find((x) => x.id === med);
    if (!m) return;
    if (m.stock_qty <= 0) { toast('Medicine out of stock', 'error'); return; }
    setItems((prev) => [...prev, { medicine_id: m.id, medicine_name: `${m.generic_name} (${m.brand_name})`, strength: '', dosage: '1 tab', frequency: 'Once daily', duration: '5 days', instructions: 'After meals', quantity: 1 }]);
    setMed('');
  };

  const updateItem = (i: number, key: keyof PItem, val: any) => setItems((prev) => prev.map((x, idx) => idx === i ? { ...x, [key]: val } : x));

  const save = async () => {
    if (!selected) { toast('Select a patient from the queue', 'error'); return; }
    if (!diagnosis.trim()) { toast('Enter diagnosis', 'error'); return; }
    setSaving(true);
    try {
      const rx = await api.post('/api/prescriptions', {
        opd_token_id: selected.id, patient_id: selected.patient_id, doctor_id: selected.doctor_id,
        diagnosis, notes, follow_up: followUp || null,
      });
      for (const it of items) await api.post('/api/prescription-items', { prescription_id: rx.id, ...it });
      await api.post('/api/vitals', { opd_token_id: selected.id, ...vitals });
      await api.put('/api/opd-tokens', { id: selected.id, status: 'completed' });
      setPrintRx({ ...rx, patient: patientMap[selected.patient_id], items, diagnosis, notes, follow_up: followUp, vitals });
      toast('Prescription saved & printed-ready', 'success');
      setTokens((prev) => prev.filter((t) => t.id !== selected.id));
      setSelected(null); setItems([]); setDiagnosis(''); setNotes(''); setFollowUp(''); setVitals({ bp: '', temperature: '', pulse: '', blood_sugar: '', weight: '', height: '', spo2: '' });
    } catch (e: any) { toast(e.message, 'error'); }
    finally { setSaving(false); }
  };

  if (loading) return <Spinner label="Loading EMR…" />;

  return (
    <div>
      <PageHeader title="Doctor EMR & e-Prescription" subtitle="Manage your queue, record vitals and issue digital prescriptions." />

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Queue */}
        <ErpCard title={`My Queue (${tokens.length})`}>
          <div className="space-y-2 max-h-[70vh] overflow-y-auto">
            {tokens.length === 0 && <Empty msg="No patients currently with doctor." />}
            {tokens.map((t) => (
              <button key={t.id} onClick={() => setSelected(t)} className={`w-full text-left border rounded-xl p-3 transition ${selected?.id === t.id ? 'border-medical-teal bg-ice-mint' : 'border-soft-border hover:bg-ice-mint/50'}`}>
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-medical-teal to-royal-blue text-white grid place-items-center font-bold text-sm">#{t.token_no}</span>
                  <div className="text-sm">
                    <p className="font-semibold">{patientMap[t.patient_id]?.name || 'Patient'}</p>
                    <p className="text-xs text-slate-500">{patientMap[t.patient_id]?.mobile}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ErpCard>

        {/* Consultation */}
        <ErpCard title="Consultation">
          {!selected ? <Empty msg="Select a patient to begin." /> : (
            <div className="space-y-4">
              <div className="text-sm">
                <p className="font-display font-bold text-deep-navy">{patientMap[selected.patient_id]?.name}</p>
                <p className="text-slate-500">{patientMap[selected.patient_id]?.age}y · {patientMap[selected.patient_id]?.gender} · {patientMap[selected.patient_id]?.mobile}</p>
              </div>
              <div>
                <label className="label">Vitals</label>
                <div className="grid grid-cols-3 gap-2">
                  {[['bp', 'BP'], ['temperature', 'Temp °C'], ['pulse', 'Pulse'], ['blood_sugar', 'Sugar'], ['weight', 'Weight kg'], ['spo2', 'SpO2 %']].map(([k, lbl]) => (
                    <input key={k} className="input-field !py-1.5 text-sm" placeholder={lbl} value={(vitals as any)[k]} onChange={(e) => setVitals({ ...vitals, [k]: e.target.value })} />
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Diagnosis</label>
                <input className="input-field" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="Primary diagnosis" />
              </div>
              <div>
                <label className="label">Clinical Notes</label>
                <textarea className="input-field" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
              <div>
                <label className="label">Follow-up Date</label>
                <input type="date" className="input-field" value={followUp} onChange={(e) => setFollowUp(e.target.value)} />
              </div>
            </div>
          )}
        </ErpCard>

        {/* Prescription builder */}
        <ErpCard title="Prescription">
          {!selected ? <Empty msg="No active patient." /> : (
            <div className="space-y-3">
              <div className="flex gap-2">
                <select className="input-field" value={med} onChange={(e) => setMed(Number(e.target.value) || '')}>
                  <option value="">Add medicine…</option>
                  {medicines.filter((m) => m.stock_qty > 0).map((m) => <option key={m.id} value={m.id}>{m.generic_name} ({m.brand_name}) — {m.stock_qty} in stock</option>)}
                </select>
                <button onClick={addItem} className="btn-primary !px-3"><Plus size={16} /></button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {items.length === 0 && <Empty msg="No medicines added." />}
                {items.map((it, i) => (
                  <div key={i} className="border border-soft-border rounded-xl p-2 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <b>{it.medicine_name}</b>
                      <button onClick={() => setItems((p) => p.filter((_, idx) => idx !== i))} className="text-red-500"><Trash2 size={13} /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <input className="input-field !py-1" placeholder="Strength" value={it.strength} onChange={(e) => updateItem(i, 'strength', e.target.value)} />
                      <input className="input-field !py-1" placeholder="Dosage" value={it.dosage} onChange={(e) => updateItem(i, 'dosage', e.target.value)} />
                      <input className="input-field !py-1" placeholder="Frequency" value={it.frequency} onChange={(e) => updateItem(i, 'frequency', e.target.value)} />
                      <input className="input-field !py-1" placeholder="Duration" value={it.duration} onChange={(e) => updateItem(i, 'duration', e.target.value)} />
                      <input className="input-field !py-1" placeholder="Qty" type="number" value={it.quantity} onChange={(e) => updateItem(i, 'quantity', Number(e.target.value))} />
                      <input className="input-field !py-1" placeholder="Instructions" value={it.instructions} onChange={(e) => updateItem(i, 'instructions', e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={save} disabled={saving} className="btn-primary w-full"><Save size={16} /> {saving ? 'Saving…' : 'Save & Complete'}</button>
            </div>
          )}
        </ErpCard>
      </div>

      {/* Print prescription */}
      {printRx && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setPrintRx(null)} />
          <div className="relative card-premium p-8 w-full max-w-2xl print-area">
            <div className="flex items-center justify-between border-b-2 border-deep-navy pb-3 mb-4">
              <div>
                <h3 className="font-display font-extrabold text-xl text-deep-navy">{HOSPITAL.name}</h3>
                <p className="text-xs text-slate-500">{HOSPITAL.phone} · Prescription</p>
              </div>
              <FileText className="text-medical-teal" size={32} />
            </div>
            <div className="text-sm grid grid-cols-2 gap-2 mb-4">
              <p><span className="text-slate-400">Patient:</span> {printRx.patient?.name}</p>
              <p><span className="text-slate-400">Age/Sex:</span> {printRx.patient?.age} / {printRx.patient?.gender}</p>
              <p><span className="text-slate-400">Date:</span> {todayISO()}</p>
              <p><span className="text-slate-400">Rx #:</span> {printRx.id}</p>
            </div>
            <p className="text-sm mb-2"><span className="text-slate-400">Vitals:</span> BP {printRx.vitals.bp || '—'} · Temp {printRx.vitals.temperature || '—'} · Pulse {printRx.vitals.pulse || '—'} · SpO2 {printRx.vitals.spo2 || '—'}</p>
            <p className="text-sm mb-3"><span className="text-slate-400">Diagnosis:</span> {printRx.diagnosis}</p>
            <table className="w-full text-sm border-t">
              <thead><tr className="text-left text-slate-400"><th className="py-2">Medicine</th><th>Dosage</th><th>Frequency</th><th>Duration</th></tr></thead>
              <tbody>
                {printRx.items.map((it: PItem, i: number) => (
                  <tr key={i} className="border-t border-soft-border">
                    <td className="py-1.5 font-medium">{it.medicine_name} {it.strength}</td>
                    <td>{it.dosage}</td><td>{it.frequency}</td><td>{it.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-slate-400 mt-6">Signature: _________________ · {HOSPITAL.name} (Authorized Clinical Staff)</p>
            <div className="mt-4 flex gap-2 no-print">
              <button onClick={() => window.print()} className="btn-primary flex-1"><Printer size={15} /> Print</button>
              <button onClick={() => setPrintRx(null)} className="btn-ghost">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
