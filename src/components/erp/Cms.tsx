import { useEffect, useState } from 'react';
import { Users, LayoutGrid, Package, FileText, HelpCircle, MessageSquare, Inbox, Plus, Trash2, Pencil } from 'lucide-react';
import { api } from '../../lib/api';
import { PageHeader, ErpCard, Spinner, Empty } from './ErpUI';
import { useToast } from '../ui/primitives';
import { Modal } from '../ui/primitives';
import { PKR } from '../../lib/format';

const TABS = [
  { key: 'doctors', label: 'Doctors', Icon: Users },
  { key: 'services', label: 'Services', Icon: LayoutGrid },
  { key: 'packages', label: 'Packages', Icon: Package },
  { key: 'blog', label: 'Blog', Icon: FileText },
  { key: 'faqs', label: 'FAQs', Icon: HelpCircle },
  { key: 'testimonials', label: 'Reviews', Icon: MessageSquare },
  { key: 'inquiries', label: 'Inquiries', Icon: Inbox },
];

export default function Cms() {
  const toast = useToast();
  const [tab, setTab] = useState('doctors');
  const [doctors, setDoctors] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [blog, setBlog] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [d, s, p, b, f, t, i] = await Promise.all([
        api.get('/api/doctors'), api.get('/api/services'), api.get('/api/packages'),
        api.get('/api/blog'), api.get('/api/faqs'), api.get('/api/testimonials'), api.get('/api/inquiries'),
      ]);
      setDoctors(d); setServices(s); setPackages(p); setBlog(b); setFaqs(f); setTestimonials(t); setInquiries(i);
    } catch { toast('Failed to load CMS data', 'error'); }
    finally { setLoading(false); }
  };
  useEffect(() => { loadAll(); }, []);

  const del = async (resource: string, id: number) => {
    if (!confirm('Delete this record?')) return;
    try { await api.del(`/api/${resource}`, { id }); toast('Deleted', 'success'); loadAll(); }
    catch (e: any) { toast(e.message, 'error'); }
  };

  const blank = (resource: string) => {
    const maps: Record<string, any> = {
      doctors: { name: '', specialty: '', category: 'Medicine', qualifications: '', pmdc: '', experience: 0, fee: 0, opd_days: '', opd_timings: '', available_slots: 5 },
      services: { title: '', description: '', icon: 'Stethoscope', image_url: '' },
      packages: { title: '', price_pkr: 0, description: '', tests: [], consultations: '', is_popular: false },
      blog: { title: '', excerpt: '', content: '', author: 'Editorial Team', image_url: '', published_at: new Date().toISOString().slice(0, 10) },
      faqs: { question: '', answer: '', order_index: 1 },
      testimonials: { name: '', rating: 5, department: '', feedback: '', review_date: new Date().toISOString().slice(0, 10) },
    };
    return maps[resource] || {};
  };

  const save = async (resource: string) => {
    try {
      if (editing?.id) await api.put(`/api/${resource}`, editing);
      else await api.post(`/api/${resource}`, editing);
      toast('Saved', 'success'); setShowForm(false); setEditing(null); loadAll();
    } catch (e: any) { toast(e.message, 'error'); }
  };

  const openAdd = () => { setEditing(blank(tab)); setShowForm(true); };
  const openEdit = (row: any) => { setEditing({ ...row, tests: row.tests || [] }); setShowForm(true); };

  if (loading) return <Spinner label="Loading CMS…" />;

  const data: Record<string, any[]> = { doctors, services, packages, blog, faqs, testimonials, inquiries };

  return (
    <div>
      <PageHeader title="Website CMS" subtitle="Manage all public website content from one console." action={
        tab !== 'inquiries' && <button onClick={openAdd} className="btn-primary"><Plus size={16} /> Add {TABS.find((t) => t.key === tab)?.label.slice(0, -1)}</button>
      } />

      <div className="flex flex-wrap gap-2 mb-5">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${tab === t.key ? 'bg-medical-teal text-white shadow-premium' : 'bg-white border border-soft-border text-slate-600 hover:border-medical-teal'}`}>
            <t.Icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      <ErpCard>
        <div className="space-y-2">
          {data[tab].length === 0 && <Empty msg="Nothing here yet. Click Add to create one." />}
          {tab === 'doctors' && doctors.map((d) => (
            <Row key={d.id} title={d.name} sub={`${d.specialty} · ${d.category} · ${PKR(d.fee)}`} onEdit={() => openEdit(d)} onDel={() => del('doctors', d.id)} />
          ))}
          {tab === 'services' && services.map((s) => (
            <Row key={s.id} title={s.title} sub={s.description?.slice(0, 60)} onEdit={() => openEdit(s)} onDel={() => del('services', s.id)} />
          ))}
          {tab === 'packages' && packages.map((p) => (
            <Row key={p.id} title={p.title} sub={PKR(p.price_pkr)} onEdit={() => openEdit(p)} onDel={() => del('packages', p.id)} />
          ))}
          {tab === 'blog' && blog.map((b) => (
            <Row key={b.id} title={b.title} sub={b.author} onEdit={() => openEdit(b)} onDel={() => del('blog', b.id)} />
          ))}
          {tab === 'faqs' && faqs.map((f) => (
            <Row key={f.id} title={f.question} sub={f.answer?.slice(0, 60)} onEdit={() => openEdit(f)} onDel={() => del('faqs', f.id)} />
          ))}
          {tab === 'testimonials' && testimonials.map((t) => (
            <Row key={t.id} title={t.name} sub={`${'★'.repeat(t.rating)} · ${t.department}`} onEdit={() => openEdit(t)} onDel={() => del('testimonials', t.id)} />
          ))}
          {tab === 'inquiries' && inquiries.map((i) => (
            <div key={i.id} className="border border-soft-border rounded-xl p-3 text-sm">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{i.name} <span className="text-xs text-slate-400">· {i.phone || i.email}</span></p>
                <span className={`text-[11px] px-2 py-0.5 rounded-full ${i.status === 'resolved' ? 'bg-[#fdeef0] text-[#8f1d28]' : 'bg-amber-100 text-amber-700'}`}>{i.status}</span>
              </div>
              <p className="text-slate-500 mt-1">{i.message}</p>
            </div>
          ))}
        </div>
      </ErpCard>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing?.id ? 'Edit' : 'Add'} wide>
        {editing && (
          <CmsForm resource={tab} value={editing} onChange={setEditing} onSave={() => save(tab)} />
        )}
      </Modal>
    </div>
  );
}

function Row({ title, sub, onEdit, onDel }: { title: string; sub?: string; onEdit: () => void; onDel: () => void }) {
  return (
    <div className="flex items-center justify-between border border-soft-border rounded-xl p-3">
      <div className="text-sm min-w-0">
        <p className="font-semibold truncate">{title}</p>
        {sub && <p className="text-xs text-slate-500 truncate">{sub}</p>}
      </div>
      <div className="flex gap-2 shrink-0">
        <button onClick={onEdit} className="btn-ghost !py-1.5 !px-3 text-xs"><Pencil size={14} /> Edit</button>
        <button onClick={onDel} className="btn-ghost !py-1.5 !px-3 text-xs text-red-500"><Trash2 size={14} /></button>
      </div>
    </div>
  );
}

function CmsForm({ resource, value, onChange, onSave }: { resource: string; value: any; onChange: (v: any) => void; onSave: () => void }) {
  const set = (k: string, v: any) => onChange({ ...value, [k]: v });
  const field = (k: string, label: string, type = 'text') => (
    <div>
      <label className="label">{label}</label>
      <input className="input-field" type={type} value={value[k] ?? ''} onChange={(e) => set(k, type === 'number' ? Number(e.target.value) : e.target.value)} />
    </div>
  );
  return (
    <div className="space-y-3">
      {resource === 'doctors' && (
        <>
          {field('name', 'Name')}
          <div className="grid grid-cols-2 gap-3">{field('specialty', 'Specialty')}{field('category', 'Category')}</div>
          {field('qualifications', 'Qualifications')}
          <div className="grid grid-cols-2 gap-3">{field('pmdc', 'PMDC')}{field('experience', 'Experience (yrs)', 'number')}</div>
          <div className="grid grid-cols-2 gap-3">{field('fee', 'Fee (PKR)', 'number')}{field('available_slots', 'Available Slots', 'number')}</div>
          {field('opd_days', 'OPD Days')}
          {field('opd_timings', 'OPD Timings')}
        </>
      )}
      {resource === 'services' && (
        <>{field('title', 'Title')}{field('icon', 'Icon (lucide name)')}{field('image_url', 'Image URL')}
          <div><label className="label">Description</label><textarea className="input-field" rows={3} value={value.description ?? ''} onChange={(e) => set('description', e.target.value)} /></div>
        </>
      )}
      {resource === 'packages' && (
        <>{field('title', 'Title')}{field('price_pkr', 'Price (PKR)', 'number')}
          <div><label className="label">Description</label><textarea className="input-field" rows={2} value={value.description ?? ''} onChange={(e) => set('description', e.target.value)} /></div>
          <div><label className="label">Included Tests (comma separated)</label><input className="input-field" value={(value.tests || []).join(', ')} onChange={(e) => set('tests', e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean))} /></div>
          {field('consultations', 'Consultations')}
        </>
      )}
      {resource === 'blog' && (
        <>{field('title', 'Title')}{field('author', 'Author')}{field('image_url', 'Image URL')}
          <div><label className="label">Excerpt</label><textarea className="input-field" rows={2} value={value.excerpt ?? ''} onChange={(e) => set('excerpt', e.target.value)} /></div>
          <div><label className="label">Content</label><textarea className="input-field" rows={5} value={value.content ?? ''} onChange={(e) => set('content', e.target.value)} /></div>
        </>
      )}
      {resource === 'faqs' && (
        <>{field('question', 'Question')}
          <div><label className="label">Answer</label><textarea className="input-field" rows={3} value={value.answer ?? ''} onChange={(e) => set('answer', e.target.value)} /></div>
          {field('order_index', 'Order', 'number')}
        </>
      )}
      {resource === 'testimonials' && (
        <>{field('name', 'Name')}{field('department', 'Department')}{field('rating', 'Rating (1-5)', 'number')}
          <div><label className="label">Feedback</label><textarea className="input-field" rows={3} value={value.feedback ?? ''} onChange={(e) => set('feedback', e.target.value)} /></div>
        </>
      )}
      <button onClick={onSave} className="btn-primary w-full">Save</button>
    </div>
  );
}
