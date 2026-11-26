import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck, User, Phone, Stethoscope, Clock, CheckCircle2, MessageCircle, X } from 'lucide-react';
import { api } from '../../lib/api';
import { validateMobile, HOSPITAL } from '../../lib/format';
import { useToast } from '../ui/primitives';

interface Dept { id: number; name: string }
interface Doc { id: number; name: string; specialty: string; opd_days: string; opd_timings: string }

const SLOTS = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];

export default function AppointmentFinder() {
  const toast = useToast();
  const [depts, setDepts] = useState<Dept[]>([]);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [dept, setDept] = useState('');
  const [doctor, setDoctor] = useState('');
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    api.get('/api/departments').then(setDepts).catch(() => {});
  }, []);
  useEffect(() => {
    if (!dept) { setDocs([]); setDoctor(''); return; }
    api.get(`/api/doctors?department_id=${dept}`).then((d: Doc[]) => setDocs(d)).catch(() => {});
  }, [dept]);

  const selectedDoc = docs.find((d) => String(d.id) === String(doctor));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!dept) errs.dept = 'Please select a department';
    if (!doctor) errs.doctor = 'Please select a doctor';
    if (!date) errs.date = 'Please choose a date';
    if (!slot) errs.slot = 'Please choose a time slot';
    if (!name.trim()) errs.name = 'Patient name is required';
    if (!mobile.trim()) errs.mobile = 'Mobile number is required';
    else if (!validateMobile(mobile)) errs.mobile = 'Enter a valid Pakistani mobile number';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      const appt = await api.post('/api/appointments', {
        patient_name: name, mobile, department_id: dept, doctor_id: doctor,
        appointment_date: date, time_slot: slot,
      });
      setResult(appt);
      toast('Appointment booked! Token generated.', 'success');
    } catch (e: any) {
      toast(e.message || 'Booking failed', 'error');
    } finally { setLoading(false); }
  };

  const waLink = result
    ? `${HOSPITAL.whatsapp}?text=${encodeURIComponent(`My Appointment at ${HOSPITAL.name}\nRef: ${result.reference}\nToken: ${result.token}\nDate: ${result.appointment_date} ${result.time_slot}`)}`
    : '';

  return (
    <section id="appointment" className="section-pad bg-ice-mint/40">
      <div className="container-x px-4">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-block text-xs font-bold tracking-widest uppercase text-medical-teal bg-white px-3 py-1 rounded-full mb-3">Book in 60 seconds</span>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-deep-navy">Floating Appointment Finder</h2>
            <p className="mt-3 text-slate-500 max-w-md">Choose your specialist, pick a slot and receive a digital OPD token instantly. Your booking appears live in our reception & doctor queues.</p>
            <ul className="mt-6 space-y-3">
              {['Instant digital OPD token', 'Live sync to reception & doctor', 'WhatsApp confirmation', 'No waiting in phone queues'].map((t) => (
                <li key={t} className="flex items-center gap-2 text-sm font-medium text-deep-navy"><CheckCircle2 size={18} className="text-medical-teal" /> {t}</li>
              ))}
            </ul>
          </div>

          <motion.form onSubmit={submit} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="card-premium p-6 md:p-8 -mt-2 lg:-mt-16 relative z-10">
            <div className="flex items-center gap-2 mb-5">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-medical-teal to-royal-blue text-white grid place-items-center"><CalendarCheck size={18} /></span>
              <h3 className="font-display font-bold text-lg">Book Appointment</h3>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="label">Department</label>
                <select className="input-field" value={dept} onChange={(e) => setDept(e.target.value)}>
                  <option value="">Select department</option>
                  {depts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                {errors.dept && <p className="text-red-500 text-xs mt-1">{errors.dept}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="label">Doctor</label>
                <select className="input-field" value={doctor} onChange={(e) => setDoctor(e.target.value)} disabled={!dept}>
                  <option value="">{dept ? 'Select doctor' : 'Select department first'}</option>
                  {docs.map((d) => <option key={d.id} value={d.id}>{d.name} — {d.specialty}</option>)}
                </select>
                {selectedDoc && <p className="text-xs text-slate-500 mt-1">OPD: {selectedDoc.opd_days} · {selectedDoc.opd_timings}</p>}
                {errors.doctor && <p className="text-red-500 text-xs mt-1">{errors.doctor}</p>}
              </div>
              <div>
                <label className="label">Date</label>
                <input type="date" className="input-field" min={new Date().toISOString().slice(0, 10)} value={date} onChange={(e) => setDate(e.target.value)} />
                {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
              </div>
              <div>
                <label className="label">Time Slot</label>
                <select className="input-field" value={slot} onChange={(e) => setSlot(e.target.value)}>
                  <option value="">Select slot</option>
                  {SLOTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.slot && <p className="text-red-500 text-xs mt-1">{errors.slot}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="label">Patient Name</label>
                <input className="input-field" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="label">Mobile Number</label>
                <input className="input-field" placeholder="03XX-XXXXXXX" value={mobile} onChange={(e) => setMobile(e.target.value)} />
                {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-5 disabled:opacity-60">
              {loading ? 'Booking…' : 'Confirm Appointment'}
            </button>
          </motion.form>
        </div>
      </div>

      {/* Confirmation modal */}
      {result && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-deep-navy/50 backdrop-blur-sm" onClick={() => setResult(null)} />
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative card-premium p-8 max-w-md w-full text-center">
            <button className="absolute top-3 right-3" onClick={() => setResult(null)}><X size={18} className="text-slate-400" /></button>
            <div className="w-16 h-16 mx-auto rounded-full bg-[#fdeef0] text-medical-teal grid place-items-center mb-4"><CheckCircle2 size={34} /></div>
            <h3 className="font-display text-xl font-bold">Appointment Confirmed</h3>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between border-b pb-2"><span className="text-slate-500">Reference</span><b>{result.reference}</b></div>
              <div className="flex justify-between border-b pb-2"><span className="text-slate-500">OPD Token</span><b className="text-medical-teal text-lg">#{result.token}</b></div>
              <div className="flex justify-between border-b pb-2"><span className="text-slate-500">Date</span><b>{result.appointment_date}</b></div>
              <div className="flex justify-between"><span className="text-slate-500">Time</span><b>{result.time_slot}</b></div>
            </div>
            <a href={waLink} target="_blank" rel="noreferrer" className="btn-primary w-full mt-5"><MessageCircle size={18} /> Send to WhatsApp</a>
          </motion.div>
        </div>
      )}
    </section>
  );
}
