import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Printer, ShieldCheck, ArrowUp, ArrowDown, Minus, QrCode } from 'lucide-react';
import { api } from '../../lib/api';
import { SectionHeading, useToast } from '../ui/primitives';
import { HOSPITAL } from '../../lib/format';

interface ReportRow { test: string; result: string; unit: string; range: string; flag: 'H' | 'L' | 'N' }
interface Report {
  report_no: string; patient_name: string; mobile: string; sample_date: string;
  authorized: boolean; tests: ReportRow[];
}

export default function LabReportPortal() {
  const toast = useToast();
  const [ref, setRef] = useState('');
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [notFound, setNotFound] = useState(false);

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ref.trim() || !mobile.trim()) { toast('Enter both reference and mobile', 'error'); return; }
    setLoading(true); setNotFound(false); setReport(null);
    try {
      const r = await api.get(`/api/lab-reports?ref=${encodeURIComponent(ref)}&mobile=${encodeURIComponent(mobile)}`);
      if (r && r.report_no) setReport(r); else setNotFound(true);
    } catch { setNotFound(true); }
    finally { setLoading(false); }
  };

  const flagIcon = (f: string) => f === 'H' ? <ArrowUp size={14} className="text-red-500" /> : f === 'L' ? <ArrowDown size={14} className="text-amber-500" /> : <Minus size={14} className="text-slate-300" />;

  return (
    <section id="lab" className="section-pad bg-ice-mint/40">
      <div className="container-x px-4 max-w-3xl">
        <SectionHeading eyebrow="Online Lab Reports" title="Verify Your Lab Report" subtitle="Enter your lab reference number and registered mobile to securely view authorized results." />
        <form onSubmit={search} className="card-premium p-6 flex flex-col sm:flex-row gap-3">
          <input className="input-field flex-1" placeholder="Patient ID / Lab Reference (e.g. RMH-LAB-0001)" value={ref} onChange={(e) => setRef(e.target.value)} />
          <input className="input-field flex-1" placeholder="Registered Mobile (e.g. 03246627054)" value={mobile} onChange={(e) => setMobile(e.target.value)} />
          <button className="btn-primary whitespace-nowrap" disabled={loading}>{loading ? 'Searching…' : <><Search size={16} /> Verify</>}</button>
        </form>
        <p className="text-xs text-slate-400 mt-2 text-center">Demo record — Reference: <b>RMH-LAB-0001</b> · Mobile: <b>03246627054</b>. Reports are fictional.</p>

        {notFound && <div className="mt-6 card-premium p-6 text-center text-slate-500">No authorized report found for these details.</div>}

        {report && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
            <div id="lab-report-print" className="print-area card-premium p-7">
              <div className="flex items-center justify-between border-b pb-4 mb-4">
                <div>
                  <h3 className="font-display font-extrabold text-xl text-deep-navy">{HOSPITAL.name}</h3>
                  <p className="text-xs text-slate-500">{HOSPITAL.phone} · Pathology & Diagnostic Laboratory</p>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <p>Report # {report.report_no}</p>
                  <p>Sample: {report.sample_date}</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-2 text-sm mb-4">
                <p><span className="text-slate-400">Patient:</span> <b>{report.patient_name}</b></p>
                <p><span className="text-slate-400">Mobile:</span> {report.mobile}</p>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-400 border-b">
                    <th className="py-2">Test</th><th>Result</th><th>Unit</th><th>Reference</th><th>Flag</th>
                  </tr>
                </thead>
                <tbody>
                  {report.tests.map((t, i) => (
                    <tr key={i} className="border-b border-soft-border">
                      <td className="py-2 font-medium">{t.test}</td>
                      <td className="font-bold">{t.result}</td>
                      <td className="text-slate-500">{t.unit}</td>
                      <td className="text-slate-500">{t.range}</td>
                      <td>{flagIcon(t.flag)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-5 flex items-center justify-between">
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full ${report.authorized ? 'bg-[#fdeef0] text-[#8f1d28]' : 'bg-amber-100 text-amber-700'}`}>
                  <ShieldCheck size={14} /> {report.authorized ? 'Authorized & Published' : 'Pending Authorization'}
                </span>
                <span className="flex items-center gap-2 text-slate-400 text-xs"><QrCode size={40} /> Scan to verify authenticity</span>
              </div>
            </div>
            <div className="no-print mt-4 flex gap-3">
              <button onClick={() => window.print()} className="btn-ghost"><Printer size={16} /> Print Report</button>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
