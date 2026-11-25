import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, User, ArrowRight } from 'lucide-react';
import { api } from '../../lib/api';
import { SectionHeading, Spinner, EmptyState, Modal } from '../ui/primitives';
import { formatDate } from '../../lib/format';

interface Post { id: number; title: string; excerpt: string; content: string; author: string; image_url: string; published_at: string }

export default function Blog() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Post | null>(null);

  useEffect(() => {
    api.get('/api/blog').then(setPosts).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <section className="section-pad bg-ice-mint/40">
      <div className="container-x px-4">
        <SectionHeading eyebrow="Health Blog" title="Medical Insights & Tips" subtitle="Evidence-based articles from our clinical team." />
        {loading ? <Spinner /> : posts.length === 0 ? <EmptyState message="No articles published." /> : (
          <div className="grid md:grid-cols-3 gap-5">
            {posts.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 3) * 0.08 }}
                className="card-premium overflow-hidden flex flex-col">
                <img src={p.image_url || '/images/medical-team.jpg'} alt={p.title} className="h-44 w-full object-cover" />
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-3 text-xs text-slate-400 mb-2">
                    <span className="flex items-center gap-1"><CalendarDays size={13} /> {formatDate(p.published_at)}</span>
                    <span className="flex items-center gap-1"><User size={13} /> {p.author}</span>
                  </div>
                  <h3 className="font-display font-bold text-deep-navy leading-snug">{p.title}</h3>
                  <p className="text-sm text-slate-500 mt-2 line-clamp-3 flex-1">{p.excerpt}</p>
                  <button onClick={() => setActive(p)} className="mt-4 text-sm font-semibold text-medical-teal flex items-center gap-1 hover:gap-2 transition-all">Read More <ArrowRight size={15} /></button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Modal open={!!active} onClose={() => setActive(null)} title={active?.title} wide>
        {active && (
          <div>
            <img src={active.image_url || '/images/medical-team.jpg'} alt="" className="w-full h-56 object-cover rounded-2xl mb-4" />
            <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
              <span className="flex items-center gap-1"><CalendarDays size={13} /> {formatDate(active.published_at)}</span>
              <span className="flex items-center gap-1"><User size={13} /> {active.author}</span>
            </div>
            <p className="text-slate-600 leading-relaxed whitespace-pre-line">{active.content}</p>
          </div>
        )}
      </Modal>
    </section>
  );
}
