import { useEffect, useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { SectionHeading, Spinner } from '../ui/primitives';

interface Faq { id: number; question: string; answer: string }

export default function FAQ() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<number | null>(0);

  useEffect(() => {
    api.get('/api/faqs').then(setFaqs).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <section className="section-pad bg-ice-mint/40">
      <div className="container-x px-4 max-w-3xl">
        <SectionHeading eyebrow="FAQ" title="Frequently Asked Questions" />
        {loading ? <Spinner /> : (
          <div className="space-y-3">
            {faqs.map((f) => (
              <div key={f.id} className="card-premium overflow-hidden">
                <button onClick={() => setOpen(open === f.id ? null : f.id)} className="w-full flex items-center justify-between gap-4 p-5 text-left">
                  <span className="flex items-center gap-3 font-semibold text-deep-navy"><HelpCircle size={18} className="text-medical-teal" /> {f.question}</span>
                  <ChevronDown size={20} className={`text-slate-400 transition-transform ${open === f.id ? 'rotate-180' : ''}`} />
                </button>
                <div className={`accordion-body ${open === f.id ? 'open' : ''}`}>
                  <p className="px-5 pb-5 text-sm text-slate-500 leading-relaxed">{f.answer}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
