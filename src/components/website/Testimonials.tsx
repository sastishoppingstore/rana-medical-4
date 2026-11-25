import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../../lib/api';
import { SectionHeading, Spinner } from '../ui/primitives';
import Avatar from '../ui/Avatar';

interface Review { id: number; name: string; rating: number; department: string; feedback: string; review_date: string }

export default function Testimonials() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    api.get('/api/testimonials').then(setReviews).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const prev = () => setIdx((i) => (i - 1 + reviews.length) % reviews.length);
  const next = () => setIdx((i) => (i + 1) % reviews.length);
  const cur = reviews[idx];

  return (
    <section className="section-pad">
      <div className="container-x px-4 max-w-3xl">
        <SectionHeading eyebrow="Patient Stories" title="What Our Patients Say" />
        {loading ? <Spinner /> : reviews.length === 0 ? <p className="text-center text-slate-400">No reviews yet.</p> : (
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div key={cur.id} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                className="card-premium p-8 text-center">
                <Quote className="mx-auto text-medical-teal/30" size={40} />
                <div className="flex justify-center gap-1 my-3">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={18} className={i < cur.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />)}
                </div>
                <p className="text-slate-600 italic leading-relaxed">"{cur.feedback}"</p>
                <div className="mt-5 flex items-center justify-center gap-3">
                  <Avatar name={cur.name} size={48} />
                  <div className="text-left">
                    <p className="font-display font-bold text-deep-navy">{cur.name}</p>
                    <p className="text-xs text-slate-400">{cur.department} · {cur.review_date}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            <button onClick={prev} className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 w-10 h-10 rounded-full glass shadow-soft grid place-items-center"><ChevronLeft size={20} /></button>
            <button onClick={next} className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 w-10 h-10 rounded-full glass shadow-soft grid place-items-center"><ChevronRight size={20} /></button>
            <div className="flex justify-center gap-2 mt-5">
              {reviews.map((_, i) => <button key={i} onClick={() => setIdx(i)} className={`w-2.5 h-2.5 rounded-full ${i === idx ? 'bg-medical-teal' : 'bg-slate-300'}`} />)}
            </div>
            <p className="text-center text-xs text-slate-300 mt-4">Sample reviews for demonstration — replace with consented patient feedback.</p>
          </div>
        )}
      </div>
    </section>
  );
}
